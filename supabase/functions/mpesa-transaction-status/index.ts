import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutRequestId, environment = 'sandbox' } = await req.json();

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

    // Query transaction status
    const queryUrl = environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

    const queryPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    const queryData = await queryResponse.json();
    console.log('Transaction status query response:', queryData);

    return new Response(JSON.stringify(queryData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('M-Pesa transaction status error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      ResponseCode: '1',
      ResponseDescription: 'Failed to query transaction status'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});