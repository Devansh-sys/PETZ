package com.petz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.petz.dto.response.AdoptionApplicationResponse;
import com.petz.dto.response.AppointmentResponse;
import com.petz.dto.response.RescueReportResponse;
import com.petz.entity.*;
import com.petz.enums.AnimalStatus;
import com.petz.enums.RescueStatus;
import com.petz.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * Provides live DB data to Healio (chatbot) via Gemini Function Calling.
 * Each method is invoked when Gemini decides to call the matching tool.
 * All data is scoped to the authenticated user — no cross-user leakage.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatDataService {

    private final AppointmentService    appointmentService;
    private final AdoptionService       adoptionService;
    private final PetService            petService;
    private final RescueService         rescueService;
    private final HospitalService       hospitalService;
    private final NgoService            ngoService;
    private final UserService           userService;

    // Direct repos (for counts / quick lookups without full service overhead)
    private final UserRepository              userRepo;
    private final HospitalRepository         hospitalRepo;
    private final NgoRepository              ngoRepo;
    private final AppointmentRepository      appointmentRepo;
    private final RescueReportRepository     rescueRepo;
    private final AdoptableAnimalRepository  animalRepo;

    private final ObjectMapper mapper = new ObjectMapper()
            .findAndRegisterModules()
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    // ── Function router ────────────────────────────────────────────────────
    public String executeFunction(String funcName, Map<String, Object> args,
                                  Long userId, String role) {
        try {
            return switch (funcName) {
                case "get_my_appointments"          -> getMyAppointments(args, userId, role);
                case "get_my_adoption_applications" -> getMyAdoptionApplications(args, userId);
                case "get_my_pets"                  -> getMyPets(userId);
                case "get_my_animals"               -> getMyAnimals(args, userId);
                case "get_ngo_applications"         -> getNgoApplications(args, userId);
                case "get_my_rescues"               -> getMyRescues(userId, role);
                case "get_hospital_appointments"    -> getHospitalAppointments(args, userId);
                case "get_hospital_profile"         -> getHospitalProfile(userId);
                case "get_ngo_profile"              -> getNgoProfile(userId);
                case "get_platform_stats"           -> getPlatformStats();
                case "get_pending_approvals"        -> getPendingApprovals();
                default -> "{\"error\":\"Unknown function: " + funcName + "\"}";
            };
        } catch (Exception e) {
            log.error("ChatDataService.executeFunction failed [{}]: {}", funcName, e.getMessage());
            return "{\"error\":\"Could not fetch data. Please try again.\"}";
        }
    }

    // ── PET OWNER ─────────────────────────────────────────────────────────

    /** Appointments (user or hospital depending on role) */
    private String getMyAppointments(Map<String, Object> args, Long userId, String role)
            throws Exception {
        List<AppointmentResponse> appts;
        if ("HOSPITAL".equalsIgnoreCase(role)) {
            Hospital h = hospitalRepo.findByOwnerUserId(userId).orElse(null);
            if (h == null) return "{\"error\":\"Hospital profile not set up yet.\"}";
            appts = appointmentService.getByHospital(h.getId());
        } else {
            appts = appointmentService.getByUser(userId);
        }

        String statusFilter = args != null ? (String) args.get("status") : null;
        boolean todayOnly   = args != null && Boolean.TRUE.equals(args.get("today"));

        if (todayOnly)
            appts = appts.stream().filter(a -> LocalDate.now().equals(a.getApptDate())).toList();
        if (statusFilter != null && !statusFilter.isBlank()) {
            final String sf = statusFilter.toUpperCase();
            appts = appts.stream().filter(a -> sf.equals(a.getStatus())).toList();
        }

        List<Map<String, Object>> list = appts.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",     a.getId());
            m.put("date",   a.getApptDate());
            m.put("time",   a.getApptTime());
            m.put("status", a.getStatus());
            m.put("reason", a.getReason());
            if (a.getHospitalName() != null)       m.put("hospital",        a.getHospitalName());
            if (a.getHospitalCity() != null)        m.put("city",            a.getHospitalCity());
            if (a.getDoctorName() != null)          m.put("doctor",          a.getDoctorName());
            if (a.getDoctorSpecialization() != null)m.put("specialization",  a.getDoctorSpecialization());
            if (a.getPetName() != null)             m.put("pet",             a.getPetName());
            if (a.getUserName() != null)            m.put("ownerName",       a.getUserName());
            return m;
        }).toList();

        return mapper.writeValueAsString(Map.of("appointments", list, "total", list.size()));
    }

    /** Adoption applications submitted by the user */
    private String getMyAdoptionApplications(Map<String, Object> args, Long userId)
            throws Exception {
        List<AdoptionApplicationResponse> apps = adoptionService.getApplicationsByUser(userId);

        String statusFilter = args != null ? (String) args.get("status") : null;
        if (statusFilter != null && !statusFilter.isBlank()) {
            final String sf = statusFilter.toUpperCase();
            apps = apps.stream().filter(a -> sf.equals(a.getStatus())).toList();
        }

        List<Map<String, Object>> list = apps.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          a.getId());
            m.put("status",      a.getStatus());
            m.put("appliedAt",   a.getAppliedAt());
            if (a.getAnimalName() != null)   m.put("animalName",    a.getAnimalName());
            if (a.getAnimalSpecies() != null) m.put("animalSpecies", a.getAnimalSpecies());
            if (a.getAnimalCity() != null)    m.put("animalCity",    a.getAnimalCity());
            if (a.getNgoName() != null)       m.put("ngo",           a.getNgoName());
            if (a.getAdminNotes() != null)    m.put("notes",         a.getAdminNotes());
            return m;
        }).toList();

        return mapper.writeValueAsString(Map.of("applications", list, "total", list.size()));
    }

    /** Registered pets belonging to the user */
    private String getMyPets(Long userId) throws Exception {
        List<Pet> pets = petService.getByOwner(userId);
        List<Map<String, Object>> list = pets.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",       p.getId());
            m.put("name",     p.getName());
            m.put("species",  p.getSpecies());
            m.put("breed",    p.getBreed());
            m.put("ageYears", p.getAgeYears());
            m.put("gender",   p.getGender());
            m.put("weightKg", p.getWeightKg());
            m.put("notes",    p.getNotes());
            return m;
        }).toList();
        return mapper.writeValueAsString(Map.of("pets", list, "total", list.size()));
    }

    // ── NGO ───────────────────────────────────────────────────────────────

    /** Animals listed by the NGO */
    private String getMyAnimals(Map<String, Object> args, Long userId) throws Exception {
        List<AdoptableAnimal> animals = adoptionService.getByNgo(userId);

        String statusFilter = args != null ? (String) args.get("status") : null;
        if (statusFilter != null && !statusFilter.isBlank()) {
            try {
                AnimalStatus as = AnimalStatus.valueOf(statusFilter.toUpperCase());
                animals = animals.stream().filter(a -> as.equals(a.getStatus())).toList();
            } catch (IllegalArgumentException ignored) {}
        }

        List<Map<String, Object>> list = animals.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",        a.getId());
            m.put("name",      a.getName());
            m.put("species",   a.getSpecies());
            m.put("breed",     a.getBreed());
            m.put("status",    a.getStatus());
            m.put("city",      a.getCity());
            m.put("vaccinated",a.getIsVaccinated());
            m.put("neutered",  a.getIsNeutered());
            return m;
        }).toList();
        return mapper.writeValueAsString(Map.of("animals", list, "total", list.size()));
    }

    /** Adoption applications received by the NGO */
    private String getNgoApplications(Map<String, Object> args, Long userId) throws Exception {
        List<AdoptionApplicationResponse> apps = adoptionService.getApplicationsByNgo(userId);

        String statusFilter = args != null ? (String) args.get("status") : null;
        if (statusFilter != null && !statusFilter.isBlank()) {
            final String sf = statusFilter.toUpperCase();
            apps = apps.stream().filter(a -> sf.equals(a.getStatus())).toList();
        }

        List<Map<String, Object>> list = apps.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          a.getId());
            m.put("status",      a.getStatus());
            m.put("appliedAt",   a.getAppliedAt());
            if (a.getAnimalName() != null) m.put("animalName", a.getAnimalName());
            if (a.getAdminNotes() != null) m.put("notes",      a.getAdminNotes());
            return m;
        }).toList();
        return mapper.writeValueAsString(Map.of("applications", list, "total", list.size()));
    }

    /** Rescues — reported by user (PET_OWNER) or assigned to NGO */
    private String getMyRescues(Long userId, String role) throws Exception {
        if ("NGO".equalsIgnoreCase(role)) {
            List<RescueReport> rescues = rescueService.getByNgo(userId);
            List<Map<String, Object>> list = rescues.stream().map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          r.getId());
                m.put("animalType",  r.getAnimalType());
                m.put("status",      r.getStatus());
                m.put("address",     r.getAddress());
                m.put("criticality", r.getCriticality());
                m.put("description", r.getDescription());
                return m;
            }).toList();
            return mapper.writeValueAsString(Map.of("rescues", list, "total", list.size()));
        } else {
            List<RescueReportResponse> rescues = rescueService.getByReporter(userId);
            List<Map<String, Object>> list = rescues.stream().map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",          r.getId());
                m.put("animalType",  r.getAnimalType());
                m.put("status",      r.getStatus());
                m.put("address",     r.getAddress());
                m.put("criticality", r.getCriticality());
                if (r.getNgoName() != null) m.put("assignedNgo", r.getNgoName());
                return m;
            }).toList();
            return mapper.writeValueAsString(Map.of("rescues", list, "total", list.size()));
        }
    }

    // ── HOSPITAL ─────────────────────────────────────────────────────────

    /** Hospital's appointments (with optional status / today filter) */
    private String getHospitalAppointments(Map<String, Object> args, Long userId) throws Exception {
        Hospital h = hospitalRepo.findByOwnerUserId(userId).orElse(null);
        if (h == null) return "{\"error\":\"Hospital profile not set up yet.\"}";

        List<AppointmentResponse> appts = appointmentService.getByHospital(h.getId());

        String statusFilter = args != null ? (String) args.get("status") : null;
        boolean todayOnly   = args != null && Boolean.TRUE.equals(args.get("today"));

        if (todayOnly)
            appts = appts.stream().filter(a -> LocalDate.now().equals(a.getApptDate())).toList();
        if (statusFilter != null && !statusFilter.isBlank()) {
            final String sf = statusFilter.toUpperCase();
            appts = appts.stream().filter(a -> sf.equals(a.getStatus())).toList();
        }

        List<Map<String, Object>> list = appts.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",     a.getId());
            m.put("date",   a.getApptDate());
            m.put("time",   a.getApptTime());
            m.put("status", a.getStatus());
            m.put("reason", a.getReason());
            if (a.getDoctorName() != null) m.put("doctor", a.getDoctorName());
            if (a.getPetName() != null)    m.put("pet",    a.getPetName());
            if (a.getUserName() != null)   m.put("owner",  a.getUserName());
            return m;
        }).toList();

        return mapper.writeValueAsString(
                Map.of("hospital", h.getName(), "appointments", list, "total", list.size()));
    }

    /** Hospital profile details */
    private String getHospitalProfile(Long userId) throws Exception {
        Hospital h = hospitalRepo.findByOwnerUserId(userId).orElse(null);
        if (h == null) return "{\"error\":\"Hospital profile not found.\"}";
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name",    h.getName());
        m.put("city",    h.getCity());
        m.put("address", h.getAddress());
        m.put("phone",   h.getPhone());
        m.put("email",   h.getEmail());
        return mapper.writeValueAsString(m);
    }

    /** NGO profile details */
    private String getNgoProfile(Long userId) throws Exception {
        Ngo ngo = ngoRepo.findByOwnerUserId(userId).orElse(null);
        if (ngo == null) return "{\"error\":\"NGO profile not found.\"}";
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name",       ngo.getName());
        m.put("city",       ngo.getCity());
        m.put("address",    ngo.getAddress());
        m.put("phone",      ngo.getPhone());
        m.put("email",      ngo.getEmail());
        m.put("isVerified", ngo.getIsVerified());
        return mapper.writeValueAsString(m);
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────

    /** Overall platform statistics */
    private String getPlatformStats() throws Exception {
        long totalUsers     = userRepo.count();
        long totalAnimals   = animalRepo.count();
        long availAnimals   = animalRepo.findByStatus(AnimalStatus.AVAILABLE).size();
        long totalRescues   = rescueRepo.count();
        long pendingRescues = rescueRepo.findByStatus(RescueStatus.PENDING).size();
        long inProgRescues  = rescueRepo.findByStatus(RescueStatus.IN_PROGRESS).size();
        long pendingApprovals = userService.getPendingApprovals().size();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers",                  totalUsers);
        stats.put("totalAnimalsListed",          totalAnimals);
        stats.put("animalsAvailableForAdoption", availAnimals);
        stats.put("totalRescueReports",          totalRescues);
        stats.put("pendingRescues",              pendingRescues);
        stats.put("inProgressRescues",           inProgRescues);
        stats.put("pendingAccountApprovals",     pendingApprovals);
        return mapper.writeValueAsString(stats);
    }

    /** Accounts waiting for admin approval */
    private String getPendingApprovals() throws Exception {
        List<com.petz.dto.response.UserResponse> pending = userService.getPendingApprovals();
        List<Map<String, Object>> list = pending.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",    u.getId());
            m.put("name",  u.getName());
            m.put("email", u.getEmail());
            m.put("role",  u.getRole());
            return m;
        }).toList();
        return mapper.writeValueAsString(Map.of("pendingApprovals", list, "total", list.size()));
    }

    // ── Proactive greeting (no Gemini call needed) ─────────────────────────

    public String buildProactiveGreeting(Long userId, String role, String userName) {
        String firstName = (userName != null && !userName.isBlank())
                ? userName.split(" ")[0] : "there";
        try {
            if (userId == null) {
                return "Hi! 👋 I'm Healio, your PETZ companion. How can I help you today?";
            }
            return switch (role.toUpperCase()) {
                case "USER"     -> buildUserGreeting(userId, firstName);
                case "HOSPITAL" -> buildHospitalGreeting(userId, firstName);
                case "NGO"      -> buildNgoGreeting(userId, firstName);
                case "ADMIN"    -> buildAdminGreeting(firstName);
                default -> "Hi " + firstName + "! 👋 I'm Healio, your PETZ companion. How can I help you today?";
            };
        } catch (Exception e) {
            log.warn("buildProactiveGreeting failed for userId={}: {}", userId, e.getMessage());
            return "Hi " + firstName + "! 👋 I'm Healio, your PETZ companion. Ask me anything about PETZ or pets!";
        }
    }

    private String buildUserGreeting(Long userId, String firstName) {
        List<AppointmentResponse> appts = appointmentService.getByUser(userId);
        long pending   = appts.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
        long confirmed = appts.stream().filter(a -> "CONFIRMED".equals(a.getStatus())).count();
        List<AdoptionApplicationResponse> apps = adoptionService.getApplicationsByUser(userId);
        long activeApps = apps.stream()
                .filter(a -> !"REJECTED".equals(a.getStatus()) && !"ADOPTED".equals(a.getStatus()))
                .count();
        List<Pet> pets = petService.getByOwner(userId);

        StringBuilder sb = new StringBuilder("Hi ").append(firstName).append("! 👋 I'm Healio, your PETZ companion.\n");

        boolean hasSummary = false;
        if (confirmed > 0 || pending > 0) {
            sb.append("\n📅 You have ");
            if (confirmed > 0) sb.append(confirmed).append(" confirmed");
            if (confirmed > 0 && pending > 0) sb.append(" and ");
            if (pending > 0) sb.append(pending).append(" pending");
            sb.append(" vet appointment").append((confirmed + pending > 1) ? "s" : "").append(".");
            hasSummary = true;
        }
        if (activeApps > 0) {
            sb.append("\n🐾 You have ").append(activeApps)
              .append(" active adoption application").append(activeApps > 1 ? "s" : "").append(".");
            hasSummary = true;
        }
        if (!pets.isEmpty()) {
            String petNames = pets.stream().map(Pet::getName).reduce((a, b) -> a + ", " + b).orElse("");
            sb.append("\n🐶 Your registered pets: ").append(petNames).append(".");
            hasSummary = true;
        }

        if (!hasSummary) {
            sb.append("\nHow can I help you today? Ask me anything about PETZ or pets!");
        } else {
            sb.append("\n\nAsk me about any of the above or anything else about PETZ or pets!");
        }
        return sb.toString();
    }

    private String buildHospitalGreeting(Long userId, String firstName) {
        Hospital h = hospitalRepo.findByOwnerUserId(userId).orElse(null);
        String hospitalName = h != null ? h.getName() : "your hospital";

        StringBuilder sb = new StringBuilder("Hi ").append(firstName)
                .append("! 👋 Welcome to ").append(hospitalName).append("'s assistant.\n");

        if (h != null) {
            List<AppointmentResponse> appts = appointmentService.getByHospital(h.getId());
            long todayCount = appts.stream().filter(a -> LocalDate.now().equals(a.getApptDate())).count();
            long pendingCount = appts.stream().filter(a -> "PENDING".equals(a.getStatus())).count();

            if (todayCount > 0)
                sb.append("\n📅 ").append(todayCount).append(" appointment")
                  .append(todayCount > 1 ? "s" : "").append(" scheduled for today.");
            if (pendingCount > 0)
                sb.append("\n⏳ ").append(pendingCount).append(" appointment")
                  .append(pendingCount > 1 ? "s" : "").append(" awaiting confirmation.");
        }

        sb.append("\n\nAsk me anything about PETZ or pets — today's schedule, appointments, animal care, and more!");
        return sb.toString();
    }

    private String buildNgoGreeting(Long userId, String firstName) {
        Ngo ngo = ngoRepo.findByOwnerUserId(userId).orElse(null);
        String ngoName = ngo != null ? ngo.getName() : "your NGO";

        StringBuilder sb = new StringBuilder("Hi ").append(firstName)
                .append("! 👋 Welcome, ").append(ngoName).append(".\n");

        if (ngo != null) {
            List<AdoptableAnimal> animals = animalRepo.findByNgoId(ngo.getId());
            long available = animals.stream().filter(a -> AnimalStatus.AVAILABLE.equals(a.getStatus())).count();
            List<AdoptionApplicationResponse> apps = adoptionService.getApplicationsByNgo(userId);
            long pendingApps = apps.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
            List<RescueReport> rescues = rescueRepo.findByAssignedNgo(ngo.getId());
            long inProgress = rescues.stream().filter(r -> RescueStatus.IN_PROGRESS.equals(r.getStatus())).count();

            if (available > 0)
                sb.append("\n🐾 ").append(available).append(" animal")
                  .append(available > 1 ? "s" : "").append(" currently available for adoption.");
            if (pendingApps > 0)
                sb.append("\n📋 ").append(pendingApps).append(" new adoption application")
                  .append(pendingApps > 1 ? "s" : "").append(" awaiting review.");
            if (inProgress > 0)
                sb.append("\n🚨 ").append(inProgress).append(" rescue")
                  .append(inProgress > 1 ? "s" : "").append(" currently in progress.");
        }

        sb.append("\n\nAsk me anything about PETZ or pets — animals, adoption applications, rescues, animal care, and more!");
        return sb.toString();
    }

    private String buildAdminGreeting(String firstName) {
        long totalUsers     = userRepo.count();
        long pendingCount   = userService.getPendingApprovals().size();
        long pendingRescues = rescueRepo.findByStatus(RescueStatus.PENDING).size();

        StringBuilder sb = new StringBuilder("Hi ").append(firstName)
                .append("! 👋 PETZ Admin Dashboard.\n");
        sb.append("\n📊 ").append(totalUsers).append(" registered users on the platform.");
        if (pendingCount > 0)
            sb.append("\n⏳ ").append(pendingCount).append(" account")
              .append(pendingCount > 1 ? "s" : "").append(" pending approval.");
        if (pendingRescues > 0)
            sb.append("\n🚨 ").append(pendingRescues).append(" rescue report")
              .append(pendingRescues > 1 ? "s" : "").append(" unassigned.");
        sb.append("\n\nAsk me anything about PETZ or pets — platform stats, approvals, animal care, and more!");
        return sb.toString();
    }

    // ── Navigation route suggestions ───────────────────────────────────────

    public String getSuggestedRoute(String funcName) {
        return switch (funcName) {
            case "get_my_appointments",
                 "get_hospital_appointments"    -> "/appointments";
            case "get_my_adoption_applications" -> "/adoption/my";
            case "get_my_pets"                  -> "/pets";
            case "get_my_animals"               -> "/ngo/animals";
            case "get_ngo_applications"         -> "/ngo/applications";
            case "get_my_rescues"               -> "/rescue";
            case "get_pending_approvals"        -> "/admin/users";
            default                             -> null;
        };
    }

    public String getSuggestedRouteLabel(String funcName) {
        return switch (funcName) {
            case "get_my_appointments"          -> "View My Appointments";
            case "get_hospital_appointments"    -> "Open Appointment Manager";
            case "get_my_adoption_applications" -> "View My Applications";
            case "get_my_pets"                  -> "Manage My Pets";
            case "get_my_animals"               -> "Manage Animals";
            case "get_ngo_applications"         -> "Review Applications";
            case "get_my_rescues"               -> "View Rescue Reports";
            case "get_pending_approvals"        -> "Manage Approvals";
            default                             -> null;
        };
    }
}
