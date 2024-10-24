import { validationHandler } from "./index.js"
import { body } from "express-validator";

const register = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .escape(),

  validationHandler,
];


export default {
  register,
}