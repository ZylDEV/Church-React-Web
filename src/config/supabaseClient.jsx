import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upjaynxlohsfpnxzwcth.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwamF5bnhsb2hzZnBueHp3Y3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDA1MzUsImV4cCI6MjA3MjgxNjUzNX0.m13QJlcae6X_KTuB7iWpSYzLgdrN0kcZaJN6jR45lrM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
