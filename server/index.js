import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Initialize environment variables immediately
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error.message);
} else {
  console.log('.env loaded successfully');
}

// Validate required environment variables
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('⚠️  Missing environment variables:', missing.join(', '));
  console.error('Please check your .env file at:', envPath);
  process.exit(1);
}

console.log('✓ All environment variables loaded');
console.log('✓ SUPABASE_URL:', process.env.SUPABASE_URL.substring(0, 30) + '...');

// Now import other modules
import express from "express";
import cors from "cors";
import helmet from "helmet";

// Import routes - safe to import now that env vars are loaded
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import issueRoutes from "./routes/issues.js";
import commentRoutes from "./routes/comments.js";
import attachmentRoutes from "./routes/attachments.js";
import activityRoutes from "./routes/activity.js";
import userRoutes from "./routes/users.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { verifyToken } from "./middleware/auth.js";

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Bug Tracker API Running",
    version: "1.0.0",
    timestamp: new Date()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/activity", verifyToken, activityRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Bug Tracker API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});
