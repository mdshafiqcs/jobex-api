import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { Job, Company } from "../models/index.js";
import { Location, Category } from "../models/admin/index.js";
import { pagenateOption } from "../utils/index.js"
import mongoose, { isValidObjectId } from "mongoose";


export const postJob = asyncHandler(async(req, res) => {

  const {
    title, 
    description, 
    requirements, 
    categoryId,
    minSalary, 
    maxSalary, 
    isNegotiable,
    address, 
    locationId, 
    jobType, 
    jobRole, 
    positions, 
    experienceLevel, 
    deadline,
    companyId 
  } = req.body;

  const userId = req.user._id;

  if(!isValidObjectId(categoryId)){
    throw new ApiError(400, "Invalid categoryId format, can not parse to ObjectId");
  }

  const category = await Category.findOne({_id: categoryId});

  if(!category){
    throw new ApiError(404, "Category not found");
  }

  if(!isValidObjectId(locationId)){
    throw new ApiError(400, "Invalid locationId format, can not parse to ObjectId");
  }

  const location = await Location.findOne({_id: locationId});

  if(!location){
    throw new ApiError(404, "Location not found");
  }

  if(!isValidObjectId(companyId)){
    throw new ApiError(400, "Invalid companyId format, can not parse to ObjectId");
  }

  const company = await Company.findOne({_id: companyId, userId})
  
  if(!company){
    throw new ApiError(404, "Company not found");
  }

  const requirementsArray = requirements ? requirements.split(",") : undefined;
    requirementsArray.map((item) => item.toString().trim());

  const job = await Job.create({
    title, 
    description, 
    requirements: requirementsArray.map((item) => item.toString().trim()), 
    address, 
    location: location._id, 
    category: category._id,
    jobType, 
    jobRole, 
    salary: {
      min: minSalary, 
      max: maxSalary, 
      isNegotiable,
    },
    positions: Number(positions), 
    experienceLevel: experienceLevel,
    company: company._id,
    createdBy: userId,
    deadline,
  });


  await job.save();

  if(!job){
    throw new ApiError(500, "Something went wrong while posting new job");
  }

  job.company = undefined;
  job.createdBy = undefined;
  job.applications = undefined;
  job.updatedAt = undefined;


  return res.status(201)
  .json(
    new ApiResponse(201, { job }, "New job posted successfully!")
  );

})


export const getAllJobs = asyncHandler(async(req, res) => {
  const categoryId = req.query.categoryId || "";
  const location = req.query.location || "";
  const keyword = req.query.keyword || "";
  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;

  const aggregate = Job.aggregate([
    
    {
      $match: {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ]
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: "company",
        pipeline: [
          {
            $project: {
              name: 1,
              description: 1,
              website: 1,
              location: 1,
              logo: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: "applications",
        pipeline: [
          {
            $project: {
              applicant: 1,
            }
          }
        ],
      }
    },
    {
      $addFields: {
        company: {
            $first: "$company"
          },
        applicationCount: {
          $size: "$applications"
        },
      }
    },
    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ]);

  const jobs = await Job.aggregatePaginate(
    aggregate, 
    pagenateOption(currentPage, limit, "jobs")
  )

  return res.status(200)
  .json(
    new ApiResponse(200, jobs, "")
  );

})

export const getRecruiterJobs = asyncHandler(async(req, res) => {
  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;

  const aggregate = Job.aggregate([
    
    {
      $match: {
        createdBy: req.user._id // here _id is already objectId, so we don't have to parse
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: "company",
        pipeline: [
          {
            $project: {
              name: 1,
              description: 1,
              website: 1,
              location: 1,
              logo: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: "applications",
        pipeline: [
          {
            $project: {
              applicant: 1,
            }
          }
        ],
      }
    },
    {
      $addFields: {
        company: {
            $first: "$company"
          },
        applicationCount: {
          $size: "$applications"
        },
      }
    },
    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ]);

  const jobs = await Job.aggregatePaginate(
    aggregate, 
    pagenateOption(currentPage, limit, "jobs")
  )

  return res.status(200)
  .json(
    new ApiResponse(200, jobs, "")
  );

})


export const getJobById = asyncHandler(async(req, res) => {
  const jobId = req.params.jobId;
  if(!isValidObjectId(jobId)){
    throw new ApiError(400, "Invalid jobId format, can not parse to ObjectId")
  }

  const aggregate = [
    
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(jobId)
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: "company",
        pipeline: [
          {
            $project: {
              name: 1,
              description: 1,
              website: 1,
              location: 1,
              logo: 1,
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: "applications",
        pipeline: [
          {
            $project: {
              applicant: 1,
            }
          }
        ],
      }
    },
    {
      $addFields: {
        company: {
            $first: "$company"
          },
        applicationCount: {
          $size: "$applications"
        },
      }
    },

    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
      }
    }
    
  ];

  const jobs = await Job.aggregate(aggregate);

  if(jobs.length === 0){
    throw new ApiError(404, "Job not found");
  }

  return res.status(200)
  .json(
    new ApiResponse(200, {job: jobs[0]} , "")
  );

})


