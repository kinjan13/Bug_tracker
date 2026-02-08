// routes/users.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users - Get all users (search/suggestion)
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = supabaseAdmin
      .from("users")
      .select("id, email, full_name, avatar_url");

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user profile
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    // Remove sensitive data
    const { auth_id, ...safeData } = data;
    res.json(safeData);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Update profile
router.put("/profile", verifyToken, async (req, res, next) => {
  try {
    const { fullName, avatarUrl } = req.body;

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date()
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    const { auth_id, ...safeData } = data;
    res.json(safeData);
  } catch (error) {
    next(error);
  }
});

export default router;
