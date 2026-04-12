import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
  handleValidationErrors,
];
