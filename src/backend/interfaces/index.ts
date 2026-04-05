// ============================================================
// MediVault — TypeScript Interfaces, Enums, and DTOs
// src/backend/interfaces/index.ts
// ============================================================

// ------------------------------------------------------------
// ENUMS
// ------------------------------------------------------------

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export enum DocumentCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  IMAGING = 'imaging',
  DISCHARGE_SUMMARY = 'discharge_summary',
  VACCINATION = 'vaccination',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  VIEW_AND_DOWNLOAD = 'view_and_download',
}

// ------------------------------------------------------------
// CORE ENTITY INTERFACES
// ------------------------------------------------------------

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatient extends IUser {
  bloodGroup: string;
  allergies: string[];
  diseases: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface IDoctor extends IUser {
  specialization: string;
  licenseNumber: string;
  hospital: string;
}

export interface IMedicalRecord {
  _id: string;
  patientId: string;
  title: string;
  description: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: Date;
}

export interface IShareLink {
  _id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  permission: SharePermission;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface IConsultationNote {
  _id: string;
  doctorId: string;
  patientId: string;
  recordId?: string;
  note: string;
  createdAt: Date;
}

export interface IEmergencyAccess {
  _id: string;
  patientId: string;
  qrCodeData: string;
  scopedFields: string[];
  isActive: boolean;
  createdAt: Date;
}

// ------------------------------------------------------------
// SERVICE INTERFACES
// ------------------------------------------------------------

export interface IAuthService {
  register(dto: RegisterDTO): Promise<{ user: IUser; token: string }>;
  login(email: string, password: string): Promise<{ user: IUser; token: string }>;
  verifyToken(token: string): Promise<{ userId: string; role: UserRole }>;
}

export interface IDocumentService {
  upload(patientId: string, dto: CreateRecordDTO, file: Express.Multer.File): Promise<IMedicalRecord>;
  getByPatient(patientId: string): Promise<IMedicalRecord[]>;
  getById(recordId: string): Promise<IMedicalRecord | null>;
  update(recordId: string, patientId: string, updates: Partial<CreateRecordDTO>): Promise<IMedicalRecord | null>;
  delete(recordId: string, patientId: string): Promise<boolean>;
}

export interface IShareService {
  createLink(patientId: string, dto: CreateShareDTO): Promise<IShareLink>;
  revokeLink(linkId: string, patientId: string): Promise<boolean>;
  getLinksForRecord(recordId: string, patientId: string): Promise<IShareLink[]>;
  getLinksForDoctor(doctorId: string): Promise<IShareLink[]>;
  validateLink(linkId: string): Promise<IShareLink | null>;
}

export interface IEmergencyService {
  configure(patientId: string, scopedFields: string[]): Promise<IEmergencyAccess>;
  getByToken(qrToken: string): Promise<Partial<IPatient> | null>;
  deactivate(patientId: string): Promise<boolean>;
}

// ------------------------------------------------------------
// REPOSITORY INTERFACES
// ------------------------------------------------------------

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserRepository extends IRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

export interface IDocumentRepository extends IRepository<IMedicalRecord> {
  findByPatientId(patientId: string): Promise<IMedicalRecord[]>;
  findByCategory(patientId: string, category: DocumentCategory): Promise<IMedicalRecord[]>;
}

// ------------------------------------------------------------
// DATA TRANSFER OBJECTS (DTOs)
// ------------------------------------------------------------

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Patient-specific (optional at register time)
  bloodGroup?: string;
  allergies?: string[];
  diseases?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Doctor-specific (optional at register time)
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
}

export interface CreateRecordDTO {
  title: string;
  description: string;
  category: DocumentCategory;
}

export interface CreateShareDTO {
  recordId: string;
  doctorId: string;
  permission: SharePermission;
  expiresAt: Date;
}

// ------------------------------------------------------------
// ACCESS STRATEGY INTERFACE
// (used by Strategy Pattern in src/backend/services/AccessStrategy.ts)
// ------------------------------------------------------------

export interface IAccessStrategy {
  canAccess(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canModify(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canDelete(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canShare(userId: string, resource: IMedicalRecord): Promise<boolean>;
}
