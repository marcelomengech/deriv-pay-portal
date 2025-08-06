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
    const callbackData = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    const { Body } = callbackData;
    const { stkCallback } = Body;

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    let transactionStatus = 'failed';
    let mpesaReceiptNumber = null;
    let transactionDate = null;
    let phoneNumber = null;

    if (ResultCode === 0) {
      // Payment successful
      transactionStatus = 'completed';
      
      if (CallbackMetadata && CallbackMetadata.Item) {
        for (const item of CallbackMetadata.Item) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              mpesaReceiptNumber = item.Value;
              break;
            case 'TransactionDate':
              transactionDate = item.Value;
              break;
            case 'PhoneNumber':
              phoneNumber = item.Value;
              break;
          }
        }
      }
    } else {
      console.log('Payment failed:', ResultDesc);
    }

    // Update transaction in database
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: transactionStatus,
        mpesa_receipt_number: mpesaReceiptNumber,
        mpesa_transaction_date: transactionDate,
        mpesa_phone_number: phoneNumber,
        mpesa_result_desc: ResultDesc,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_request_id', MerchantRequestID)
      .eq('checkout_request_id', CheckoutRequestID);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
    } else {
      console.log('Transaction updated successfully');
    }

    // Return success response to M-Pesa
    return new Response(JSON.stringify({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return new Response(JSON.stringify({
      ResultCode: 1,
      ResultDesc: 'Failed to process callback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});