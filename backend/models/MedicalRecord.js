const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		fileName: {
			type: String,
			required: true
		},
		originalName: {
			type: String,
			required: true
		},
                fileUrl: {
                        type: String,
                        required: true
                },
                publicId: {
                        type: String,
                        required: true
                },
                size: {
                        type: Number,
                        required: false
                }
        },
        {
                timestamps: true
        }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
