import { Location, Category} from "../../models/admin/index.js";


import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";


export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existingLocation = await Category.findOne({name});

  if(existingLocation){
    throw new ApiError(409, "Location already exists with this name");
  }

  const category = await Location.create({
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


export const createLocation = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existingLocation = await Location.findOne({name});

  if(existingLocation){
    throw new ApiError(409, "Location already exists with this name");
  }

  const location = await Location.create({
    name, 
  });

  if(!location){
    throw new ApiError(500, "Something went wrong while adding location, try again later");
  }

  return res.status(201)
    .json(
      new ApiResponse(201, { location }, "Location Added Successfully.")
    );
})

export const getLocations = asyncHandler(async (req, res) => {

  const locations = await Location.find({});

  return res.status(200)
    .json(
      new ApiResponse(200, { locations }, "")
    );
})
