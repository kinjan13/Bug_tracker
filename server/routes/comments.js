// routes/comments.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/comments/:issueId - Get all comments for an issue
router.get("/:issueId", verifyToken, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(`
        *,
        author:users(id, email, full_name, avatar_url),
        replies:comments(
          *,
          author:users(id, email, full_name, avatar_url)
        )
      `)
      .eq("issue_id", req.params.issueId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/comments - Create comment on issue
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { issueId, content, parentCommentId } = req.body;

    if (!content || content.trim().length < 1) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .insert({
        issue_id: issueId,
        author_id: req.user.id,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/comments/:id - Update comment
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { content } = req.body;

    // Verify ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from("comments")
      .select("author_id")
      .eq("id", req.params.id)
      .single();

    if (fetchError || comment.author_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ content: content.trim(), updated_at: new Date() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id - Delete comment
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    // Verify ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from("comments")
      .select("author_id")
      .eq("id", req.params.id)
      .single();

    if (fetchError || comment.author_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
