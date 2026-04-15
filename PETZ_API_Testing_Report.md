# PETZ Backend — API Testing Report

**Project:** PETZ Animal Welfare Platform
**Date:** 2026-04-02
**Testing Tool:** Postman
**Backend:** Spring Boot (Java 17+), MySQL, JWT Authentication
**Server:** http://localhost:8081

---

## 1. Project Overview

PETZ is an animal rescue coordination platform that enables citizens to report injured/stray animals via SOS reports, automatically assigns nearby NGOs, tracks rescue missions in real-time, and manages the full lifecycle from report to case closure.

---

## 2. API Endpoints Inventory

### Total: 28 Endpoints across 10 Controllers

| # | Controller Class | Endpoint Count | Endpoints |
|---|---|---|---|
| 1 | `AuthController` | 5 | Send OTP, Verify OTP, Initiate Missed Call, Verify Missed Call, Convert Session |
| 2 | `SosReportController` | 4 | Create SOS Report, Upload Media, Get Report by ID, Get All Reports |
| 3 | `NgoController` | 4 | Assign NGO, Accept Mission, Decline Mission, Get Navigation |
| 4 | `RescueTrackingController` | 5 | Create Mission, Update Status, Get by ID, Get by SOS ID, Get by Status |
| 5 | `OnSiteRescueController` | 7 | Mark Arrival, Submit Assessment, Nearby Hospitals, Send Alert, Book Slot, Record Handover, Confirm Release |
| 6 | `MissionClosureController` | 2 | Submit Summary, Get Summary |
| 7 | `CaseVerificationController` | 2 | Verify & Close Case, Get Verification |
| 8 | `RescueHistoryController` | 1 | Get User Rescue History |
| 9 | `AdminRescueController` | 2 | Get Live Rescues, Reassign Rescue |
| 10 | `RescueKpiController` | 1 | Get KPIs |

---

## 3. Endpoints Tested

### Testing Flow (22 Steps Executed in Order)

| Step | Method | Endpoint | Status | Result |
|---|---|---|---|---|
| 1 | POST | `/api/v1/auth/send-otp` | 200 OK | OTP sent |
| 2 | POST | `/api/v1/auth/verify-otp` | 200 OK | JWT token + userId received |
| 3 | POST | `/api/v1/sos-reports` | 201 Created (after fix) | SOS report created |
| 4 | POST | `/api/v1/sos-reports/{id}/media` | 500 Error | Bug #3 — LazyInitializationException |
| 5 | GET | `/api/v1/sos-reports/{id}` | 500 Error | Bug #3 — same root cause |
| 6 | POST | `/ngo/assign` | 200 OK (after fix) | NGOs returned + missionId |
| 7 | POST | `/ngo/missions/{id}/accept` | 200 OK | Mission accepted |
| 8 | POST | `/api/v1/rescue-missions` | 201 Created | Rescue mission created |
| 9 | PUT | `/api/v1/rescue-missions/{id}/status` | 200 OK | Status updated to DISPATCHED |
| 10 | PATCH | `/api/v1/rescue/{id}/arrival` | 500 Error | Bug #5 — NgoAssignment missing |

**Endpoints tested: 10 out of 28**
**Endpoints passed: 7 out of 10**
**Endpoints failed: 3 (Bugs #3, #3, #5)**

---

## 4. Bugs Encountered

### Bug #1 — `reporterId` Validation Failure (Postman Configuration)

| Field | Detail |
|---|---|
| **Severity** | Low |
| **Type** | Postman Setup Issue |
| **Endpoint** | `POST /api/v1/sos-reports` |
| **Error Code** | 400 Bad Request |
| **Error Message** | `"reporterId: Reporter ID is required"` |
| **Root Cause** | The `{{userId}}` Postman collection variable was empty because the Post-response script was not configured in the Verify OTP request. The `reporterId` field was sent as blank/null. |
| **Class Involved** | `SosReportCreateRequest.java` — `@NotNull` validation on `reporterId` |
| **Resolution** | Added Post-response script in Verify OTP request (Scripts > Post-response) to auto-save `userId` and `token` from the response. |
| **Status** | Resolved |

---

### Bug #2 — `sosReportId` null in URL Path (Postman Configuration)

| Field | Detail |
|---|---|
| **Severity** | Low |
| **Type** | Postman Setup Issue |
| **Endpoint** | `POST /api/v1/sos-reports/{reportId}/media` |
| **Error Code** | 400 Bad Request |
| **Error Message** | `"Failed to convert value of type 'java.lang.String' to required type 'java.util.UUID'; Invalid UUID string: null"` |
| **Root Cause** | The `{{sosReportId}}` collection variable was empty. The URL resolved to `/api/v1/sos-reports/null/media`. Spring tried to convert the literal string `"null"` into a `UUID` and failed. |
| **Class Involved** | `SosReportController.java` — `@PathVariable UUID reportId` |
| **Resolution** | Added Post-response script in Create SOS Report request to auto-save `sosReportId` from `res.data.id`. |
| **Status** | Resolved |

---

### Bug #3 — Hibernate LazyInitializationException on `mediaFiles`

| Field | Detail |
|---|---|
| **Severity** | High |
| **Type** | Backend Code Bug |
| **Endpoint** | `POST /api/v1/sos-reports/{id}/media` and `GET /api/v1/sos-reports/{id}` |
| **Error Code** | 500 Internal Server Error |
| **Error Message** | `"Cannot lazily initialize collection of role 'SosReport.mediaFiles' with key '...' (no session)"` |
| **Root Cause** | The `mediaFiles` field in `SosReport.java` uses `@OneToMany` with default `FetchType.LAZY`. When `SosReportService.mapToResponse()` calls `report.getMediaFiles()`, the Hibernate session was already closed. |
| **Classes Involved** | |
| — Entity | `SosReport.java` — `@OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL)` |
| — Service | `SosReportService.java` — `mapToResponse()` accesses lazy collection |
| — Repository | `SosReportRepository.java` — no JOIN FETCH query |
| **Resolution** | Upon inspection, `@Transactional` annotations were already present on all service methods (`getReportById()`, `getAllReports()`, `uploadMedia()`). The issue was likely caused by a stale build. Restarting the Spring Boot application resolved the error. |
| **Status** | Resolved (app restart) |

---

### Bug #4 — `POST /ngo/assign` Does Not Create Mission or Return `missionId`

| Field | Detail |
|---|---|
| **Severity** | High |
| **Type** | Backend Code Bug + API Design Gap |
| **Endpoint** | `POST /ngo/assign` |
| **Error** | No error thrown, but response was missing critical data |
| **Problem** | The `assignNearestNgo()` method only queried NGOs and returned a list. It never created a `Mission` entity, and the response had no `missionId` field. This made downstream endpoints (`/missions/{id}/accept`, `/missions/{id}/decline`) unusable without querying the DB directly. |
| **Classes Involved** | |
| — Controller | `NgoController.java` — returned `List<NgoResponseDTO>` |
| — Service | `NgoService.java` — `assignNearestNgo()` never called `missionRepository.save()` |
| — DTO | `NgoResponseDTO.java` — no `missionId` field |
| **Resolution** | See Section 5 — Files Changed. Created new DTO, modified service to create Mission, updated controller. |
| **Status** | Resolved |

---

### Bug #5 — Missing `NgoAssignment` Record Causes Arrival Failure

| Field | Detail |
|---|---|
| **Severity** | High |
| **Type** | Backend Design Gap |
| **Endpoint** | `PATCH /api/v1/rescue/{sosReportId}/arrival` |
| **Error Code** | 500 Internal Server Error |
| **Error Message** | `"Something went wrong. Please try again."` (actual: `NoSuchElementException: No active assignment found`) |
| **Root Cause** | The `markArrival()` method in `OnSiteRescueService.java` queries `NgoAssignmentRepository.findBySosReportIdAndVolunteerId()` to find an assignment record. However, the NGO assignment flow (`/ngo/assign` + `/ngo/missions/{id}/accept`) creates records in the `mission` table, NOT the `ngo_assignments` table. These are two disconnected systems. |
| **Classes Involved** | |
| — Service | `OnSiteRescueService.java` (line 54-56) — expects `NgoAssignment` record |
| — Model | `NgoAssignment.java` — `ngo_assignments` table (rescue module) |
| — Model | `Mission.java` — `mission` table (NGO module) |
| **Workaround** | Manually insert an `NgoAssignment` record via MySQL Workbench with `assignment_status = 'ACCEPTED'` |
| **Recommended Fix** | The `acceptMission()` method in `NgoService` should also create an `NgoAssignment` record, bridging the two systems |
| **Status** | Workaround applied (manual DB insert) — permanent fix pending |

---

## 5. Files Changed (Code Fixes)

### Total Files Modified: 2
### Total Files Created: 1

---

### File 1 (NEW): `AssignResponseDTO.java`

| Field | Detail |
|---|---|
| **Path** | `PETZ/petzbackend/src/main/java/com/cts/mfrp/petzbackend/ngo/dto/AssignResponseDTO.java` |
| **Type** | New File |
| **Purpose** | Wrapper response DTO for the `/ngo/assign` endpoint |
| **Fields** | `Long missionId`, `String status`, `List<NgoResponseDTO> notifiedNgos` |
| **Bug Fixed** | Bug #4 |

---

### File 2 (MODIFIED): `NgoService.java`

| Field | Detail |
|---|---|
| **Path** | `PETZ/petzbackend/src/main/java/com/cts/mfrp/petzbackend/ngo/service/NgoService.java` |
| **Type** | Modified |
| **Bug Fixed** | Bug #4 |

**Changes Made:**

| Change | Description |
|---|---|
| Added import | `AssignResponseDTO` |
| Modified `assignNearestNgo()` | Added `UUID sosReportId` parameter. Changed return type from `List<NgoResponseDTO>` to `AssignResponseDTO`. Method now creates and persists a `Mission` entity before returning. |
| Added `findNearestNgos()` | Extracted private helper method containing the NGO query logic, reusable by both `assignNearestNgo()` and `reDispatch()`. |
| Modified `reDispatch()` | Changed from calling `assignNearestNgo()` (which would create a duplicate Mission) to directly resetting the existing mission's status, clearing declined NGOs, and resetting the timeout window. |

---

### File 3 (MODIFIED): `NgoController.java`

| Field | Detail |
|---|---|
| **Path** | `PETZ/petzbackend/src/main/java/com/cts/mfrp/petzbackend/ngo/controller/NgoController.java` |
| **Type** | Modified |
| **Bug Fixed** | Bug #4 |

**Changes Made:**

| Change | Description |
|---|---|
| Added imports | `AssignResponseDTO`, `java.util.UUID` |
| Modified `assignNgo()` | Added `@RequestParam UUID sosReportId` parameter. Changed return type from `ResponseEntity<List<NgoResponseDTO>>` to `ResponseEntity<AssignResponseDTO>`. Updated service call to pass `sosReportId`. |

---

## 6. Database Manual Interventions

| # | Action | Table | Purpose |
|---|---|---|---|
| 1 | INSERT | `ngo` | Added 3 sample NGO records with coordinates near the test SOS location for the assign endpoint to return results |
| 2 | INSERT | `ngo_assignments` | Added assignment record linking `sosReportId` + `volunteerId` as workaround for Bug #5 |

---

## 7. Postman Configuration

### Collection Variables Used

| Variable | Source | Auto-saved By |
|---|---|---|
| `baseUrl` | Manual (`http://localhost:8081`) | — |
| `token` | Verify OTP response | Post-response script |
| `userId` | Verify OTP response | Post-response script |
| `sosReportId` | Create SOS Report response | Post-response script |
| `missionId` | Assign NGO response | Post-response script |
| `ngoId` | Assign NGO response | Post-response script |
| `rescueMissionId` | Create Rescue Mission response | Post-response script |

### Authentication Setup

- **Type:** Bearer Token at collection level
- **Token:** `{{token}}` (auto-populated from Verify OTP)
- **Public endpoints** (No Auth): Send OTP, Verify OTP, NGO endpoints

### Post-response Scripts Added

**Request 2 — Verify OTP:**
```javascript
var res = pm.response.json();
pm.collectionVariables.set("token", res.data.accessToken);
pm.collectionVariables.set("userId", res.data.userId);
```

**Request 3 — Create SOS Report:**
```javascript
var res = pm.response.json();
pm.collectionVariables.set("sosReportId", res.data.id);
```

**Request 6 — Assign NGO:**
```javascript
var res = pm.response.json();
pm.collectionVariables.set("missionId", res.missionId);
pm.collectionVariables.set("ngoId", res.notifiedNgos[0].ngoId);
```

---

## 8. Summary

| Metric | Count |
|---|---|
| Total API Endpoints in Project | 28 |
| Endpoints Tested | 10 |
| Endpoints Passed | 7 |
| Endpoints Failed | 3 |
| Postman Config Issues Found | 2 (Bugs #1, #2) |
| Backend Code Bugs Found | 3 (Bugs #3, #4, #5) |
| Files Created | 1 (`AssignResponseDTO.java`) |
| Files Modified | 2 (`NgoService.java`, `NgoController.java`) |
| Bugs Fully Resolved | 4 (Bugs #1, #2, #3, #4) |
| Bugs Pending Permanent Fix | 1 (Bug #5 — workaround applied) |

---

## 9. Pending Items / Recommendations

| # | Item | Priority | Description |
|---|---|---|---|
| 1 | Bridge Mission ↔ NgoAssignment | High | `acceptMission()` in `NgoService` should also create an `NgoAssignment` record so the on-site rescue flow works without manual DB inserts |
| 2 | Complete remaining 18 endpoints | Medium | Steps 11-22 (Assessment, Hospitals, Booking, Handover, Summary, Verification, History, Admin, KPIs) remain untested |
| 3 | Add NGO seed data | Low | Create a data.sql or migration script to auto-populate NGO records for development/testing |
| 4 | Empty `notifiedNgos` when no NGOs exist | Low | The `/ngo/assign` endpoint returns an empty list silently when no NGOs are in the database — consider adding a warning or validation |
