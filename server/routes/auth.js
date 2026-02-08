// routes/auth.js
import express from "express";
import { supabaseAdmin, supabase } from "../utils/supabaseClient.js";
import { generateToken } from "../utils/jwt.js";
import { validateEmail, validatePassword } from "../middleware/validation.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters" 
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile using service role (bypass RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName || email.split("@")[0]
      })
      .select()
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Generate JWT token
    const token = generateToken({
      id: userData.id,
      email,
      role: userData.role
    });

    res.status(201).json({
      message: "Signup successful",
      user: userData,
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Use Supabase client to sign in
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('signInResult:', signInResult);
    const authUser = signInResult?.data?.user;
    const authError = signInResult?.error;

    if (authError || !authUser) {
      console.warn('Auth error or no user:', authError);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get user profile
    const profileResult = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    console.log('profileResult:', profileResult);

    const userData = profileResult?.data;
    const userError = profileResult?.error;

    if (userError || !userData) {
      console.warn('User profile missing for id:', authUser.id, 'error:', userError);
      return res.status(400).json({ error: "User profile not found" });
    }

    // Generate JWT token
    const token = generateToken({
      id: userData.id,
      email: userData.email,
      role: userData.role
    });

    res.json({
      message: "Login successful",
      user: userData,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
