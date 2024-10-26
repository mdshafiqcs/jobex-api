
import validationHandler  from "../validationHandler.js"
import { body } from "express-validator";

const createCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage("name field is required")
    .escape(),

  validationHandler,
];

export default {
  createCategory,
}