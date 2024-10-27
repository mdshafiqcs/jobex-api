import { Location, Category } from "../models/index.js";
import { ApiResponse, asyncHandler, } from "../utils/index.js";

export const getCategories = asyncHandler(async (req, res) => {

  const categories = await Category.find({});

  return res.status(200)
    .json(
      new ApiResponse(200, { categories }, "")
    );
})

export const getLocations = asyncHandler(async (req, res) => {

  const locations = await Location.find({});

  return res.status(200)
    .json(
      new ApiResponse(200, { locations }, "")
    );
})