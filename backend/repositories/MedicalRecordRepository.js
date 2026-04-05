const MedicalRecord = require("../models/MedicalRecord");

class MedicalRecordRepository {
  static create(payload) {
    return MedicalRecord.create(payload);
  }
  
  static findByUserId(userId) {
    return MedicalRecord.find({ user: userId }).populate("user", "name").sort({ createdAt: -1 });
  }

  static findAll() {
    return MedicalRecord.find().populate("user", "name email").sort({ createdAt: -1 });
  }
}

module.exports = MedicalRecordRepository;
