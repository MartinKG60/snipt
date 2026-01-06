// Supabase Edge Function: Auto-create user and return session
// Deploy: supabase functions deploy signup-auto
// Endpoint: https://jkrgyycposcdizfyhvwv.supabase.co/functions/v1/signup-auto

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const generatePassword = () => {
  const length = 16;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const password = generatePassword();

    // Create user with auto-generated password
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      // User might already exist
      if (
        error.message.includes("already registered") ||
        error.message.includes("duplicate")
      ) {
        return new Response(
          JSON.stringify({
            error: "Email already registered",
            code: "USER_EXISTS",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    // Return user ID and password (app will auto-login)
    return new Response(
      JSON.stringify({
        userId: data.user.id,
        email: data.user.email,
        password, // App should show this to user and tell them to save
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create user" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
