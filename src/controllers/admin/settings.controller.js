import { Category } from "../../models/category.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";


export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existingCategory = await Category.findOne({name});

  if(existingCategory){
    throw new ApiError(409, "Category already exists with this name");
  }

  const category = await Category.create({
    name, 
  });

  if(!category){
    throw new ApiError(500, "Something went wrong while creating category, try again later");
  }

  return res.status(201)
    .json(
      new ApiResponse(201, { category }, "Category Created Successfully.")
    );
})

export const getCategories = asyncHandler(async (req, res) => {

  const categories = await Category.find({});

  return res.status(200)
    .json(
      new ApiResponse(200, { categories }, "")
    );
})

