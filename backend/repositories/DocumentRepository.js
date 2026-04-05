const MedicalDocument = require("../models/MedicalDocument");
const DocumentShare = require("../models/DocumentShare");
const DocumentAccessLog = require("../models/DocumentAccessLog");

class DocumentRepository {
  async createDocument(data) {
    const document = new MedicalDocument(data);
    return await document.save();
  }

  async getDocumentById(id) {
    return await MedicalDocument.findById(id).populate('patientId', 'name email');
  }

  async getPatientDocuments(patientId) {
    return await MedicalDocument.find({ patientId }).sort({ createdAt: -1 });
  }

  async createShare(data) {
    const share = new DocumentShare(data);
    return await share.save();
  }
  
  async createManyShares(sharesData) {
    return await DocumentShare.insertMany(sharesData);
  }

  async getSharedWithDoctor(doctorId) {
    const now = new Date();
    return await DocumentShare.find({
      doctorId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    })
      .populate('documentId')
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
  }

  async revokeShare(shareId, patientId) {
    return await DocumentShare.findOneAndDelete({ _id: shareId, patientId });
  }

  async logAccess(data) {
    const log = new DocumentAccessLog(data);
    return await log.save();
  }

  async getAccessLogs(documentId) {
    return await DocumentAccessLog.find({ documentId })
      .populate('doctorId', 'name email')
      .sort({ accessedAt: -1 });
  }
}

module.exports = new DocumentRepository();
