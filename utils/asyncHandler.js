import fs from "fs"


const deleteFiles = async (files = {}) => {
  if (!files) return;

  try {

    for (const key of Object.keys(files)) {
      if(Array.isArray(files[key])){
        for (const file of files[key]) {

          if(fs.existsSync(file.path)){
            fs.unlink(
              file.path,
              (err) =>  {
                if(err){
                  console.log(err.message)
                }
              }
            );
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      deleteFiles(req.files)
      next(error)
    });
    // Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
  }
}

export default asyncHandler;
