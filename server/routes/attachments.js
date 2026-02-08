// routes/attachments.js
import express from "express";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../utils/fileUpload.js";

const router = express.Router();

// GET /api/attachments/:issueId - Get all attachments for issue
router.get("/:issueId", verifyToken, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("attachments")
      .select(`
        *,
        uploaded_by:users(id, email, full_name, avatar_url)
      `)
      .eq("issue_id", req.params.issueId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/attachments - Upload attachment
router.post("/", verifyToken, upload.single("file"), async (req, res, next) => {
  try {
    const { issueId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // In production, upload to Supabase Storage
    // For now, store file reference
    const { data, error } = await supabaseAdmin
      .from("attachments")
      .insert({
        issue_id: issueId,
        uploaded_by: req.user.id,
        file_name: req.file.originalname,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        file_url: `/uploads/${req.file.filename}`,
        storage_path: req.file.path
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/attachments/:id - Delete attachment
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    // Verify ownership
    const { data: attachment, error: fetchError } = await supabaseAdmin
      .from("attachments")
      .select("uploaded_by")
      .eq("id", req.params.id)
      .single();

    if (fetchError || attachment.uploaded_by !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { error } = await supabaseAdmin
      .from("attachments")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
