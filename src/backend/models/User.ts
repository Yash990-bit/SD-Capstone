// ============================================================
// MediVault — OOP Class Hierarchy
// src/backend/models/User.ts
//
// Demonstrates all four OOP pillars:
//   - Encapsulation  (private fields + getters/setters)
//   - Inheritance    (Patient and Doctor extend abstract User)
//   - Polymorphism   (getAccessibleRecords() behaves differently per subclass)
//   - Abstraction    (abstract methods + IUser interface contract)
// ============================================================

import { IUser, IPatient, IDoctor, IMedicalRecord, IShareLink, UserRole } from '../interfaces';

// ------------------------------------------------------------
// ABSTRACT BASE CLASS — User
// ABSTRACTION: abstract methods define the contract without implementation
// ENCAPSULATION: _name is private; id and email are protected
// ------------------------------------------------------------
abstract class User implements IUser {
  // ENCAPSULATION: protected fields — accessible to subclasses but not externally
  protected id: string;
  protected email: string;

  // ENCAPSULATION: private field — not accessible even in subclasses directly
  private _name: string;

  // Required by IUser interface
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, email: string, name: string, passwordHash: string) {
    this.id = id;
    this.email = email;
    this._name = name;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // ENCAPSULATION: getter exposes the private _name field as read-only
  get name(): string {
    return this._name;
  }

  // ENCAPSULATION: setter validates before mutating the private field
  setName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this._name = newName.trim();
    this.updatedAt = new Date();
  }

  // IUser requires _id — map from protected id
  get _id(): string {
    return this.id;
  }

  // ABSTRACTION: subclasses must declare their own role
  abstract get role(): UserRole;

  // ABSTRACTION + POLYMORPHISM: each subclass returns records differently
  abstract getAccessibleRecords(userId: string): Promise<IMedicalRecord[]>;

  toJSON(): Omit<IUser, 'passwordHash'> {
    return {
      _id: this.id,
      name: this._name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    } as Omit<IUser, 'passwordHash'>;
  }
}

// ------------------------------------------------------------
// PATIENT — extends User
// INHERITANCE: Patient IS-A User; inherits auth fields and toJSON()
// ENCAPSULATION: medicalRecords is private; exposed via read-only accessor
// POLYMORPHISM: getAccessibleRecords() returns ALL own records
// ------------------------------------------------------------
class Patient extends User implements IPatient {
  bloodGroup: string;
  allergies: string[];
  diseases: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;

  // ENCAPSULATION: internal records list cannot be mutated directly from outside
  private medicalRecords: IMedicalRecord[] = [];

  constructor(
    id: string,
    email: string,
    name: string,
    passwordHash: string,
    bloodGroup: string = '',
    allergies: string[] = [],
    diseases: string[] = [],
    emergencyContactName: string = '',
    emergencyContactPhone: string = ''
  ) {
    // INHERITANCE: calls parent constructor
    super(id, email, name, passwordHash);
    this.bloodGroup = bloodGroup;
    this.allergies = allergies;
    this.diseases = diseases;
    this.emergencyContactName = emergencyContactName;
    this.emergencyContactPhone = emergencyContactPhone;
  }

  // ENCAPSULATION: controlled write access to the private records list
  addRecord(record: IMedicalRecord): void {
    this.medicalRecords.push(record);
  }

  // ENCAPSULATION: read-only view — caller cannot push/splice the array
  getRecords(): ReadonlyArray<IMedicalRecord> {
    return this.medicalRecords;
  }

  // ABSTRACTION: satisfies abstract declaration in User
  get role(): UserRole {
    return UserRole.PATIENT;
  }

  // POLYMORPHISM: Patient sees all their own records
  async getAccessibleRecords(userId: string): Promise<IMedicalRecord[]> {
    return this.medicalRecords.filter(record => record.patientId === userId);
  }

  // Returns only the scoped fields configured for emergency QR access
  getEmergencyInfo(): Partial<IPatient> {
    return {
      _id: this.id,
      name: this.name,
      bloodGroup: this.bloodGroup,
      allergies: [...this.allergies],
      diseases: [...this.diseases],
      emergencyContactName: this.emergencyContactName,
      emergencyContactPhone: this.emergencyContactPhone,
    };
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      bloodGroup: this.bloodGroup,
      allergies: this.allergies,
      diseases: this.diseases,
      emergencyContactName: this.emergencyContactName,
      emergencyContactPhone: this.emergencyContactPhone,
    };
  }
}

// ------------------------------------------------------------
// DOCTOR — extends User
// INHERITANCE: Doctor IS-A User; inherits auth fields and toJSON()
// POLYMORPHISM: getAccessibleRecords() only returns records from valid share links
// ------------------------------------------------------------
class Doctor extends User implements IDoctor {
  specialization: string;
  licenseNumber: string;
  hospital: string;

  // Share links passed in from the data layer — used to filter accessible records
  private sharedLinks: IShareLink[] = [];

  constructor(
    id: string,
    email: string,
    name: string,
    passwordHash: string,
    specialization: string = '',
    licenseNumber: string = '',
    hospital: string = ''
  ) {
    // INHERITANCE: calls parent constructor
    super(id, email, name, passwordHash);
    this.specialization = specialization;
    this.licenseNumber = licenseNumber;
    this.hospital = hospital;
  }

  setSharedLinks(links: IShareLink[]): void {
    this.sharedLinks = links;
  }

  // ABSTRACTION: satisfies abstract declaration in User
  get role(): UserRole {
    return UserRole.DOCTOR;
  }

  // POLYMORPHISM: Doctor only sees records with a valid, non-revoked, non-expired share link
  async getAccessibleRecords(_userId: string): Promise<IMedicalRecord[]> {
    const now = new Date();
    const validLinks = this.sharedLinks.filter(
      link => !link.isRevoked && new Date(link.expiresAt) > now
    );
    // Return placeholder records identified by recordId from valid links
    // In a real app, these would be populated via a join/populate call
    return validLinks.map(link => ({ _id: link.recordId } as unknown as IMedicalRecord));
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      specialization: this.specialization,
      licenseNumber: this.licenseNumber,
      hospital: this.hospital,
    };
  }
}

// ------------------------------------------------------------
// USER FACTORY — Factory Pattern
// Centralizes instantiation; callers never use `new Patient` / `new Doctor` directly
// ------------------------------------------------------------
type PatientCreationData = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  bloodGroup?: string;
  allergies?: string[];
  diseases?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

type DoctorCreationData = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
};

class UserFactory {
  // FACTORY PATTERN: create() returns the correct concrete subclass based on role
  static create(role: UserRole.PATIENT, data: PatientCreationData): Patient;
  static create(role: UserRole.DOCTOR, data: DoctorCreationData): Doctor;
  static create(role: UserRole, data: PatientCreationData | DoctorCreationData): Patient | Doctor {
    switch (role) {
      case UserRole.PATIENT: {
        const d = data as PatientCreationData;
        return new Patient(
          d.id,
          d.email,
          d.name,
          d.passwordHash,
          d.bloodGroup,
          d.allergies,
          d.diseases,
          d.emergencyContactName,
          d.emergencyContactPhone
        );
      }
      case UserRole.DOCTOR: {
        const d = data as DoctorCreationData;
        return new Doctor(d.id, d.email, d.name, d.passwordHash, d.specialization, d.licenseNumber, d.hospital);
      }
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}

export { User, Patient, Doctor, UserFactory };
