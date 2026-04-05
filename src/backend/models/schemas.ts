// ============================================================
// MediVault — Mongoose Schemas
// src/backend/models/schemas.ts
//
// Uses Mongoose discriminator pattern so Patient and Doctor
// share the `users` collection, differentiated by the `role` field.
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, DocumentCategory, SharePermission } from '../interfaces';

// ------------------------------------------------------------
// USER SCHEMA (base — discriminator root)
// ------------------------------------------------------------
export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',  // Mongoose uses this field to differentiate subschemas
  }
);

// Index on email for fast lookup during login
UserSchema.index({ email: 1 });

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

// ------------------------------------------------------------
// PATIENT SCHEMA (discriminator on UserModel)
// ------------------------------------------------------------
export interface IPatientDocument extends IUserDocument {
  bloodGroup: string;
  allergies: string[];
  diseases: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const PatientSchema = new Schema<IPatientDocument>({
  bloodGroup: { type: String, default: '' },
  allergies: { type: [String], default: [] },
  diseases: { type: [String], default: [] },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
});

export const PatientModel = UserModel.discriminator<IPatientDocument>(
  UserRole.PATIENT,
  PatientSchema
);

// ------------------------------------------------------------
// DOCTOR SCHEMA (discriminator on UserModel)
// ------------------------------------------------------------
export interface IDoctorDocument extends IUserDocument {
  specialization: string;
  licenseNumber: string;
  hospital: string;
}

const DoctorSchema = new Schema<IDoctorDocument>({
  specialization: { type: String, default: '' },
  licenseNumber: { type: String, unique: true, sparse: true },
  hospital: { type: String, default: '' },
});

export const DoctorModel = UserModel.discriminator<IDoctorDocument>(
  UserRole.DOCTOR,
  DoctorSchema
);

// ------------------------------------------------------------
// MEDICAL RECORD SCHEMA
// ------------------------------------------------------------
export interface IMedicalRecordDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecordDocument>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: Object.values(DocumentCategory), required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Compound index: fast queries for "all records by patient in a category"
MedicalRecordSchema.index({ patientId: 1, category: 1 });

export const MedicalRecordModel = mongoose.model<IMedicalRecordDocument>('MedicalRecord', MedicalRecordSchema);

// ------------------------------------------------------------
// SHARE LINK SCHEMA
// ------------------------------------------------------------
export interface IShareLinkDocument extends Document {
  recordId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  permission: SharePermission;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLinkDocument>(
  {
    recordId: { type: Schema.Types.ObjectId, ref: 'MedicalRecord', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: Object.values(SharePermission), required: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for the doctor's active-links query (used heavily in access checks)
ShareLinkSchema.index({ doctorId: 1, isRevoked: 1, expiresAt: 1 });

export const ShareLinkModel = mongoose.model<IShareLinkDocument>('ShareLink', ShareLinkSchema);

// ------------------------------------------------------------
// CONSULTATION NOTE SCHEMA
// ------------------------------------------------------------
export interface IConsultationNoteDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  recordId?: mongoose.Types.ObjectId;
  note: string;
  createdAt: Date;
}

const ConsultationNoteSchema = new Schema<IConsultationNoteDocument>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordId: { type: Schema.Types.ObjectId, ref: 'MedicalRecord', required: false },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

export const ConsultationNoteModel = mongoose.model<IConsultationNoteDocument>(
  'ConsultationNote',
  ConsultationNoteSchema
);

// ------------------------------------------------------------
// EMERGENCY ACCESS SCHEMA
// ------------------------------------------------------------
export interface IEmergencyAccessDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  qrCodeData: string;
  scopedFields: string[];
  isActive: boolean;
  createdAt: Date;
}

const EmergencyAccessSchema = new Schema<IEmergencyAccessDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    qrCodeData: { type: String, required: true },
    scopedFields: { type: [String], default: ['bloodGroup', 'allergies', 'diseases'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EmergencyAccessModel = mongoose.model<IEmergencyAccessDocument>(
  'EmergencyAccess',
  EmergencyAccessSchema
);
