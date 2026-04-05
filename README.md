# MediVault — Digital Health Record Management System

> A secure, role-based web application for managing, sharing, and accessing medical records — putting patients in control of their own health data.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [User Roles](#user-roles)
4. [Main Modules](#main-modules)
5. [Technology Stack](#technology-stack)
6. [Security Features](#security-features)
7. [Project Structure](#project-structure)
8. [SDLC Approach](#sdlc-approach)
9. [OOP Concepts Used](#oop-concepts-used)
10. [Design Pattern — Strategy Pattern](#design-pattern--strategy-pattern)
11. [Additional Patterns](#additional-patterns)
12. [Database Design](#database-design)
13. [Getting Started](#getting-started)
14. [Team Contributions](#team-contributions)

---

## Problem Statement

Medical records in the current healthcare ecosystem are largely paper-based, siloed within individual hospitals and clinics, and highly fragmented:

- **Lost or damaged records** — physical documents deteriorate, get misplaced, or are destroyed in emergencies.
- **No centralized history** — when a patient visits a new doctor, previous test results, diagnoses, and prescriptions are unavailable, leading to redundant tests and misdiagnosis.
- **No emergency access** — in a critical situation where the patient is unconscious, there is no fast, reliable way for paramedics or ER staff to access vital medical information (blood group, allergies, current medications).
- **No patient control** — patients have no clear mechanism to consent to or revoke access to their own health data.
- **No secure sharing** — when records need to be shared between healthcare providers, the process is manual, slow, and prone to privacy violations.

MediVault addresses all of these gaps with a secure, consent-driven, digital health record platform.

---

## Proposed Solution

MediVault is a full-stack web application that provides:

- **Patient-controlled document management** — patients upload, categorize, and manage their own medical records (PDFs, images) stored in encrypted cloud storage.
- **Consent-based doctor access** — patients generate time-limited, revocable share links for specific records; doctors can only view what they are explicitly granted access to.
- **Emergency QR code access** — patients configure a scoped emergency profile (blood group, allergies, critical conditions) accessible via a QR code scan — no login required, minimal data exposure.
- **Consultation notes** — doctors can attach notes and digital prescriptions to shared records, creating a collaborative care history.
- **Role-Based Access Control (RBAC)** — every API endpoint and data operation is protected by middleware that enforces role-specific permissions at the server level.

---

## User Roles

| Role | Capabilities | Restrictions |
|------|-------------|--------------|
| **Patient** | Register and login; Upload medical reports (PDF/images); Categorize documents (lab report, prescription, imaging, etc.); View, manage, and delete their own records; Generate time-limited share links for specific records; Generate emergency QR code with scoped medical info; Add/edit medical profile (blood group, allergies, chronic diseases, emergency contact) | Cannot view other patients' data; Cannot access the system as a doctor |
| **Doctor** | Login with verified credentials; View patient records shared via a valid share link; Add consultation notes to shared records; Upload digital prescriptions linked to a patient; Download reports if the share permission allows it | Cannot access any patient record without an explicit, valid, non-revoked share link; Cannot modify or delete patient-uploaded records; Cannot access the system as a patient |

> **Key Principle:** The patient is the data owner. All access by doctors is gated by patient-generated share links. Patients can revoke access at any time.

---

## Main Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **User Management Module** | Handles registration, login, JWT-based authentication, profile management for both patients and doctors. Includes role assignment at registration time. |
| 2 | **Document Management Module** | Allows patients to upload, categorize, view, update metadata for, and delete medical records. Files are stored in encrypted cloud storage; only the file URL and metadata are persisted in MongoDB. |
| 3 | **Secure Sharing Module** | Enables patients to generate time-limited, permission-scoped share links for individual records. Doctors access records through these links. Patients can revoke links at any time. |
| 4 | **Emergency Access Module** | Patients configure a scoped emergency profile. A QR code encodes a token that grants read-only access to critical fields (blood group, allergies, active conditions) without full authentication. |
| 5 | **Role-Based Access Control Module** | Middleware layer that enforces permissions on every API route. Implements the Strategy Pattern to determine what each role can do with each resource. Ensures RBAC is enforced at the server, not just the client. |

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React + TypeScript | Component-based UI, strong typing reduces runtime errors, large ecosystem |
| **Backend** | Node.js + Express (TypeScript) | Non-blocking I/O ideal for file upload/streaming; TypeScript enforces contracts across the codebase |
| **Database** | MongoDB (Mongoose ODM) | Flexible document model suits varied medical record formats; Mongoose adds schema validation and discriminator support |
| **Authentication** | JWT (JSON Web Tokens) | Stateless auth scales well; tokens carry role claims used by RBAC middleware |
| **Password Security** | bcrypt | Industry-standard adaptive hashing; salt rounds protect against brute force and rainbow table attacks |
| **File Storage** | Cloud Storage (encrypted) | Patient files are never stored on the application server; cloud provider handles encryption at rest and in transit |

---

## Security Features

- **bcrypt password hashing** — passwords are never stored in plain text; bcrypt's work factor is configurable to keep pace with hardware improvements.
- **JWT stateless authentication** — tokens are signed with a server secret, expire after 24 hours, and carry the user's ID and role.
- **RBAC at middleware level** — `authenticate` and `authorize` middlewares run before any controller logic; a misconfigured route still cannot leak data.
- **Encrypted file storage** — medical documents are stored in an encrypted cloud bucket; the app server only holds URLs, never file bytes.
- **Time-limited, revocable share links** — every share link carries an `expiresAt` timestamp and an `isRevoked` flag; the server checks both on every access attempt.
- **Emergency QR scoped access** — the QR token only exposes fields the patient has explicitly opted to include; it does not grant login-level access.

---

## Project Structure

```
medivault/
├── src/
│   ├── frontend/               # React + TypeScript frontend (future)
│   └── backend/
│       ├── config/             # DB connection, cloud storage config
│       ├── controllers/        # Route handler functions
│       ├── interfaces/         # TypeScript interfaces, enums, DTOs
│       │   └── index.ts
│       ├── middleware/         # auth, authorize, error handling
│       │   └── auth.ts
│       ├── models/             # OOP class hierarchy + Mongoose schemas
│       │   ├── User.ts         # Abstract User, Patient, Doctor, UserFactory
│       │   └── schemas.ts      # Mongoose schemas with discriminators
│       ├── routes/             # Express route definitions
│       ├── services/           # Business logic
│       │   └── AccessStrategy.ts  # Strategy Pattern implementation
│       └── utils/              # Helper functions
├── docs/                       # Project documentation
├── diagrams/                   # Architecture and class diagrams
│   └── README.md
├── dbDesign/                   # Database design artifacts
│   └── er-diagram.md           # Mermaid ER diagram
└── README.md
```

---

## SDLC Approach

### Agile (Iterative Development)

We chose **Agile** over a Waterfall approach for the following reasons:

1. **Evolving requirements** — Medical software requirements (especially around privacy, sharing permissions, and emergency access) are complex and clarify progressively as we build and demo.
2. **Working software in short cycles** — Agile lets us deliver a functional subset (e.g., auth + document upload) early, get feedback, and incrementally add modules.
3. **Risk reduction** — In a healthcare-adjacent domain, discovering design flaws early (e.g., in the sharing model or RBAC logic) is far less costly than catching them late in a waterfall timeline.
4. **Team collaboration** — With a small academic team and parallel work streams (frontend/backend), iterative sprints with daily syncs keep integration issues small.

### SDLC Phases for MediVault

| Phase | Description | What We Did for MediVault |
|-------|-------------|--------------------------|
| **1. Requirements Gathering** | Identify stakeholders, use cases, and functional/non-functional requirements | Defined Patient and Doctor user stories; identified core modules (document mgmt, secure sharing, emergency access); listed security requirements (encryption, RBAC, revocable links) |
| **2. System Design** | Architecture, data model, API contracts, class hierarchy | Designed MongoDB schema with discriminator pattern; defined TypeScript interfaces as contracts; chose Strategy Pattern for RBAC; created ER diagram; outlined REST API endpoints |
| **3. Implementation (Iterative)** | Sprint-based coding in priority order | Sprint 1: Auth (register/login/JWT); Sprint 2: Document upload + CRUD; Sprint 3: Share links + doctor access; Sprint 4: Emergency QR; Sprint 5: Consultation notes + frontend polish |
| **4. Testing** | Unit, integration, and manual testing at each sprint | Unit tests for AccessStrategy logic; integration tests for auth middleware; manual end-to-end testing for share link expiry and revocation flows |
| **5. Deployment** | Deploy backend API and frontend to cloud | Backend deployed via Node.js server; frontend built and served statically; environment variables managed securely outside version control |
| **6. Maintenance** | Bug fixes, security patches, feature additions | Monitor JWT token expiry edge cases; update bcrypt work factor; address user feedback on UI/UX; extend sharing model if new role types are added |

---

## OOP Concepts Used

MediVault's backend class hierarchy demonstrates all four pillars of Object-Oriented Programming. All examples are from `src/backend/models/User.ts`.

### a) Encapsulation

Private data is hidden behind controlled interfaces. External code cannot directly mutate sensitive fields.

```typescript
// ENCAPSULATION: _name is private, only accessible via getter/setter
class User {
  private _name: string;         // Cannot be accessed as user._name externally

  get name(): string {
    return this._name;
  }

  setName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this._name = newName.trim();
  }
}

// ENCAPSULATION: Patient's record list is private, exposed as read-only
class Patient extends User {
  private medicalRecords: IMedicalRecord[] = [];

  addRecord(record: IMedicalRecord): void {
    this.medicalRecords.push(record);
  }

  getRecords(): ReadonlyArray<IMedicalRecord> {
    return this.medicalRecords;   // Caller cannot push/pop directly
  }
}
```

### b) Inheritance

`Patient` and `Doctor` both extend the abstract `User` base class, inheriting shared behavior (auth fields, `toJSON`) and adding their own domain-specific fields.

```typescript
// INHERITANCE: abstract base class
abstract class User {
  protected id: string;
  protected email: string;
  private _name: string;
  passwordHash: string;

  constructor(id: string, email: string, name: string, passwordHash: string) {
    this.id = id;
    this.email = email;
    this._name = name;
    this.passwordHash = passwordHash;
  }

  toJSON() {
    return { _id: this.id, email: this.email, name: this._name, role: this.role };
  }

  abstract get role(): UserRole;
  abstract getAccessibleRecords(userId: string): Promise<IMedicalRecord[]>;
}

// INHERITANCE: Patient IS-A User
class Patient extends User {
  bloodGroup: string;
  allergies: string[];
  diseases: string[];

  constructor(
    id: string, email: string, name: string, passwordHash: string,
    bloodGroup: string = '', allergies: string[] = [], diseases: string[] = []
  ) {
    super(id, email, name, passwordHash);  // Calls User constructor
    this.bloodGroup = bloodGroup;
    this.allergies = allergies;
    this.diseases = diseases;
  }
}

// INHERITANCE: Doctor IS-A User
class Doctor extends User {
  specialization: string;
  licenseNumber: string;
  hospital: string;

  constructor(
    id: string, email: string, name: string, passwordHash: string,
    specialization: string = '', licenseNumber: string = '', hospital: string = ''
  ) {
    super(id, email, name, passwordHash);  // Calls User constructor
    this.specialization = specialization;
    this.licenseNumber = licenseNumber;
    this.hospital = hospital;
  }
}
```

### c) Polymorphism

Both `Patient` and `Doctor` implement `getAccessibleRecords()`, but with completely different behavior — the method name is the same, the logic is role-specific.

```typescript
// POLYMORPHISM: same method name, different behavior per subclass

class Patient extends User {
  private medicalRecords: IMedicalRecord[] = [];

  get role(): UserRole { return UserRole.PATIENT; }

  // Patient can see ALL of their own records
  async getAccessibleRecords(userId: string): Promise<IMedicalRecord[]> {
    return this.medicalRecords.filter(record => record.patientId === userId);
  }
}

class Doctor extends User {
  private sharedLinks: IShareLink[] = [];

  get role(): UserRole { return UserRole.DOCTOR; }

  // Doctor can only see records with a valid, non-revoked, non-expired share link
  async getAccessibleRecords(_userId: string): Promise<IMedicalRecord[]> {
    const now = new Date();
    const validLinks = this.sharedLinks.filter(
      link => !link.isRevoked && new Date(link.expiresAt) > now
    );
    return validLinks.map(link => ({ _id: link.recordId } as unknown as IMedicalRecord));
  }
}

// Polymorphic usage — caller does not care about the concrete type
async function listRecords(user: User): Promise<IMedicalRecord[]> {
  return user.getAccessibleRecords(user.id);  // Dispatches correctly at runtime
}
```

### d) Abstraction

The `IUser`, `IDocument`, and `IAccessStrategy` interfaces define *what* operations exist without specifying *how* they are implemented. Abstract class members enforce that subclasses provide concrete behavior.

```typescript
// ABSTRACTION: interface defines the contract, hides implementation
interface IAccessStrategy {
  canAccess(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canModify(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canDelete(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canShare(userId: string, resource: IMedicalRecord): Promise<boolean>;
}

// Implementations vary — the caller only knows the interface
class PatientAccessStrategy implements IAccessStrategy {
  async canAccess(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return resource.patientId === userId;
  }
  // ...
}

class DoctorAccessStrategy implements IAccessStrategy {
  async canAccess(userId: string, resource: IMedicalRecord): Promise<boolean> {
    return this.shareLinks.some(
      link => link.doctorId === userId &&
               link.recordId === resource._id &&
               !link.isRevoked &&
               new Date(link.expiresAt) > new Date()
    );
  }
  // ...
}
```

---

## Design Pattern — Strategy Pattern

### What Is the Strategy Pattern?

The **Strategy Pattern** is a behavioral design pattern that defines a family of algorithms (strategies), encapsulates each one, and makes them interchangeable. The pattern lets the algorithm vary independently from the clients that use it.

### Why We Chose It for Access Control

Without a pattern, access control devolves into deeply nested `if/else` or `switch` blocks scattered across controllers:

```typescript
// BAD — what we want to avoid
if (user.role === 'patient') {
  if (record.patientId === user.id) { /* allow */ }
} else if (user.role === 'doctor') {
  const link = await ShareLink.findOne({ doctorId: user.id, recordId: record.id });
  if (link && !link.isRevoked && link.expiresAt > Date.now()) { /* allow */ }
}
// Adding a new role means touching this code everywhere
```

The Strategy Pattern solves this by:
- **Open/Closed Principle** — existing strategy classes are closed for modification; adding a new role (e.g., `AdminAccessStrategy`, `LabTechnicianAccessStrategy`) requires only a new class.
- **Single Responsibility** — each strategy class is responsible for exactly one role's access rules.
- **Testability** — each strategy can be unit-tested in isolation.

### Implementation

```typescript
// IAccessStrategy — the common interface (ABSTRACTION)
interface IAccessStrategy {
  canAccess(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canModify(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canDelete(userId: string, resource: IMedicalRecord): Promise<boolean>;
  canShare(userId: string, resource: IMedicalRecord): Promise<boolean>;
}

// Strategy A — Patient has full control over their own records
class PatientAccessStrategy implements IAccessStrategy {
  async canAccess(userId, resource)  { return resource.patientId === userId; }
  async canModify(userId, resource)  { return resource.patientId === userId; }
  async canDelete(userId, resource)  { return resource.patientId === userId; }
  async canShare(userId, resource)   { return resource.patientId === userId; }
}

// Strategy B — Doctor has read-only access via valid share link
class DoctorAccessStrategy implements IAccessStrategy {
  constructor(private shareLinks: IShareLink[]) {}

  private hasValidLink(userId: string, resource: IMedicalRecord): boolean {
    return this.shareLinks.some(link =>
      link.doctorId === userId &&
      link.recordId === resource._id &&
      !link.isRevoked &&
      new Date(link.expiresAt) > new Date()
    );
  }

  async canAccess(userId, resource)  { return this.hasValidLink(userId, resource); }
  async canModify(userId, resource)  { return false; }  // Doctors never modify
  async canDelete(userId, resource)  { return false; }  // Doctors never delete
  async canShare(userId, resource)   { return false; }  // Doctors never re-share
}

// Context class — holds and delegates to the active strategy
class AccessControl {
  private strategy: IAccessStrategy;

  constructor(strategy: IAccessStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IAccessStrategy): void {
    this.strategy = strategy;
  }

  checkAccess(userId: string, resource: IMedicalRecord)  { return this.strategy.canAccess(userId, resource); }
  checkModify(userId: string, resource: IMedicalRecord)  { return this.strategy.canModify(userId, resource); }
  checkDelete(userId: string, resource: IMedicalRecord)  { return this.strategy.canDelete(userId, resource); }
  checkShare(userId: string, resource: IMedicalRecord)   { return this.strategy.canShare(userId, resource); }
}
```

### Class Hierarchy Diagram (Text)

```
         +--------------------------+
         |   <<interface>>          |
         |   IAccessStrategy        |
         |--------------------------|
         | + canAccess(): boolean   |
         | + canModify(): boolean   |
         | + canDelete(): boolean   |
         | + canShare():  boolean   |
         +------------+-------------+
                      |  implements
           +----------+-----------+
           v                      v
+--------------------+   +----------------------+
| PatientAccess      |   | DoctorAccess         |
| Strategy           |   | Strategy             |
|--------------------|   |----------------------|
| + canAccess  YES   |   | - shareLinks[]       |
| + canModify  YES   |   |----------------------|
| + canDelete  YES   |   | + canAccess  YES*    |
| + canShare   YES   |   | + canModify  NO      |
+--------------------+   | + canDelete  NO      |
                         | + canShare   NO      |
                         +----------+-----------+
                                    ^
                         +----------+-----------+
                         |  AccessControl       |
                         |  (Context)           |
                         |----------------------|
                         | - strategy           |
                         |----------------------|
                         | + setStrategy()      |
                         | + checkAccess()      |
                         | + checkModify()      |
                         | + checkDelete()      |
                         | + checkShare()       |
                         +----------------------+
  * only if valid, non-revoked share link exists
```

### Class Diagram

![Class Diagram](diagrams/class-diagram.png)

> **Extensibility:** Adding `AdminAccessStrategy` or `LabTechnicianAccessStrategy` requires only a new class implementing `IAccessStrategy`. Zero changes to `AccessControl`, zero changes to any controller.

---

## Additional Patterns

| Pattern | Where Used | Why |
|---------|-----------|-----|
| **Repository Pattern** | `IUserRepository`, `IDocumentRepository` interfaces + Mongoose implementations | Decouples business logic from data access; controllers call repository methods, not Mongoose directly — swapping MongoDB for another DB touches only the repository layer |
| **Middleware Chain (Chain of Responsibility)** | Express `authenticate` → `authorize` → controller pipeline | Each middleware either passes the request to the next handler or short-circuits with an error; cleanly separates authentication (who are you?) from authorization (what can you do?) |
| **Factory Pattern** | `UserFactory.create(role, data)` | Centralizes object creation logic; callers don't need to know whether to instantiate `Patient` or `Doctor` — they pass a role and data, the factory returns the correct concrete class |

---

## Database Design

### Entities

| Entity | Key Fields |
|--------|-----------|
| **User** | `_id`, `name`, `email` (unique), `passwordHash`, `role` (enum), `createdAt`, `updatedAt` |
| **Patient** | Extends User + `bloodGroup`, `allergies[]`, `diseases[]`, `emergencyContactName`, `emergencyContactPhone` |
| **Doctor** | Extends User + `specialization`, `licenseNumber` (unique), `hospital` |
| **MedicalRecord** | `_id`, `patientId` (FK→User), `title`, `description`, `category` (enum), `fileUrl`, `fileType`, `fileSizeBytes`, `uploadedAt` |
| **ShareLink** | `_id`, `recordId` (FK→MedicalRecord), `patientId` (FK→User), `doctorId` (FK→User), `permission` (enum), `expiresAt`, `isRevoked`, `createdAt` |
| **ConsultationNote** | `_id`, `doctorId` (FK→User), `patientId` (FK→User), `recordId` (FK→MedicalRecord, optional), `note`, `createdAt` |
| **EmergencyAccess** | `_id`, `patientId` (FK→User, unique), `qrCodeData`, `scopedFields[]`, `isActive`, `createdAt` |

### Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| User → Patient | 1:1 (is-a) | Patient is a specialization of User (discriminator) |
| User → Doctor | 1:1 (is-a) | Doctor is a specialization of User (discriminator) |
| Patient → MedicalRecord | 1:N | A patient uploads many records |
| Patient → ShareLink | 1:N | A patient creates many share links |
| Doctor → ShareLink | 1:N | A doctor receives many share links |
| MedicalRecord → ShareLink | 1:N | A record can be shared via many links |
| Doctor → ConsultationNote | 1:N | A doctor writes many notes |
| Patient → ConsultationNote | 1:N | A patient receives many notes |
| MedicalRecord → ConsultationNote | 1:N | A record can have many notes attached |
| Patient → EmergencyAccess | 1:1 | Each patient has one emergency profile |

### ER Diagram

![ER Diagram](dbDesign/er-diagram.png)
> See also: [Mermaid version (renders on GitHub)](dbDesign/er-diagram.md)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd medivault

# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running in Development

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

### Environment Variables

Create a `.env` file in the `src/backend/` directory (never commit this file):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medivault
JWT_SECRET=your-secret-key-here
```

---

## Team Contributions

Each team member's individual contributions are tracked via Git commits. Use the following to verify:

```bash
git log --oneline --author="<name>"
```

| Member | Role | Key Responsibilities |
|--------|------|---------------------|
| M1 | Lead / Frontend | Project setup, README, React scaffold, routing, integration |
| M2 | Database / Config | ER diagram, MongoDB config, login/register UI |
| M3 | Auth / Security | TypeScript interfaces, base classes, auth service (bcrypt + JWT) |
| M4 | Documents / UX | Class diagrams, document CRUD API, patient dashboard UI |
| M5 | Access Control / Schemas | Mongoose schemas, RBAC middleware, Strategy Pattern |
