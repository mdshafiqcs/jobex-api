import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { Job, Company } from "../models/index.js";
import { Location, Category } from "../models/admin/index.js";
import { pagenateOption } from "../utils/index.js"
import mongoose, { isValidObjectId, } from "mongoose";


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

  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const aggregate = Job.aggregate([

    {
      $match: {
        deadline: { $gte: today },
      }
    },

    {
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: "location",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
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

        location: {
            $first: "$location"
          },

        category: {
            $first: "$category"
          },
          
        applicationCount: {
          $size: "$applications"
        },

        minSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.min"
          }
        },
        maxSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.max"
          }
        },
        isNegotiable: "$salary.isNegotiable",
      }
    },

    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
        salary: 0,
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

export const searchJobs = asyncHandler(async(req, res) => {

  const categoryId = req.query.categoryId || "";
  const locationId = req.query.locationId || "";
  const keyword = req.query.keyword || "";
  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;
  const minSalaryFilter = req.query.minSalary ? parseInt(req.query.minSalary, 10) : null;
  const maxSalaryFilter = req.query.maxSalary ? parseInt(req.query.maxSalary, 10) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const aggregate = Job.aggregate([

    {
      $match: {
        $and: [
          {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
            ]
          },
          {
            deadline: { $gte: today }
          },
          
        ]
      }
    },

    {
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: "location",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
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

        location: {
            $first: "$location"
          },

        category: {
            $first: "$category"
          },
          
        applicationCount: {
          $size: "$applications"
        },

        minSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.min"
          }
        },
        maxSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.max"
          }
        },
        isNegotiable: "$salary.isNegotiable",
      }
    },

    {
      $match: {
        ...(locationId ? { "location._id": mongoose.Types.ObjectId.createFromHexString(locationId) } : {}),
        ...(categoryId ? { "category._id": mongoose.Types.ObjectId.createFromHexString(categoryId) } : {}),
      }
    },

    {
      $match: {
        $or: [
          {
            // If minSalary and maxSalary are provided, check for isNegotiable true
            $and: [
              { "isNegotiable": true },
              { $expr: { $eq: [minSalaryFilter, null] } },
              { $expr: { $eq: [maxSalaryFilter, null] } }
            ]
          },
          {
            // Jobs with isNegotiable false
            "isNegotiable": false,
            ...(minSalaryFilter !== null || maxSalaryFilter !== null ? {
              $and: [
                {
                  $or: [
                    {
                      $and: [
                        { minSalary: { $gte: minSalaryFilter } },
                        { maxSalary: { $lte: maxSalaryFilter } }
                      ]
                    },
                    {
                      $and: [
                        { minSalary: null },
                        { maxSalary: null }
                      ]
                    },
                    {
                      $and: [
                        { minSalary: { $gte: minSalaryFilter } },
                        { maxSalary: null }
                      ]
                    },
                    {
                      $and: [
                        { minSalary: null },
                        { maxSalary: { $lte: maxSalaryFilter } }
                      ]
                    }
                  ]
                }
              ]
            } : {})
          }
        ]
      }
    },
  

    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
        salary: 0,
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
        createdBy: req.user._id // here _id is already objectId, so we don't have to parse to ObjectId
      }
    },

    {
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: "location",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
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

        location: {
            $first: "$location"
          },

        category: {
            $first: "$category"
          },
          
        applicationCount: {
          $size: "$applications"
        },

        minSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.min"
          }
        },
        maxSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.max"
          }
        },
        isNegotiable: "$salary.isNegotiable",
      }
    },

    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
        salary: 0,
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
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: "location",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },

    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: "category",
        pipeline: [
          {
            $project: {
              name: 1,
            }
          }
        ]
      }
    },

    {
      $addFields: {
        company: {
            $first: "$company"
          },

        location: {
            $first: "$location"
          },

        category: {
            $first: "$category"
          },

        applicationCount: {
          $size: "$applications"
        },
        
        minSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.min"
          }
        },

        maxSalary: {
          $cond: {
            if: { $eq: ["$salary.isNegotiable", true] },
            then: null, // or undefined
            else: "$salary.max"
          }
        },

        isNegotiable: "$salary.isNegotiable",
      }
    },

    {
      $project: {
        createdBy: 0,
        updatedAt: 0,
        salary: 0,
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


