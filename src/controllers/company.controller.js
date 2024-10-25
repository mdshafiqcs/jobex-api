import { ApiError, ApiResponse, asyncHandler, deleteFromCloudinary, uploadOnCloudinary } from "../utils/index.js";
import { Company } from "../models/index.js";
import { isValidObjectId } from "mongoose";
import { pagenateOption } from "../utils/index.js"


export const registerCompany = asyncHandler(async (req, res) => {
  const {name, description, website, location} = req.body;

  const existingCompany = await Company.findOne({name});

  if(existingCompany){
    throw new ApiError(409, "Company exists with this name");
  }

  const company = await Company.create({
    name, 
    userId: req.user._id, 
    description, 
    website, 
    location,
  });

  if(!company){
    throw new ApiError(500, "Something went wrong while registering the company, try again later");
  }

  if(req.files && Array.isArray(req.files.logo) && req.files.logo.length > 0){
    const path = req.files.logo[0].path;

    if(path) {
      const logoPath = await uploadOnCloudinary(path);

      if(logoPath){
        company.logo = logoPath.url;
        company.cloudinaryPublicId.logo = logoPath.public_id;
        
        await company.save();
      }
    }
  }

  return res.status(201)
    .json(
      new ApiResponse(201, { company }, "Company Registered Successfully.")
    );
})


export const getAllCompany = asyncHandler(async(req, res) => {

  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;
  const userId = req.user._id;
  const keyword = req.query.keyword || "";

  const aggregate = Company.aggregate([
    
    {
      $match: {
        $and: [
          {userId},
          { name: { $regex: keyword, $options: 'i' } },
        ]
      }
    }

  ]);

  const companies = await Company.aggregatePaginate(
    aggregate, 
    pagenateOption(currentPage, limit, "companies")
  )

  return res.status(200)
  .json(
    new ApiResponse(200, companies, "")
  );

})

export const getCompanyById = asyncHandler(async(req, res) => {
  const companyId = req.params.companyId;
  const userId = req.user._id;

  if(!isValidObjectId(companyId)){
    throw new ApiError(400, "Invalid companyId format, can not parse to ObjectId");
  }

  const company = await Company.findOne({_id: companyId, userId})

  if(!company){
    throw new ApiError(404, "Company not found");
  }

  return res.status(200)
  .json(
    new ApiResponse(200, { company }, "")
  );

})

export const updateCompany = asyncHandler(async (req, res) => {
  const {description, website, location} = req.body;
  const userId = req.user._id;
  const companyId = req.params.companyId;

  if(!isValidObjectId(companyId)){
    throw new ApiError(400, "Invalid companyId format, can not parse to ObjectId");
  }

  const company = await Company.findOne({_id: companyId, userId})
  
  if(!company){
    throw new ApiError(404, "Company not found");
  }

  company.description = description;
  company.website = website;
  company.location = location;

  if(req.files && Array.isArray(req.files.logo) && req.files.logo.length > 0){
    const path = req.files.logo[0].path;

    if(path) {
      const logoPath = await uploadOnCloudinary(path);

      if(logoPath){
        if(company.cloudinaryPublicId?.logo){
          await deleteFromCloudinary(company.cloudinaryPublicId?.logo);
        }

        company.logo = logoPath.url;
        company.cloudinaryPublicId.logo = logoPath.public_id;
      }
    }
  }

  await company.save();

  return res.status(200)
  .json(
    new ApiResponse(200, { company }, "Company Information Updated Successfully.")
  );

})