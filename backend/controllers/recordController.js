const RecordService = require("../services/RecordService");

class RecordController {
  static async upload(req, res) {
    try {
      const record = await RecordService.uploadMedicalRecord(req.user.id, req.file);
      res.status(201).json({ message: "Upload successful", record });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  static async getRecords(req, res) {
    try {
      const records = await RecordService.getRecords(req.user);
      res.status(200).json({ data: records });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

module.exports = RecordController;
