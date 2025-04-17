import { v2 as cloudinary } from 'cloudinary';


const uploadMediaToCloudinary = (file: any) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {

          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);

    return result;
  } catch (error) {

    throw error;
  }
};
export { uploadMediaToCloudinary, deleteMediaFromCloudinary };
