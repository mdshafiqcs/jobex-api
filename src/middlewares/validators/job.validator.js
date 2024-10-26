import { isValidObjectId } from "mongoose";
import { validationHandler } from "./index.js"
import { body } from "express-validator";

const postJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage("title field is required")
    .escape(),

  body('description')
    .trim()
    .notEmpty()
    .withMessage("description field is required")
    .escape(),

  body('requirements')
    .trim()
    .notEmpty()
    .withMessage("requirements field is required")
    .escape(),

  body('isNegotiable')
    .notEmpty()
    .withMessage("isNegotiable field is required"),

  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage("categoryId is required")
    .escape(),

  body('locationId')
    .trim()
    .notEmpty()
    .withMessage("locationId is required")
    .escape(),

  body('address')
    .trim()
    .notEmpty()
    .withMessage("address field is required")
    .escape(),

  body('jobType')
      .trim()
      .notEmpty()
      .withMessage("jobType field is required")
      .escape(),

  body('positions')
    .notEmpty()
    .withMessage("positions field is required")
    .isInt()
    .withMessage("positions field must be integer"),

  body('experienceLevel')
    .trim()
    .notEmpty()
    .withMessage("experience level field is required")
    .escape(),

  body('deadline')
    .trim()
    .notEmpty()
    .withMessage("deadline field is required")
    .escape(),

  body('companyId')
    .trim()
    .notEmpty()
    .withMessage("companyId field is required")
    .custom(async value => {
      if(!isValidObjectId(value)){
        throw new Error('Invalid companyId format, can not parse to ObjectId');
      }
    }),
    
    
  validationHandler,
];

export default {
  postJob,
}