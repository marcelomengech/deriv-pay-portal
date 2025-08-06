import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, accountReference, transactionDesc, environment = 'sandbox' } = await req.json();

    // Get M-Pesa credentials based on environment
    const consumerKey = environment === 'sandbox' 
      ? Deno.env.get('MPESA_SANDBOX_CONSUMER_KEY')
      : Deno.env.get('MPESA_CONSUMER_KEY');
    
    const consumerSecret = environment === 'sandbox'
      ? Deno.env.get('MPESA_SANDBOX_CONSUMER_SECRET')
      : Deno.env.get('MPESA_CONSUMER_SECRET');
    
    const businessShortCode = environment === 'sandbox'
      ? Deno.env.get('MPESA_SANDBOX_BUSINESS_SHORTCODE')
      : Deno.env.get('MPESA_BUSINESS_SHORTCODE');
    
    const passkey = environment === 'sandbox'
      ? Deno.env.get('MPESA_SANDBOX_PASSKEY')
      : Deno.env.get('MPESA_PASSKEY');

    if (!consumerKey || !consumerSecret || !businessShortCode || !passkey) {
      throw new Error(`Missing M-Pesa ${environment} credentials`);
    }

    // Generate access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const authUrl = environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

    // Prepare STK Push request
    const stkUrl = environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;

    const stkPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: businessShortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    console.log('STK Push payload:', stkPayload);

    const stkResponse = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkResponse.json();
    console.log('STK Push response:', stkData);

    if (stkData.ResponseCode === '0') {
      // Store transaction in database
      const { error: dbError } = await supabase
        .from('transactions')
        .insert({
          merchant_request_id: stkData.MerchantRequestID,
          checkout_request_id: stkData.CheckoutRequestID,
          transaction_type: 'deposit',
          amount: parseFloat(amount),
          currency: 'KES',
          payment_method: 'mpesa',
          status: 'pending',
          reference_number: accountReference,
          notes: `M-Pesa payment: ${transactionDesc}`,
          agent_id: null, // Will be updated when we know the user
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return new Response(JSON.stringify(stkData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      ResponseCode: '1',
      ResponseDescription: 'Failed to initiate payment'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});