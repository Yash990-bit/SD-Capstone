# MediVault Class Diagram

This class diagram outlines the N-Tier architecture of the MediVault application, detailing the flow between Controllers, Services, Repositories, and the underlying Domain Models.

```mermaid
classDiagram
    %% Controllers -> Services Relationships
    AuthController --> AuthService
    UserController --> UserService
    RecordController --> RecordService
    AppointmentController --> AppointmentService
    DocumentShareController --> DocumentShareService
    
    %% Services -> Repositories Relationships
    UserService --> UserRepository
    RecordService --> MedicalRecordRepository
    AppointmentService --> MedicalRecordRepository
    DocumentShareService --> DocumentRepository
    DocumentShareService ..> AccessStrategy : uses
    
    %% Models Relationships
    User "1" --> "0..*" MedicalRecord : owns
    User "1" --> "0..*" Appointment : participates
    MedicalRecord "1" --> "0..*" MedicalDocument : contains
    MedicalDocument "1" --> "0..*" DocumentShare : shared
    MedicalDocument "1" --> "0..*" DocumentAccessLog : logs
    
    %% CONTROLLERS
    class AuthController {
        +String login(String email, String password)
        +void register(String name, String email, String password)
        +void logout(String token)
    }

    class UserController {
        +User getProfile(String userId)
        +void updateProfile(String userId, String name, String email)
    }

    class RecordController {
        +void uploadRecord(String patientId, String doctorId, String diagnosis)
        +List~MedicalRecord~ getRecords(String patientId)
    }

    class AppointmentController {
        +void schedule(String patientId, String doctorId, Date date)
        +List~Appointment~ getAppointments(String userId)
    }

    class DocumentShareController {
        +void grantAccess(String documentId, String userId)
        +void revokeAccess(String shareId)
    }

    %% SERVICES
    class AuthService {
        ````markdown
        # MediVault Class Diagram (updated)

        This document reflects the current backend domain models and main service/repository/controller relationships in the project (as of April 2026).

        ```mermaid
        classDiagram
            %% Controllers -> Services Relationships
            AuthController --> AuthService
            UserController --> UserService
            RecordController --> RecordService
            AppointmentController --> AppointmentService
            DocumentShareController --> DocumentShareService
            EmergencyController --> EmergencyService
            AnalyticsController --> AnalyticsService

            %% Services -> Repositories Relationships
            UserService --> UserRepository
            RecordService --> MedicalRecordRepository
            AppointmentService --> AppointmentRepository
            DocumentShareService --> DocumentRepository
            EmergencyService --> EmergencyProfileRepository
            VitalsService --> VitalLogRepository
            AnalyticsService --> AnalyticsSnapshotRepository

            %% Models Relationships (based on mongoose schemas)
            User "1" --> "0..*" MedicalRecord : owns
            User "1" --> "0..*" MedicalDocument : patientDocuments
            User "1" --> "0..*" VitalLog : vitals
            User "1" --> "0..*" Appointment : appointmentsAsPatient
            User "1" --> "0..*" Appointment : appointmentsAsDoctor
            User "1" -- "1" EmergencyProfile : has
            User "1" -- "1" AnalyticsSnapshot : snapshot

            MedicalDocument "1" --> "0..*" DocumentShare : shares
            MedicalDocument "1" --> "0..*" DocumentAccessLog : accessLogs
            DocumentShare "*" --> "1" User : patient/doctor
            DocumentAccessLog "*" --> "1" User : doctor

            %% CONTROLLERS (representative operations)
            class AuthController {
                +login(email, password)
                +register(name, email, password)
                +logout(token)
            }

            class UserController {
                +getProfile(userId)
                +updateProfile(userId, data)
            }

            class RecordController {
                +uploadRecord(patientId, file)
                +listRecords(patientId)
            }

            class AppointmentController {
                +schedule(patientId, doctorId, date, time)
                +listAppointments(userId)
            }

            class DocumentShareController {
                +shareDocument(documentId, patientId, doctorId, permission)
                +revokeShare(shareId)
            }

            class EmergencyController {
                +enableEmergencyAccess(userId)
                +getPublicProfile(emergencyToken)
            }

            class AnalyticsController {
                +computeHealthScore(userId)
                +getSnapshot(userId)
            }

            %% SERVICES (representative)
            class AuthService {
                +registerUser(name, email, password)
                +authenticate(email, password)
                +generateToken(user)
            }

            class UserService {
                +getUser(userId)
                +updateUser(userId, data)
            }

            class RecordService {
                +createRecord(userId, file)
                +fetchRecords(userId)
            }

            class AppointmentService {
                +bookAppointment(patientId, doctorId, date, time)
                +cancelAppointment(appointmentId)
            }

            class DocumentShareService {
                +shareDocument(documentId, patientId, doctorId, permission)
                +validateAccess(documentId, userId, action)
            }

            class EmergencyService {
                +createOrUpdateProfile(userId, profileData)
                +generateEmergencyToken(userId)
            }

            class VitalsService {
                +logVital(userId, vitalData)
                +getVitals(userId, range)
            }

            class AnalyticsService {
                +updateSnapshot(userId)
                +getSnapshot(userId)
            }

            %% REPOSITORIES (representative)
            class UserRepository {
                +findById(id)
                +findByEmail(email)
                +save(user)
            }

            class MedicalRecordRepository {
                +findByUser(userId)
                +save(record)
            }

            class DocumentRepository {
                +findByPatient(patientId)
                +save(document)
            }

            class AppointmentRepository {
                +findByUser(userId)
                +save(appointment)
            }

            class EmergencyProfileRepository {
                +findByUser(userId)
                +save(profile)
            }

            class VitalLogRepository {
                +findByUser(userId)
                +save(vitalLog)
            }

            class AnalyticsSnapshotRepository {
                +findByUser(userId)
                +save(snapshot)
            }

            %% MODELS (from backend/models/*.js)
            class User {
                -ObjectId id
                -String name
                -String email <<unique>>
                -String password
                -String role {patient|doctor}
                -Date createdAt
                -Date updatedAt
            }

            class MedicalRecord {
                -ObjectId id
                -ObjectId user (ref User)
                -String fileName
                -String originalName
                -String fileUrl
                -String publicId
                -Number size
                -Date createdAt
                -Date updatedAt
            }

            class MedicalDocument {
                -ObjectId id
                -ObjectId patientId (ref User)
                -String title
                -String description
                -String fileUrl
                -String cloudinaryPublicId
                -String fileType
                -String documentType
                -Date createdAt
                -Date updatedAt
            }

            class DocumentShare {
                -ObjectId id
                -ObjectId documentId (ref MedicalDocument)
                -ObjectId patientId (ref User)
                -ObjectId doctorId (ref User)
                -String permission {VIEW|DOWNLOAD|FULL_ACCESS}
                -String expiry {1H|24H|7D|NEVER}
                -Date expiresAt
                -Date createdAt
                -Date updatedAt
            }

            class DocumentAccessLog {
                -ObjectId id
                -ObjectId documentId (ref MedicalDocument)
                -ObjectId doctorId (ref User)
                -String action {VIEW|DOWNLOAD|REVOKE|SHARE}
                -Date accessedAt
            }

            class Appointment {
                -ObjectId id
                -ObjectId patientId (ref User)
                -ObjectId doctorId (ref User)
                -Date date
                -String time
                -String reason
                -String status {Pending|Accepted|Rejected|Completed|Cancelled}
                -String notes
                -Date createdAt
                -Date updatedAt
            }

            class EmergencyProfile {
                -ObjectId id
                -ObjectId user (ref User) <<unique>>
                -Boolean emergencyAccessEnabled
                -String emergencyToken <<unique>>
                -EmergencyProfileData emergencyProfile
                -Date createdAt
                -Date updatedAt
            }

            class EmergencyProfileData {
                -String fullName
                -Number age
                -String bloodGroup
                -String[] allergies
                -String[] conditions
                -String[] medications
                -Contact[] emergencyContacts
                -String notes
            }

            class Contact {
                -String name
                -String relation
                -String phone
            }

            class VitalLog {
                -ObjectId id
                -ObjectId userId (ref User)
                -Date date
                -Number weight
                -Number height
                -Number bmi
                -Number bloodPressureSystolic
                -Number bloodPressureDiastolic
                -Number bloodSugarFasting
                -Number bloodSugarRandom
                -Number heartRate
                -Number oxygenLevel
                -Number temperature
                -Number sleepHours
                -Number steps
                -String notes
                -Date createdAt
                -Date updatedAt
            }

            class AnalyticsSnapshot {
                -ObjectId id
                -ObjectId userId (ref User) <<unique>>
                -Number healthScore (0..100)
                -String[] riskFlags
                -String[] recommendations
                -Date createdAt
            }

            %% Notes
            note for EmergencyProfileData
              Embedded/composed document stored inside EmergencyProfile
            end note

            note "Indexes: email(unique), EmergencyProfile.user(unique), AnalyticsSnapshot.user(unique), VitalLog index {userId,date}" as N1
            end note
        ```
        ````
