// ============================================================
// MediVault — Strategy Pattern: Access Control
// src/backend/services/AccessStrategy.ts
//
// Pattern: Strategy (Behavioral)
// Intent: Define a family of access-control algorithms, encapsulate
//         each one, and make them interchangeable at runtime.
//
// Class hierarchy:
//   IAccessStrategy (interface / contract)
//     ├── PatientAccessStrategy  — full CRUD on own records
//     └── DoctorAccessStrategy   — read-only on shared records
//   AccessControl (Context)      — holds and delegates to strategy
//   getAccessStrategy (factory)  — picks the correct strategy by role
// ============================================================

import { IAccessStrategy, IMedicalRecord, IShareLink, UserRole } from '../interfaces';

// ------------------------------------------------------------
// STRATEGY A — PatientAccessStrategy
// A patient has full control (access, modify, delete, share) over
// records where they are the owner (patientId === userId).
// ------------------------------------------------------------
export class PatientAccessStrategy implements IAccessStrategy {
  async canAccess(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return resource.patientId === userId;
  }

  async canModify(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return resource.patientId === userId;
  }

  async canDelete(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return resource.patientId === userId;
  }

  async canShare(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return resource.patientId === userId;
  }
}

// ------------------------------------------------------------
// STRATEGY B — DoctorAccessStrategy
// A doctor has READ-ONLY access to records shared via a valid,
// non-revoked, non-expired share link. Cannot modify, delete,
// or re-share any record.
// ------------------------------------------------------------
export class DoctorAccessStrategy implements IAccessStrategy {
  constructor(private readonly shareLinks: IShareLink[]) {}

  // Helper: checks that a valid share link exists for this doctor + record
  private hasValidLink(userId: string, resource: IMedicalRecord): boolean {
    const now = new Date();
    return this.shareLinks.some(
      link =>
        link.doctorId === userId &&
        link.recordId === resource._id &&
        !link.isRevoked &&
        new Date(link.expiresAt) > now
    );
  }

  async canAccess(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.hasValidLink(userId, resource);
  }

  // Doctors can never modify patient-uploaded records
  async canModify(_userId: string, _resource: IMedicalRecord): Promise<boolean> {
    return false;
  }

  // Doctors can never delete patient-uploaded records
  async canDelete(_userId: string, _resource: IMedicalRecord): Promise<boolean> {
    return false;
  }

  // Doctors cannot re-share records; only the patient may share
  async canShare(_userId: string, _resource: IMedicalRecord): Promise<boolean> {
    return false;
  }
}

// ------------------------------------------------------------
// CONTEXT — AccessControl
// Holds a reference to the active strategy and delegates all
// permission checks to it. The calling code (controllers/services)
// never imports a concrete strategy class directly — only this context.
// ------------------------------------------------------------
export class AccessControl {
  private strategy: IAccessStrategy;

  constructor(strategy: IAccessStrategy) {
    this.strategy = strategy;
  }

  // Swap strategies at runtime (e.g., after role escalation)
  setStrategy(strategy: IAccessStrategy): void {
    this.strategy = strategy;
  }

  checkAccess(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.strategy.canAccess(userId, resource);
  }

  checkModify(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.strategy.canModify(userId, resource);
  }

  checkDelete(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.strategy.canDelete(userId, resource);
  }

  checkShare(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.strategy.canShare(userId, resource);
  }
}

// ------------------------------------------------------------
// FACTORY FUNCTION — getAccessStrategy
// Picks the correct concrete strategy based on the user's role.
// Controllers call this once per request, then use AccessControl.
//
// Open/Closed Principle in action:
//   Adding AdminAccessStrategy or LabTechnicianAccessStrategy
//   = add a new case here + a new class above.
//   Zero changes to AccessControl or any controller.
// ------------------------------------------------------------
export function getAccessStrategy(role: UserRole, shareLinks: IShareLink[] = []): IAccessStrategy {
  switch (role) {
    case UserRole.PATIENT:
      return new PatientAccessStrategy();
    case UserRole.DOCTOR:
      return new DoctorAccessStrategy(shareLinks);
    default:
      throw new Error(`No access strategy defined for role: ${role}`);
  }
}
