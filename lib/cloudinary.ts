// Config consumed by next-cloudinary components (CldUploadWidget, CldImage) and
// the /api/upload route (signed uploads). The full cloudinary SDK is added in Step 6.
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
};
