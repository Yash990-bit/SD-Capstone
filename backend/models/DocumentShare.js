const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalDocument',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permission: {
      type: String,
      enum: ['VIEW', 'DOWNLOAD', 'FULL_ACCESS'],
      default: 'VIEW',
    },
    expiry: {
      type: String,
      enum: ['1H', '24H', '7D', 'NEVER'],
      default: 'NEVER',
    },
    expiresAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentShare', ShareSchema);
