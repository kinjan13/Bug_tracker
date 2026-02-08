// routes/issues.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { verifyToken } from "../middleware/auth.js";
import { validateIssueInput } from "../middleware/validation.js";

const router = express.Router();

// GET /api/issues/:projectId - Get all issues in a project
router.get("/project/:projectId", verifyToken, async (req, res, next) => {
  try {
    const { status, priority, assigneeId, search } = req.query;

    let query = supabaseAdmin
      .from("issues")
      .select(`
        *,
        reporter:users!issues_reporter_id_fk(id, email, full_name, avatar_url),
        assignee:users!issues_assignee_id_fk(id, email, full_name, avatar_url)
      `)
      .eq("project_id", req.params.projectId);

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (assigneeId) query = query.eq("assignee_id", assigneeId);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/issues/:id - Get single issue
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("issues")
      .select(`
        *,
        reporter:users!issues_reporter_id_fk(id, email, full_name, avatar_url),
        assignee:users!issues_assignee_id_fk(id, email, full_name, avatar_url),
        comments(*, author:users(id, email, full_name, avatar_url)),
        attachments(*)
      `)
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/issues - Create new issue
router.post("/", verifyToken, validateIssueInput, async (req, res, next) => {
  try {
    const { projectId, title, description, issueType, priority, assigneeId, dueDate } = req.body;

    const { data, error } = await supabaseAdmin
      .from("issues")
      .insert({
        project_id: projectId,
        title,
        description,
        issue_type: issueType,
        priority,
        reporter_id: req.user.id,
        assignee_id: assigneeId || null,
        due_date: dueDate || null
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      issue_id: data.id,
      user_id: req.user.id,
      action: "created",
      new_value: title
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/issues/:id - Update issue
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { title, description, status, priority, assigneeId, dueDate, estimatedHours } = req.body;

    // Get current issue
    const { data: currentIssue, error: fetchError } = await supabaseAdmin
      .from("issues")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError) throw fetchError;

    // Prepare update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assignee_id = assigneeId;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    if (estimatedHours !== undefined) updateData.estimated_hours = estimatedHours;

    updateData.updated_at = new Date();

    const { data, error } = await supabaseAdmin
      .from("issues")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Log activities for each change
    for (const [key, newValue] of Object.entries(updateData)) {
      if (key !== "updated_at" && currentIssue[key] !== newValue) {
        await supabaseAdmin.from("activity_logs").insert({
          issue_id: req.params.id,
          user_id: req.user.id,
          action: key === "status" ? "status_changed" : "updated",
          field_changed: key,
          previous_value: String(currentIssue[key]),
          new_value: String(newValue)
        });
      }
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/issues/:id/status - Update issue status (Kanban)
router.put("/:id/status", verifyToken, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["todo", "in_progress", "in_review", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: currentIssue } = await supabaseAdmin
      .from("issues")
      .select("status")
      .eq("id", req.params.id)
      .single();

    const { data, error } = await supabaseAdmin
      .from("issues")
      .update({ status, updated_at: new Date() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Log status change
    await supabaseAdmin.from("activity_logs").insert({
      issue_id: req.params.id,
      user_id: req.user.id,
      action: "status_changed",
      field_changed: "status",
      previous_value: currentIssue.status,
      new_value: status
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/issues/:id - Delete issue
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from("issues")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ message: "Issue deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
