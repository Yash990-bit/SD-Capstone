const express = require("express");
const router = express.Router();
const DocumentShareController = require("../controllers/documentShareController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Upload and Share
router.post("/upload", protect, upload, DocumentShareController.uploadAndShare);
router.post("/upload-and-share", protect, upload, DocumentShareController.uploadAndShare);

// Share an already uploaded document
router.post("/share", protect, DocumentShareController.shareLater);

// Doctor views documents shared with them
router.get("/doctor/shared-documents", protect, DocumentShareController.getDoctorSharedDocuments);

// Patient views their own uploaded documents
router.get("/patient/my-documents", protect, DocumentShareController.getPatientDocuments);

// Doctor views a specific shared document (Logs access)
router.get("/doctor/view/:shareId", protect, DocumentShareController.viewSharedDocument);

// Revoke access from a doctor
router.delete("/share/:id", protect, DocumentShareController.revokeAccess);

// See access logs for a specific document
router.get("/access-logs/:documentId", protect, DocumentShareController.getAccessLogs);

module.exports = router;
