import { cloudinary } from "@/lib/cloudinary";

export const uploadImage =
   async (
      file: File
   ) => {
      const arrayBuffer =
         await file.arrayBuffer();

      const buffer =
         Buffer.from(
            arrayBuffer
         );

      return new Promise<{
         secure_url: string;
         public_id: string;
      }>(
         (
            resolve,
            reject
         ) => {
            cloudinary.uploader.upload_stream(
               {
                  folder:
                     "presensi-psikologi",
               },

               (
                  error,
                  result
               ) => {
                  if (
                     error ||
                     !result
                  ) {
                     reject(
                        error
                     );

                     return;
                  }

                  resolve({
                     secure_url:
                        result.secure_url,

                     public_id:
                        result.public_id,
                  });
               }
            ).end(buffer);
         }
      );
   };

export const deleteImage =
   async (
      publicId: string
   ) => {
      return cloudinary.uploader.destroy(
         publicId
      );
   };