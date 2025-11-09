import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
// import v2 that Cloudinary API version 2 as any name but we use cloudinary so that we can use it further in code

dotenv.config();

cloudinary.config({ // this will make cloudinary ready to use in our project and connect our details with cloudinary server
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
secure: true,
});

export default cloudinary;
