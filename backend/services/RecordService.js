const MedicalRecordRepository = require("../repositories/MedicalRecordRepository");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

class RecordService {
  static async uploadMedicalRecord(userId, file) {

    if (!file) {
      const error = new Error("No file uploaded");
      error.statusCode = 400;
      throw error;
    }

    return new Promise((resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "medivault",
          resource_type: "auto"
        },
        async (error, result) => {

          if (error) {
            console.error("Cloudinary Error:", error);
            return reject(new Error("Failed to upload to cloudinary"));
          }

          try {

            const record = await MedicalRecordRepository.create({
              user: userId,
              fileName: file.originalname,
              originalName: file.originalname,
              fileUrl: result.secure_url,
              publicId: result.public_id,
              size: file.size
            });

            resolve({
              _id: record._id,
              fileName: record.fileName,
              fileUrl: record.fileUrl,
              createdAt: record.createdAt
            });

          } catch (dbError) {
            console.error("Database Error:", dbError);
            reject(new Error("Failed to save to database"));
          }

        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);

    });

  }

  static async getRecords(user) {
    if (user.role === 'doctor') {
      return await MedicalRecordRepository.findAll();
    } else {
      return await MedicalRecordRepository.findByUserId(user.id);
    }
  }
}

module.exports = RecordService;