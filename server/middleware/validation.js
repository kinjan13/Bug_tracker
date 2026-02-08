// middleware/validation.js
import validator from "validator";

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  });
};

export const validateIssueInput = (req, res, next) => {
  const { title, description, issueType, priority } = req.body;

  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!description || description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!issueType || !["bug", "feature", "task", "improvement"].includes(issueType)) {
    errors.issueType = "Invalid issue type";
  }

  if (!priority || !["low", "medium", "high", "critical"].includes(priority)) {
    errors.priority = "Invalid priority";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
