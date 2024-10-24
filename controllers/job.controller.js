import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { Job } from "../models/index.js";
import { pagenateOption } from "../utils/index.js"
import mongoose, { isValidObjectId } from "mongoose";




export const getAllJobs = asyncHandler(async(req, res) => {
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


