import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { accounts } = await req.json();

    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ error: 'No Deriv accounts provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the first account for authentication
    const primaryAccount = accounts[0];
    const { accountId, token, currency } = primaryAccount;

    // Validate the token with Deriv API
    const derivResponse = await fetch('https://ws.derivws.com/websockets/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorize: token
      })
    });

    if (!derivResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to validate Deriv token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const derivData = await derivResponse.json();
    
    if (derivData.error) {
      return new Response(JSON.stringify({ error: 'Invalid Deriv token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract user information from Deriv response
    const derivUser = derivData.authorize;
    const email = derivUser.email;
    const fullName = derivUser.fullname || `${derivUser.first_name} ${derivUser.last_name}`.trim() || 'Deriv User';

    // Check if user already exists
    let { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    if (userError && userError.message !== 'User not found') {
      console.error('Error checking user:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let userId;

    if (existingUser?.user) {
      // User exists, update their profile with Deriv info
      userId = existingUser.user.id;
      
      // Update profile with Deriv account info
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          full_name: fullName,
          deriv_account_id: accountId,
          deriv_currency: currency,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: Math.random().toString(36).slice(-12), // Random password (user won't use it)
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          deriv_account_id: accountId,
          auth_provider: 'deriv'
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = newUser.user.id;

      // Create profile for new user
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          full_name: fullName,
          deriv_account_id: accountId,
          deriv_currency: currency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    // Generate a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin')}/dashboard`
      }
    });

    if (sessionError) {
      console.error('Error generating session:', sessionError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: userId,
        email: email,
        fullName: fullName,
        derivAccountId: accountId
      },
      magicLink: sessionData.properties?.action_link
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Deriv auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})