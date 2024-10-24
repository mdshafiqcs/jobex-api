import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import config from './config.js';

 // Configuration
cloudinary.config({ 
  cloud_name: config.cloudinaryCloudName, 
  api_key: config.cloudinaryApiKey, 
  api_secret: config.cloudinaryApiSecret,
});


export const uploadOnCloudinary = async (localFilePath) => {
  if(!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    
    fs.unlinkSync(localFilePath);
    return response;
    
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export const deleteFromCloudinary = async (publicId) => {
  if(!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    return null;
  }
}