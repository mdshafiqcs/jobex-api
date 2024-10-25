
import { validationResult } from "express-validator";
import { ApiError } from "../../utils/index.js";

const validationHandler = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      throw new ApiError(400, "Validation error", errors.array())

    }
    next();
}

export default validationHandler;