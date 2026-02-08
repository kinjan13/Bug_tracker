// utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

let supabaseInstance = null;
let supabaseAdminInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
    }
    
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

function getSupabaseAdminClient() {
  if (!supabaseAdminInstance) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!url) {
      throw new Error("Missing SUPABASE_URL environment variable");
    }
    
    const key = serviceRoleKey || anonKey;
    if (!key) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable");
    }
    
    supabaseAdminInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
}

// Use Proxy for lazy initialization to support .method() syntax
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop];
  }
});

export const supabaseAdmin = new Proxy({}, {
  get: (target, prop) => {
    const client = getSupabaseAdminClient();
    return client[prop];
  }
});
