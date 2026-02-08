// routes/activity.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";

const router = express.Router();

// GET /api/activity/:issueId - Get activity log for issue
router.get("/:issueId", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("activity_logs")
      .select(`
        *,
        user:users(id, email, full_name, avatar_url)
      `)
      .eq("issue_id", req.params.issueId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/activity/project/:projectId - Get activity log for project
router.get("/project/:projectId", async (req, res, next) => {
  try {
    const { data: issues } = await supabaseAdmin
      .from("issues")
      .select("id")
      .eq("project_id", req.params.projectId);

    const issueIds = issues.map(i => i.id);

    const { data, error } = await supabaseAdmin
      .from("activity_logs")
      .select(`
        *,
        user:users(id, email, full_name, avatar_url),
        issue:issues(id, title)
      `)
      .in("issue_id", issueIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
