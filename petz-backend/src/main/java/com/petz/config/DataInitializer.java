package com.petz.config;

import com.petz.entity.*;
import com.petz.enums.*;
import com.petz.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Comprehensive demo-data seeder.
 * Runs on every startup — all operations are idempotent (safe to run repeatedly).
 *
 * Seeding order (respects foreign-key dependencies):
 *   1. Users          → 8 accounts (ADMIN / NGO x2 / HOSPITAL x2 / USER x3)
 *   2. NGOs           → 2 verified organisations
 *   3. Hospitals      → 2 active clinics
 *   4. Doctors        → 7 doctors across both hospitals
 *   5. Pets           → 5 pets owned by 3 different users
 *   6. RescueReports  → 6 reports in every status
 *   7. RescueQueue    → 4 queue rows for ASSIGNED / IN_PROGRESS / COMPLETED reports
 *   8. AdoptableAnimals → 8 animals across both NGOs
 *   9. AdoptionApplications → 5 applications in every status
 *  10. Appointments   → 6 appointments across both hospitals
 *  11. Notifications  → 15 realistic notifications for every user type
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    // ── Repositories ─────────────────────────────────────────────
    private final UserRepository               userRepository;
    private final NgoRepository                ngoRepository;
    private final HospitalRepository           hospitalRepository;
    private final DoctorRepository             doctorRepository;
    private final PetRepository                petRepository;
    private final RescueReportRepository       rescueReportRepository;
    private final RescueQueueRepository        rescueQueueRepository;
    private final AdoptableAnimalRepository    adoptableAnimalRepository;
    private final AdoptionApplicationRepository adoptionApplicationRepository;
    private final AppointmentRepository        appointmentRepository;
    private final NotificationRepository       notificationRepository;
    private final PasswordEncoder              passwordEncoder;

    private static final String DEFAULT_PASSWORD = "admin@petz123";

    // ── Entry point ───────────────────────────────────────────────
    @Override
    @Transactional
    public void run(String... args) {
        log.info("╔══════════════════════════════════════╗");
        log.info("║   PETZ  Demo Data Seeder Starting    ║");
        log.info("╚══════════════════════════════════════╝");

        // ── 1. Users ──────────────────────────────────────────────
        User admin    = upsertUser("Admin User",      "admin@petz.com",     Role.ADMIN,    "9999999999");
        User ngoUser  = upsertUser("NGO Owner",       "ngo@petz.com",       Role.NGO,      "9888888888");
        User ngoUser2 = upsertUser("Paws & Claws NGO","ngo2@petz.com",      Role.NGO,      "9877777777");
        User hospUser = upsertUser("Hospital Owner",  "hospital@petz.com",  Role.HOSPITAL, "9777777777");
        User hospUser2= upsertUser("PetHealth Owner", "hospital2@petz.com", Role.HOSPITAL, "9766666666");
        User john     = upsertUser("John Doe",        "user@petz.com",      Role.USER,     "9666666666");
        User priya    = upsertUser("Priya Sharma",    "user2@petz.com",     Role.USER,     "9655555555");
        User rahul    = upsertUser("Rahul Kumar",     "user3@petz.com",     Role.USER,     "9644444444");

        // ── 2. NGOs ───────────────────────────────────────────────
        Ngo ngo1 = seedNgo(ngoUser,
                "Chennai Animal Rescue Network",
                "NGO-CHN-2024-001",
                "Official rescue and adoption NGO for stray and injured animals across Chennai.",
                "Chennai", "Anna Nagar, Chennai - 600040", "9888888888", "ngo@petz.com");

        Ngo ngo2 = seedNgo(ngoUser2,
                "Paws & Claws Foundation",
                "NGO-CHN-2024-002",
                "Dedicated to rehabilitating and rehoming stray animals in the Greater Chennai area.",
                "Chennai", "T. Nagar, Chennai - 600017", "9877777777", "ngo2@petz.com");

        // ── 2b. Backfill Hospital / NGO entities for any user missing one ──
        backfillHospitalEntities();
        backfillNgoEntities();

        // ── 3. Hospitals ──────────────────────────────────────────
        Hospital hosp1 = seedHospital(hospUser,
                "VetCare Animal Hospital",
                "12, Nungambakkam High Road, Chennai - 600034",
                "Chennai", "9777777777", "hospital@petz.com",
                new BigDecimal("13.0604"), new BigDecimal("80.2407"));

        Hospital hosp2 = seedHospital(hospUser2,
                "PetHealth Clinic",
                "45, Anna Salai, Guindy, Chennai - 600032",
                "Chennai", "9766666666", "hospital2@petz.com",
                new BigDecimal("13.0067"), new BigDecimal("80.2206"));

        // ── 4. Doctors ────────────────────────────────────────────
        seedDoctors(hosp1, hosp2);

        // Fetch doctors for later appointment seeding
        List<Doctor> hosp1Docs = doctorRepository.findByHospitalId(hosp1.getId());
        List<Doctor> hosp2Docs = doctorRepository.findByHospitalId(hosp2.getId());

        // ── 5. Pets ───────────────────────────────────────────────
        seedPets(john, priya, rahul);

        List<Pet> johnPets  = petRepository.findByOwnerId(john.getId());
        List<Pet> priyaPets = petRepository.findByOwnerId(priya.getId());
        List<Pet> rahulPets = petRepository.findByOwnerId(rahul.getId());

        // ── 6. Rescue Reports ─────────────────────────────────────
        seedRescueReports(john, priya, rahul, ngo1, ngo2);

        List<RescueReport> allReports = rescueReportRepository.findAll();

        // ── 7. Rescue Queue ───────────────────────────────────────
        seedRescueQueue(allReports, ngo1, ngo2);

        // ── 8. Adoptable Animals ──────────────────────────────────
        seedAdoptableAnimals(ngo1, ngo2);

        List<AdoptableAnimal> ngo1Animals = adoptableAnimalRepository.findByNgoId(ngo1.getId());
        List<AdoptableAnimal> ngo2Animals = adoptableAnimalRepository.findByNgoId(ngo2.getId());

        // ── 9. Adoption Applications ──────────────────────────────
        seedAdoptionApplications(john, priya, rahul, ngo1, ngo2, ngo1Animals, ngo2Animals);

        // ── 10. Appointments ──────────────────────────────────────
        seedAppointments(john, priya, rahul, hosp1, hosp2, hosp1Docs, hosp2Docs, johnPets, priyaPets, rahulPets);

        // ── 11. Notifications ─────────────────────────────────────
        seedNotifications(john, priya, rahul, ngoUser, ngoUser2, hospUser, hospUser2);

        log.info("╔══════════════════════════════════════════════════════╗");
        log.info("║  ✅  All demo data seeded. Login password: {}  ║", DEFAULT_PASSWORD);
        log.info("╚══════════════════════════════════════════════════════╝");
    }

    // ════════════════════════════════════════════════════════════════
    //  1. USERS
    // ════════════════════════════════════════════════════════════════

    private User upsertUser(String name, String email, Role role, String phone) {
        return userRepository.findByEmail(email).map(user -> {
            boolean changed = false;
            if (!passwordEncoder.matches(DEFAULT_PASSWORD, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
                changed = true;
            }
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                user.setIsActive(true);
                changed = true;
            }
            if (!Boolean.TRUE.equals(user.getIsApproved())) {
                user.setIsApproved(true);
                changed = true;
            }
            if (changed) {
                user = userRepository.save(user);
                log.info("🔑 Updated user: {}", email);
            }
            return user;
        }).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
            u.setRole(role);
            u.setPhone(phone);
            u.setIsActive(true);
            u.setIsApproved(true);
            u = userRepository.save(u);
            log.info("👤 Created user: {} ({})", email, role);
            return u;
        });
    }

    // ════════════════════════════════════════════════════════════════
    //  2b. BACKFILL — ensure every HOSPITAL-role user has a Hospital entity
    //      Handles accounts registered before this auto-creation fix was deployed.
    // ════════════════════════════════════════════════════════════════

    private void backfillHospitalEntities() {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.HOSPITAL)
                .forEach(u -> {
                    if (hospitalRepository.findByOwnerUserId(u.getId()).isEmpty()) {
                        Hospital h = new Hospital();
                        h.setOwnerUserId(u.getId());
                        h.setName(u.getName());
                        h.setPhone(u.getPhone());
                        h.setEmail(u.getEmail());
                        h.setCity("Chennai");
                        // Activate if user is already approved; keep inactive if still pending
                        h.setIsActive(Boolean.TRUE.equals(u.getIsApproved()));
                        hospitalRepository.save(h);
                        log.info("🏥 Backfilled Hospital entity for user: {} ({})", u.getEmail(), u.getId());
                    }
                });
    }

    private void backfillNgoEntities() {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO)
                .forEach(u -> {
                    if (ngoRepository.findByOwnerUserId(u.getId()).isEmpty()) {
                        Ngo ngo = new Ngo();
                        ngo.setOwnerUserId(u.getId());
                        ngo.setName(u.getName());
                        ngo.setPhone(u.getPhone());
                        ngo.setEmail(u.getEmail());
                        ngo.setCity("Chennai");
                        // Activate + verify if user is already approved; keep inactive if pending
                        boolean approved = Boolean.TRUE.equals(u.getIsApproved());
                        ngo.setIsActive(approved);
                        ngo.setIsVerified(approved);
                        ngoRepository.save(ngo);
                        log.info("🏢 Backfilled NGO entity for user: {} ({})", u.getEmail(), u.getId());
                    }
                });
    }

    // ════════════════════════════════════════════════════════════════
    //  2. NGOs
    // ════════════════════════════════════════════════════════════════

    private Ngo seedNgo(User owner, String name, String regNo, String description,
                        String city, String address, String phone, String email) {
        return ngoRepository.findByOwnerUserId(owner.getId()).orElseGet(() -> {
            Ngo ngo = new Ngo();
            ngo.setOwnerUserId(owner.getId());
            ngo.setName(name);
            ngo.setRegistrationNo(regNo);
            ngo.setDescription(description);
            ngo.setCity(city);
            ngo.setAddress(address);
            ngo.setPhone(phone);
            ngo.setEmail(email);
            ngo.setIsVerified(true);
            ngo.setIsActive(true);
            ngo = ngoRepository.save(ngo);
            log.info("🏢 Created NGO: {}", name);
            return ngo;
        });
    }

    // ════════════════════════════════════════════════════════════════
    //  3. HOSPITALS
    // ════════════════════════════════════════════════════════════════

    private Hospital seedHospital(User owner, String name, String address, String city,
                                  String phone, String email, BigDecimal lat, BigDecimal lng) {
        return hospitalRepository.findByOwnerUserId(owner.getId()).orElseGet(() -> {
            Hospital h = new Hospital();
            h.setOwnerUserId(owner.getId());
            h.setName(name);
            h.setAddress(address);
            h.setCity(city);
            h.setPhone(phone);
            h.setEmail(email);
            h.setLatitude(lat);
            h.setLongitude(lng);
            h.setIsActive(true);
            h = hospitalRepository.save(h);
            log.info("🏥 Created Hospital: {}", name);
            return h;
        });
    }

    // ════════════════════════════════════════════════════════════════
    //  4. DOCTORS  (idempotent: skip if hospital already has doctors)
    // ════════════════════════════════════════════════════════════════

    private void seedDoctors(Hospital hosp1, Hospital hosp2) {

        if (doctorRepository.findByHospitalId(hosp1.getId()).isEmpty()) {
            createDoctor(hosp1, "Ananya Krishnan", "General Practice",    "9700001001",
                         LocalTime.of(9,0),  LocalTime.of(17,0), 30);
            createDoctor(hosp1, "Suresh Babu",     "Surgery",             "9700001002",
                         LocalTime.of(10,0), LocalTime.of(16,0), 45);
            createDoctor(hosp1, "Meera Pillai",    "Dermatology",         "9700001003",
                         LocalTime.of(9,0),  LocalTime.of(13,0), 30);
            createDoctor(hosp1, "Karthik Rajan",   "Ophthalmology",       "9700001004",
                         LocalTime.of(11,0), LocalTime.of(17,0), 30);
            log.info("🩺 Created 4 doctors for {}", hosp1.getName());
        }

        if (doctorRepository.findByHospitalId(hosp2.getId()).isEmpty()) {
            createDoctor(hosp2, "Sanjay Iyer",    "General Practice",    "9700002001",
                         LocalTime.of(9,0),  LocalTime.of(18,0), 30);
            createDoctor(hosp2, "Lakshmi Devi",   "Dentistry",           "9700002002",
                         LocalTime.of(10,0), LocalTime.of(14,0), 45);
            createDoctor(hosp2, "Vinod Kumar",    "Emergency Care",      "9700002003",
                         LocalTime.of(8,0),  LocalTime.of(20,0), 20);
            log.info("🩺 Created 3 doctors for {}", hosp2.getName());
        }
    }

    private Doctor createDoctor(Hospital hospital, String name, String specialization,
                                String phone, LocalTime start, LocalTime end, int slotMin) {
        Doctor d = new Doctor();
        d.setHospitalId(hospital.getId());
        d.setName(name);
        d.setSpecialization(specialization);
        d.setPhone(phone);
        d.setScheduleStart(start);
        d.setScheduleEnd(end);
        d.setSlotDuration(slotMin);
        d.setIsActive(true);
        return doctorRepository.save(d);
    }

    // ════════════════════════════════════════════════════════════════
    //  5. PETS  (idempotent: skip if user already owns pets)
    // ════════════════════════════════════════════════════════════════

    private void seedPets(User john, User priya, User rahul) {

        if (petRepository.findByOwnerId(john.getId()).isEmpty()) {
            createPet(john,  "Bruno",    "Dog", "Labrador Retriever", 3, "MALE",   new BigDecimal("25.50"),
                      "Friendly and energetic Labrador. Loves swimming and fetch. Up-to-date on all vaccines.");
            createPet(john,  "Whiskers", "Cat", "Persian",            2, "FEMALE", new BigDecimal("4.20"),
                      "Gentle indoor Persian cat. Very affectionate, loves lap time. Indoor only.");
            log.info("🐾 Created 2 pets for John Doe");
        }

        if (petRepository.findByOwnerId(priya.getId()).isEmpty()) {
            createPet(priya, "Rocky",   "Dog", "German Shepherd",    5, "MALE",   new BigDecimal("32.00"),
                      "Well-trained German Shepherd. Excellent guard dog. Regular grooming required.");
            createPet(priya, "Mittens", "Cat", "Indie",              1, "FEMALE", new BigDecimal("3.80"),
                      "Rescued street cat, now fully domesticated. Playful and curious.");
            log.info("🐾 Created 2 pets for Priya Sharma");
        }

        if (petRepository.findByOwnerId(rahul.getId()).isEmpty()) {
            createPet(rahul, "Buddy",   "Dog", "Golden Retriever",   4, "MALE",   new BigDecimal("28.50"),
                      "Lovable Golden Retriever. Great with children. Trained in basic obedience.");
            log.info("🐾 Created 1 pet for Rahul Kumar");
        }
    }

    private Pet createPet(User owner, String name, String species, String breed,
                          int ageYears, String gender, BigDecimal weightKg, String notes) {
        Pet p = new Pet();
        p.setOwnerId(owner.getId());
        p.setName(name);
        p.setSpecies(species);
        p.setBreed(breed);
        p.setAgeYears(ageYears);
        p.setGender(gender);
        p.setWeightKg(weightKg);
        p.setNotes(notes);
        return petRepository.save(p);
    }

    // ════════════════════════════════════════════════════════════════
    //  6. RESCUE REPORTS  (idempotent: skip if reports already exist)
    // ════════════════════════════════════════════════════════════════

    private void seedRescueReports(User john, User priya, User rahul, Ngo ngo1, Ngo ngo2) {
        if (!rescueReportRepository.findAll().isEmpty()) return;

        // Pending — not yet assigned
        createRescue(john, null, "DOG",    Criticality.HIGH,
                RescueStatus.PENDING, null,
                "Injured dog limping near the main road, cannot put weight on left hind leg.",
                "Near Anna Nagar bus terminus, 2nd Avenue, Chennai - 600040",
                new BigDecimal("13.0850"), new BigDecimal("80.2101"));

        // Assigned — NGO1 accepted
        createRescue(priya, ngo1.getId(), "CAT", Criticality.MEDIUM,
                RescueStatus.ASSIGNED, null,
                "Stray cat with eye infection found behind the vegetable market.",
                "T. Nagar market, Usman Road, Chennai - 600017",
                new BigDecimal("13.0418"), new BigDecimal("80.2341"));

        // In Progress — NGO1 on the way
        createRescue(rahul, ngo1.getId(), "COW", Criticality.CRITICAL,
                RescueStatus.IN_PROGRESS, null,
                "Cow hit by vehicle on the main highway. Bleeding from right leg. Urgent help needed.",
                "Adyar Bridge junction, LB Road, Chennai - 600020",
                new BigDecimal("13.0012"), new BigDecimal("80.2565"));

        // Completed — NGO2 resolved
        createRescue(john, ngo2.getId(), "BIRD", Criticality.LOW,
                RescueStatus.COMPLETED,
                "Bird was a parakeet with a minor wing injury. Treated and released after 3 days.",
                "Injured parakeet found with clipped wing unable to fly.",
                "Velachery main road near bus stop, Chennai - 600042",
                new BigDecimal("12.9815"), new BigDecimal("80.2180"));

        // Completed — NGO2 resolved
        createRescue(priya, ngo2.getId(), "DOG", Criticality.HIGH,
                RescueStatus.COMPLETED,
                "Dog rescued and shifted to NGO shelter. Fracture treated. Ready for adoption.",
                "Hit-and-run accident victim — dog with suspected fracture. Cannot walk.",
                "Guindy Industrial Estate gate, Chennai - 600032",
                new BigDecimal("13.0067"), new BigDecimal("80.2206"));

        // Pending — critical, not yet picked up
        createRescue(rahul, null, "MONKEY", Criticality.CRITICAL,
                RescueStatus.PENDING, null,
                "Wild monkey trapped in plastic netting on tree near school. In distress.",
                "Tambaram Sanatorium road near Govt. school, Chennai - 600045",
                new BigDecimal("12.9229"), new BigDecimal("80.1270"));

        log.info("🚨 Created 6 rescue reports");
    }

    private RescueReport createRescue(User reporter, Long ngoId, String animalType,
                                      Criticality crit, RescueStatus status,
                                      String resolutionNotes, String description,
                                      String address, BigDecimal lat, BigDecimal lng) {
        RescueReport r = new RescueReport();
        r.setReporterId(reporter.getId());
        r.setAssignedNgo(ngoId);
        r.setAnimalType(animalType);
        r.setCriticality(crit);
        r.setStatus(status);
        r.setResolutionNotes(resolutionNotes);
        r.setDescription(description);
        r.setAddress(address);
        r.setLatitude(lat);
        r.setLongitude(lng);
        return rescueReportRepository.save(r);
    }

    // ════════════════════════════════════════════════════════════════
    //  7. RESCUE QUEUE  (idempotent: checked per rescueId)
    // ════════════════════════════════════════════════════════════════

    private void seedRescueQueue(List<RescueReport> reports, Ngo ngo1, Ngo ngo2) {
        for (RescueReport r : reports) {
            if (r.getAssignedNgo() == null) continue;       // PENDING — no queue row needed
            if (rescueQueueRepository.findByRescueId(r.getId()).isPresent()) continue;

            RescueQueue q = new RescueQueue();
            q.setRescueId(r.getId());
            q.setNgoId(r.getAssignedNgo());
            q.setExpiresAt(LocalDateTime.now().plusHours(24));
            q.setRespondedAt(LocalDateTime.now().minusMinutes(15));

            boolean isDone = r.getStatus() == RescueStatus.COMPLETED;
            q.setResponse(isDone ? QueueResponse.ACCEPTED : QueueResponse.ACCEPTED);
            rescueQueueRepository.save(q);
        }
        log.info("📋 Rescue queue seeded");
    }

    // ════════════════════════════════════════════════════════════════
    //  8. ADOPTABLE ANIMALS  (idempotent: skip if NGO already has animals)
    // ════════════════════════════════════════════════════════════════

    private void seedAdoptableAnimals(Ngo ngo1, Ngo ngo2) {

        if (adoptableAnimalRepository.findByNgoId(ngo1.getId()).isEmpty()) {
            createAnimal(ngo1, "Max",   "Dog", "Labrador Mix",        8,  "MALE",
                    "Energetic and playful Labrador mix pup. Loves people and other dogs. Fully vaccinated.",
                    true,  false, AnimalStatus.AVAILABLE);
            createAnimal(ngo1, "Luna",  "Cat", "Persian Mix",         6,  "FEMALE",
                    "Sweet Persian mix kitten. Very gentle, great for apartments. Vaccinated and neutered.",
                    true,  true,  AnimalStatus.AVAILABLE);
            createAnimal(ngo1, "Simba", "Dog", "German Shepherd Mix", 24, "MALE",
                    "Calm and protective shepherd mix. Knows basic commands. Good with older children.",
                    false, false, AnimalStatus.AVAILABLE);
            createAnimal(ngo1, "Bella", "Dog", "Indie",               18, "FEMALE",
                    "Friendly street-rescued Indie. Loves cuddles. Vaccinated and dewormed.",
                    true,  false, AnimalStatus.AVAILABLE);
            log.info("🐶 Created 4 adoptable animals for {}", ngo1.getName());
        }

        if (adoptableAnimalRepository.findByNgoId(ngo2.getId()).isEmpty()) {
            createAnimal(ngo2, "Mia",    "Cat", "Siamese Mix",             12, "FEMALE",
                    "Elegant Siamese mix. Very vocal and affectionate. Vaccinated.",
                    true,  false, AnimalStatus.AVAILABLE);
            createAnimal(ngo2, "Tiger",  "Dog", "Indie Mix",               36, "MALE",
                    "Street-smart Indie mix. Healthy adult dog. Gets along with dogs and cats.",
                    false, false, AnimalStatus.AVAILABLE);
            createAnimal(ngo2, "Goldie", "Dog", "Golden Retriever Mix",     14, "FEMALE",
                    "Affectionate Golden mix. Excellent with kids and families. Vaccinated and neutered.",
                    true,  true,  AnimalStatus.AVAILABLE);
            createAnimal(ngo2, "Leo",    "Dog", "Beagle Mix",               10, "MALE",
                    "Curious and friendly Beagle mix pup. Very trainable. Loves outdoor activities.",
                    false, false, AnimalStatus.AVAILABLE);
            log.info("🐱 Created 4 adoptable animals for {}", ngo2.getName());
        }
    }

    private AdoptableAnimal createAnimal(Ngo ngo, String name, String species, String breed,
                                         int ageMonths, String gender, String description,
                                         boolean vaccinated, boolean neutered, AnimalStatus status) {
        AdoptableAnimal a = new AdoptableAnimal();
        a.setNgoId(ngo.getId());
        a.setName(name);
        a.setSpecies(species);
        a.setBreed(breed);
        a.setAgeMonths(ageMonths);
        a.setGender(gender);
        a.setDescription(description);
        a.setCity(ngo.getCity());
        a.setIsVaccinated(vaccinated);
        a.setIsNeutered(neutered);
        a.setStatus(status);
        return adoptableAnimalRepository.save(a);
    }

    // ════════════════════════════════════════════════════════════════
    //  9. ADOPTION APPLICATIONS  (idempotent: existsByApplicantIdAndAnimalId)
    // ════════════════════════════════════════════════════════════════

    private void seedAdoptionApplications(User john, User priya, User rahul,
                                           Ngo ngo1, Ngo ngo2,
                                           List<AdoptableAnimal> ngo1Animals,
                                           List<AdoptableAnimal> ngo2Animals) {
        if (ngo1Animals.isEmpty() || ngo2Animals.isEmpty()) return;

        // Helper: first animal by name
        AdoptableAnimal max    = findByName(ngo1Animals, "Max");
        AdoptableAnimal luna   = findByName(ngo1Animals, "Luna");
        AdoptableAnimal goldie = findByName(ngo2Animals, "Goldie");
        AdoptableAnimal mia    = findByName(ngo2Animals, "Mia");
        AdoptableAnimal tiger  = findByName(ngo2Animals, "Tiger");

        // John → Max (PENDING)
        createApplication(john, max, ngo1, AdoptionStatus.PENDING,
                "I have a large yard and work from home. Can give Max all the time he needs.",
                "I had two dogs growing up. Familiar with Labrador breed.",
                "HOUSE", null);

        // Priya → Luna (APPROVED)
        createApplication(priya, luna, ngo1, AdoptionStatus.APPROVED,
                "I am a cat lover with 10 years of pet ownership. Luna will have the best home.",
                "I currently care for one senior cat. Very experienced.",
                "APARTMENT", "Application reviewed and approved. Home visit scheduled.");

        // Rahul → Goldie (PENDING)
        createApplication(rahul, goldie, ngo2, AdoptionStatus.PENDING,
                "First-time pet owner but very committed. Read extensively about Golden Retrievers.",
                "No prior pets, but I have completed a pet care training program.",
                "HOUSE", null);

        // John → Mia (UNDER_REVIEW)
        createApplication(john, mia, ngo2, AdoptionStatus.UNDER_REVIEW,
                "I currently have one cat (Whiskers) and would love to get her a companion.",
                "Experienced cat owner for 2 years.",
                "APARTMENT", "Application under review. References being checked.");

        // Priya → Tiger (REJECTED)
        createApplication(priya, tiger, ngo2, AdoptionStatus.REJECTED,
                "Looking for an outdoor companion dog for my terrace apartment.",
                "Had one dog previously — a Labrador.",
                "APARTMENT", "Apartment living may not be suitable for Tiger's energy level. Please consider smaller breeds.");

        log.info("📝 Seeded 5 adoption applications");
    }

    private void createApplication(User applicant, AdoptableAnimal animal, Ngo ngo,
                                    AdoptionStatus status, String reason,
                                    String experience, String housingType, String adminNotes) {
        if (animal == null) return;
        boolean exists = adoptionApplicationRepository
                .existsByApplicantIdAndAnimalIdAndStatusNot(
                        applicant.getId(), animal.getId(), AdoptionStatus.WITHDRAWN);
        if (exists) return;

        AdoptionApplication app = new AdoptionApplication();
        app.setApplicantId(applicant.getId());
        app.setAnimalId(animal.getId());
        app.setNgoId(ngo.getId());
        app.setStatus(status);
        app.setReason(reason);
        app.setExperience(experience);
        app.setHousingType(housingType);
        app.setAdminNotes(adminNotes);
        adoptionApplicationRepository.save(app);
    }

    private AdoptableAnimal findByName(List<AdoptableAnimal> animals, String name) {
        return animals.stream()
                .filter(a -> name.equalsIgnoreCase(a.getName()))
                .findFirst().orElse(null);
    }

    // ════════════════════════════════════════════════════════════════
    // 10. APPOINTMENTS  (idempotent: skip if user already has appointments)
    // ════════════════════════════════════════════════════════════════

    private void seedAppointments(User john, User priya, User rahul,
                                   Hospital hosp1, Hospital hosp2,
                                   List<Doctor> hosp1Docs, List<Doctor> hosp2Docs,
                                   List<Pet> johnPets, List<Pet> priyaPets, List<Pet> rahulPets) {

        if (!appointmentRepository.findByUserId(john.getId()).isEmpty()) return;

        if (hosp1Docs.isEmpty() || hosp2Docs.isEmpty()) return;

        Doctor drAnanya  = findDoctorByName(hosp1Docs, "Ananya Krishnan");
        Doctor drMeera   = findDoctorByName(hosp1Docs, "Meera Pillai");
        Doctor drSuresh  = findDoctorByName(hosp1Docs, "Suresh Babu");
        Doctor drKarthik = findDoctorByName(hosp1Docs, "Karthik Rajan");
        Doctor drSanjay  = findDoctorByName(hosp2Docs, "Sanjay Iyer");
        Doctor drVinod   = findDoctorByName(hosp2Docs, "Vinod Kumar");
        Doctor drLakshmi = findDoctorByName(hosp2Docs, "Lakshmi Devi");

        Pet johnDog   = getPetByName(johnPets,  "Bruno");
        Pet johnCat   = getPetByName(johnPets,  "Whiskers");
        Pet priyaDog  = getPetByName(priyaPets, "Rocky");
        Pet priyaCat  = getPetByName(priyaPets, "Mittens");
        Pet rahulDog  = getPetByName(rahulPets, "Buddy");

        LocalDate today = LocalDate.now();

        // 1. John — Bruno — VetCare — Dr. Ananya — tomorrow — CONFIRMED
        createAppointment(john, johnDog, hosp1, drAnanya,
                today.plusDays(1), LocalTime.of(10, 0),
                "Annual wellness check-up and vaccine booster", AppointmentStatus.CONFIRMED);

        // 2. John — Whiskers — VetCare — Dr. Meera — yesterday — COMPLETED
        createAppointment(john, johnCat, hosp1, drMeera,
                today.minusDays(1), LocalTime.of(9, 30),
                "Skin rash on the belly, persistent scratching", AppointmentStatus.COMPLETED);

        // 3. Priya — Rocky — PetHealth — Dr. Sanjay — +2 days — PENDING
        createAppointment(priya, priyaDog, hosp2, drSanjay,
                today.plusDays(2), LocalTime.of(11, 0),
                "Hip dysplasia follow-up and pain management consultation", AppointmentStatus.PENDING);

        // 4. Priya — Mittens — VetCare — Dr. Ananya — +5 days — PENDING
        createAppointment(priya, priyaCat, hosp1, drAnanya,
                today.plusDays(5), LocalTime.of(14, 0),
                "First wellness check since adoption — general health screening", AppointmentStatus.PENDING);

        // 5. Rahul — Buddy — PetHealth — Dr. Vinod — +3 days — CONFIRMED
        createAppointment(rahul, rahulDog, hosp2, drVinod,
                today.plusDays(3), LocalTime.of(9, 0),
                "Ear infection and dental cleaning", AppointmentStatus.CONFIRMED);

        // 6. John — Bruno — VetCare — Dr. Suresh — +7 days — PENDING
        createAppointment(john, johnDog, hosp1, drSuresh,
                today.plusDays(7), LocalTime.of(10, 30),
                "Pre-surgery assessment for minor knee ligament issue", AppointmentStatus.PENDING);

        // 7. Priya — Rocky — PetHealth — Dr. Lakshmi — +10 days — PENDING
        createAppointment(priya, priyaDog, hosp2, drLakshmi,
                today.plusDays(10), LocalTime.of(14, 30),
                "Dental scaling and periodontal check", AppointmentStatus.PENDING);

        // 8. John — Whiskers — VetCare — Dr. Karthik — +4 days — PENDING
        createAppointment(john, johnCat, hosp1, drKarthik,
                today.plusDays(4), LocalTime.of(11, 0),
                "Eye discharge and mild conjunctivitis", AppointmentStatus.PENDING);

        log.info("📅 Created 8 appointments");
    }

    private void createAppointment(User user, Pet pet, Hospital hospital, Doctor doctor,
                                    LocalDate date, LocalTime time, String reason,
                                    AppointmentStatus status) {
        if (doctor == null) return;
        Appointment a = new Appointment();
        a.setUserId(user.getId());
        a.setPetId(pet != null ? pet.getId() : null);
        a.setHospitalId(hospital.getId());
        a.setDoctorId(doctor.getId());
        a.setApptDate(date);
        a.setApptTime(time);
        a.setReason(reason);
        a.setStatus(status);
        appointmentRepository.save(a);
    }

    private Doctor findDoctorByName(List<Doctor> docs, String lastName) {
        return docs.stream()
                .filter(d -> d.getName() != null && d.getName().contains(lastName.split(" ")[0]))
                .findFirst().orElse(docs.isEmpty() ? null : docs.get(0));
    }

    private Pet getPetByName(List<Pet> pets, String name) {
        return pets.stream()
                .filter(p -> name.equalsIgnoreCase(p.getName()))
                .findFirst().orElse(null);
    }

    // ════════════════════════════════════════════════════════════════
    // 11. NOTIFICATIONS  (idempotent: skip if user already has notifications)
    // ════════════════════════════════════════════════════════════════

    private void seedNotifications(User john, User priya, User rahul,
                                    User ngoUser, User ngoUser2,
                                    User hospUser, User hospUser2) {

        notifyUser(john, new Object[][]{
            {"Rescue Report Submitted",
             "Your report about an injured dog in Anna Nagar has been submitted. Our team will assign an NGO shortly.",
             NotificationType.RESCUE_ASSIGNED, false},
            {"Appointment Confirmed ✓",
             "Your appointment for Bruno at VetCare Animal Hospital with Dr. Ananya Krishnan is confirmed for tomorrow at 10:00 AM.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
            {"Adoption Application Received",
             "Your adoption application for Max has been received. The Chennai Animal Rescue Network will review it soon.",
             NotificationType.ADOPTION_UPDATE, false},
            {"Past Visit Completed",
             "Your appointment for Whiskers with Dr. Meera Pillai has been marked complete. Hope the visit went well!",
             NotificationType.APPOINTMENT_CONFIRMED, true},
        });

        notifyUser(priya, new Object[][]{
            {"Rescue Assigned to NGO",
             "Your rescue report for a cat in T. Nagar has been assigned to Chennai Animal Rescue Network. Help is on the way!",
             NotificationType.RESCUE_ASSIGNED, false},
            {"Adoption Approved!",
             "Congratulations! Your application to adopt Luna has been approved by Chennai Animal Rescue Network. Please contact them to arrange handover.",
             NotificationType.ADOPTION_UPDATE, false},
            {"Appointment Booked",
             "Your appointment for Rocky at PetHealth Clinic with Dr. Sanjay Iyer is confirmed for the day after tomorrow at 11:00 AM.",
             NotificationType.APPOINTMENT_CONFIRMED, true},
        });

        notifyUser(rahul, new Object[][]{
            {"Rescue In Progress",
             "Great news! Chennai Animal Rescue Network has accepted your rescue report and is en route to Adyar.",
             NotificationType.RESCUE_ASSIGNED, false},
            {"Appointment Confirmed ✓",
             "Your appointment for Buddy at PetHealth Clinic with Dr. Vinod Kumar is confirmed for 3 days from now at 9:00 AM.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
            {"Adoption Application Under Review",
             "Your application for Goldie (Paws & Claws Foundation) is under review. You will be notified of the decision soon.",
             NotificationType.ADOPTION_UPDATE, false},
        });

        notifyUser(ngoUser, new Object[][]{
            {"New Rescue Assignment",
             "A HIGH priority rescue report (injured dog) in Anna Nagar has been assigned to your organisation. Please respond within 24 hours.",
             NotificationType.RESCUE_ASSIGNED, false},
            {"Rescue Mission Completed",
             "The rescue report (cow at Adyar) has been successfully completed. Thank you for your prompt response!",
             NotificationType.RESCUE_COMPLETED, true},
            {"New Adoption Application",
             "John Doe has submitted an adoption application for Max. Review it in your adoption applications queue.",
             NotificationType.ADOPTION_UPDATE, false},
        });

        notifyUser(ngoUser2, new Object[][]{
            {"Rescue Completed by Your Team",
             "The bird rescue report from Velachery has been resolved. Great work by your team!",
             NotificationType.RESCUE_COMPLETED, true},
            {"New Adoption Application",
             "Rahul Kumar has submitted an adoption application for Goldie. Review in your applications queue.",
             NotificationType.ADOPTION_UPDATE, false},
            {"Application Decision Needed",
             "Priya Sharma's application for Tiger has been reviewed. Update the status to inform the applicant.",
             NotificationType.ADOPTION_UPDATE, false},
        });

        notifyUser(hospUser, new Object[][]{
            {"New Appointment Request",
             "Bruno (Labrador Retriever) booked with Dr. Ananya Krishnan for tomorrow at 10:00 AM.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
            {"Appointment Completed",
             "The appointment for Whiskers (Persian Cat) with Dr. Meera Pillai has been marked as completed.",
             NotificationType.APPOINTMENT_CONFIRMED, true},
            {"Upcoming Surgery Consult",
             "Pre-surgery assessment for Bruno with Dr. Suresh Babu scheduled for 7 days from now.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
        });

        notifyUser(hospUser2, new Object[][]{
            {"New Appointment Booked",
             "Rocky (German Shepherd) booked with Dr. Sanjay Iyer for a hip dysplasia consultation.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
            {"Appointment Confirmed",
             "Buddy (Golden Retriever) confirmed with Dr. Vinod Kumar for ear infection and dental cleaning.",
             NotificationType.APPOINTMENT_CONFIRMED, false},
        });

        log.info("🔔 Created notifications for all users");
    }

    /**
     * Creates all notifications for a user IF they currently have none.
     * Entirely idempotent — a second run sees existing rows and skips.
     */
    private void notifyUser(User user, Object[][] entries) {
        if (!notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).isEmpty()) {
            return; // already has notifications — skip
        }
        for (Object[] e : entries) {
            Notification n = new Notification();
            n.setUserId(user.getId());
            n.setTitle((String) e[0]);
            n.setMessage((String) e[1]);
            n.setType((NotificationType) e[2]);
            n.setIsRead((Boolean) e[3]);
            notificationRepository.save(n);
        }
    }
}
