const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalDocument',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['VIEW', 'DOWNLOAD', 'REVOKE', 'SHARE'],
      required: true,
    },
  },
  { timestamps: { createdAt: 'accessedAt', updatedAt: false } }
);

module.exports = mongoose.model('DocumentAccessLog', AccessLogSchema);
