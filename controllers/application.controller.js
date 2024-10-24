import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { Job, Application } from "../models/index.js";
import { pagenateOption } from "../utils/index.js"
import mongoose, { isValidObjectId } from "mongoose";
import { ApplicationStatusEnum } from "../constants.js";



export const applyJob = asyncHandler(async(req, res) => {
  const userId = req.user._id;
  const jobId = req.params.jobId;

  if(!isValidObjectId(jobId)){
    throw new ApiError(400, "Invalid jobId format, can not parse to ObjectId")
  }

  const job = await Job.findById(jobId);

  if(!job){
    throw new ApiError(404, "Job not found");
  }

  const existingApplication = await Application.findOne({job: jobId, applicant: userId});

  if(existingApplication){
    throw new ApiError(422, "You have already applied for this job");
  }

  const application = await Application.create({job: jobId, applicant: userId});

  if(!application){
    throw new ApiError(500, "Something went wrong while applying to this job. please try again later.");
  }

  return res.status(201).json(
    new ApiResponse(201, { application }, "Successfuly appplied to this job!!"  )
  )

})



export const allAppliedJobs = asyncHandler(async(req, res) => {
  const currentPage = req.query.page || 1;
  const limit = req.query.limit || 10;

  const aggregate = Application.aggregate([
    
    {
      $match: {
        applicant: req.user._id
      }
    },

    {
      $lookup: {
        from: 'jobs',
        localField: 'job',
        foreignField: '_id',
        as: "job",
        pipeline: [
          {
            $project: {
              createdBy: 0,
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
            $addFields: {
              company: {
                  $first: "$company"
                } 
            }
          }
        ],
      }
    },
    {
      $addFields: {
        job: {
            $first: "$job"
          } 
      }
    },

    {
      $sort: {
        createdAt: 1
      }
    }
  ]);

  const applications = await Application.aggregatePaginate(
    aggregate, 
    pagenateOption(currentPage, limit, "applications")
  )

  return res.status(200)
  .json(
    new ApiResponse(200, applications, "")
  );
})

