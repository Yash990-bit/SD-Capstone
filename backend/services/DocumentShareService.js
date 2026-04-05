const DocumentRepository = require("../repositories/DocumentRepository");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

class DocumentShareService {
  /**
   * Helper method to calculate explicit expiry date.
   */
  _calculateExpiry(expiryType) {
    if (!expiryType || expiryType === 'NEVER') return null;
    const now = new Date();
    switch (expiryType) {
      case '1H':
        return new Date(now.getTime() + 1 * 60 * 60 * 1000);
      case '24H':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '7D':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  /**
   * Upload Document to Cloudinary
   */
  async uploadFileToCloudinary(fileBuffer, mimetype) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "medivault_shared" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Upload and Share Multiple Doctors
   */
  async uploadAndShare({ patientId, file, title, documentType, description, doctorIds, permission, expiry }) {
    if (!file) throw new Error("File is required");
    
    // Upload to Cloudinary
    const uploadResult = await this.uploadFileToCloudinary(file.buffer, file.mimetype);

    // Save to Database
    const newDocument = await DocumentRepository.createDocument({
      patientId,
      title,
      description,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileType: file.mimetype,
      documentType: documentType || 'Other',
    });

    // Apply Sharing
    if (doctorIds && doctorIds.length > 0) {
      await this.shareDocument({
        documentId: newDocument._id,
        patientId,
        doctorIds,
        permission,
        expiry
      });
    }

    return newDocument;
  }

  /**
   * Share an existing document manually with selected doctors
   */
  async shareDocument({ documentId, patientId, doctorIds, permission, expiry }) {
    const expiresAt = this._calculateExpiry(expiry);

    const sharingPayloads = doctorIds.map(doctorId => ({
      documentId,
      patientId,
      doctorId,
      permission: permission || 'VIEW',
      expiry: expiry || 'NEVER',
      expiresAt
    }));

    await DocumentRepository.createManyShares(sharingPayloads);
    
    // Create access logs for sharing action
    const accessLogs = doctorIds.map(docId => ({
      documentId,
      doctorId: docId,
      action: 'SHARE'
    }));

    // Optionally: Queue notifications here
    // notificationService.notifyDoctors(...) 
    
    return { message: "Document shared successfully" };
  }

  /**
   * Fetch documents a doctor has been granted access to
   */
  async getDoctorSharedDocuments(doctorId) {
    const validShares = await DocumentRepository.getSharedWithDoctor(doctorId);
    
    // Map them for nicer frontend formatting
    return validShares.map(share => ({
      shareId: share._id,
      document: share.documentId,
      patient: share.patientId,
      permission: share.permission,
      expiresAt: share.expiresAt,
      sharedAt: share.createdAt
    }));
  }

  /**
   * Access a document securely - validates dates and logs the event
   */
  async viewDocument(shareId, doctorId) {
    const shares = await DocumentRepository.getSharedWithDoctor(doctorId);
    const accessGrant = shares.find(s => s._id.toString() === shareId);
    
    if (!accessGrant || !accessGrant.documentId) {
      throw new Error("Access expired or denied");
    }

    // Log the event
    await DocumentRepository.logAccess({
      documentId: accessGrant.documentId._id,
      doctorId,
      action: 'VIEW' // Check user role permission to download if triggered download
    });

    return accessGrant.documentId; // Return document info
  }

  /**
   * Revokes the access granted to a doctor.
   */
  async revokeShare(shareId, patientId) {
    const revoked = await DocumentRepository.revokeShare(shareId, patientId);
    if (!revoked) throw new Error("Share link not found or already removed");
    
    // Log revocation
    if (revoked) {
        await DocumentRepository.logAccess({
            documentId: revoked.documentId,
            doctorId: revoked.doctorId,
            action: 'REVOKE'
        });
    }

    return revoked;
  }

  /**
   * Get Access Logs for Patient
   */
  async getDocumentLogs(documentId) {
    return await DocumentRepository.getAccessLogs(documentId);
  }
}

module.exports = new DocumentShareService();
