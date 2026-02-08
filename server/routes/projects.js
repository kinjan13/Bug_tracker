// routes/projects.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/projects - Get all projects for user
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select(`
        *,
        owner:users(id, email, full_name),
        project_members(id, user_id, role)
      `)
      .or(`owner_id.eq.${req.user.id},project_members.user_id.eq.${req.user.id}`);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get single project
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select(`
        *,
        owner:users(id, email, full_name),
        project_members(id, user_id, role, users!project_members_user_id_fk(id, email, full_name, avatar_url))
      `)
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects - Create new project
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { name, description, key } = req.body;

    if (!name || !key) {
      return res.status(400).json({ error: "Name and key are required" });
    }

    // Create project
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        name,
        description,
        key: key.toUpperCase(),
        owner_id: req.user.id
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add owner as project member
    const { error: memberError } = await supabaseAdmin
      .from("project_members")
      .insert({
        project_id: projectData.id,
        user_id: req.user.id,
        role: "admin"
      });

    if (memberError) throw memberError;

    res.status(201).json(projectData);
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    // Verify ownership
    const { data: project, error: fetchError } = await supabaseAdmin
      .from("projects")
      .select("owner_id")
      .eq("id", req.params.id)
      .single();

    if (fetchError || project.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update project
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({ name, description, status, updated_at: new Date() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    // Verify ownership
    const { data: project, error: fetchError } = await supabaseAdmin
      .from("projects")
      .select("owner_id")
      .eq("id", req.params.id)
      .single();

    if (fetchError || project.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:id/members - Add member to project
router.post("/:id/members", verifyToken, async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    // Verify user is project admin
    const { data: member, error: memberError } = await supabaseAdmin
      .from("project_members")
      .select("role")
      .eq("project_id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (memberError || member.role !== "admin") {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Add member
    const { data, error } = await supabaseAdmin
      .from("project_members")
      .insert({
        project_id: req.params.id,
        user_id: userId,
        role: role || "developer"
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
