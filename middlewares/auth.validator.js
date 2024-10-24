import { validationHandler } from "./index.js"
import { body } from "express-validator";

const login = [
  body('email')
    .trim()
    .isEmail()
    .withMessage("Provide a valid email"),
  body('password')
    .trim()
    .isLength({min: 6})
    .withMessage("Password must be at lest 6 character long."),
  body('role')
    .trim()
    .notEmpty()
    .withMessage("role is required"),
  validationHandler,
];

const register = [
  body('fullname')
    .trim()
    .isLength({min: 3})
    .withMessage("Full Name must be at lest 3 character long."),
  body('email')
    .trim()
    .isEmail()
    .withMessage("Provide a valid email"),
  body('password')
    .trim()
    .isLength({min: 6})
    .withMessage("Password must be at lest 6 character long."),
  body('role')
    .trim()
    .notEmpty()
    .withMessage("role is required"),
  validationHandler,
];

const updateProfile = [
  body('fullname')
    .trim()
    .isLength({min: 3})
    .withMessage("Full Name must be at lest 3 character long."),

  validationHandler,
];

export default {
  login,
  register,
  updateProfile,
}