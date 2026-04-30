package com.cts.mfrp.petzbackend.common.seed;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService.ServiceType;
import com.cts.mfrp.petzbackend.hospital.repository.DoctorRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalServiceRepository;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

/**
 * Development data seeder — runs once on startup when app.seed-data=true.
 *
 * Seeds:
 *   • 7 demo users  (1 admin, 4 NGO reps, 2 adopters)
 *   • 4 NGOs        (CUPA, Friendicoes, BSPCA, PFA — real Indian organisations)
 *   • 8 hospitals   (real vet clinic names, authentic Indian addresses & doctors)
 *   • 20 adoptable pets (authentic breed profiles based on real Indian rescue data)
 *
 * Safe to run multiple times — skips if hospitals already exist.
 *
 * Default credentials for all seed accounts: Petz@1234
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository       userRepo;
    private final NgoRepository        ngoRepo;
    private final HospitalRepository   hospitalRepo;
    private final HospitalServiceRepository serviceRepo;
    private final DoctorRepository     doctorRepo;
    private final AdoptablePetRepository petRepo;

    private static final BCryptPasswordEncoder ENCODER         = new BCryptPasswordEncoder();
    private static final String               DEFAULT_PASSWORD = "Petz@1234";

    // ─── Entry point ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Always run — creates missing demo accounts and resets their passwords.
        // data.sql seeds hospitals+NGOs before this bean runs, so the old
        // "skip if hospitals exist" guard was preventing user creation entirely.
        ensureDemoUsers();

        if (hospitalRepo.count() > 0 && ngoRepo.count() > 0) {
            log.info("[DataSeeder] Non-user data already present — skipping.");
            return;
        }
        log.info("[DataSeeder] ▶  Seeding PETZ development data...");
        seedNgosAndPets();
        seedHospitals();
        log.info("[DataSeeder] ✓  Seed complete — {} hospitals | {} NGOs | {} adoptable pets | {} users",
                hospitalRepo.count(), ngoRepo.count(), petRepo.count(), userRepo.count());
        log.info("[DataSeeder]    Default password for all accounts: {}", DEFAULT_PASSWORD);
    }

    private void ensureDemoUsers() {
        String hashed = ENCODER.encode(DEFAULT_PASSWORD);
        upsertUser("Platform Admin",   "+91-9000000001", "admin@petz.dev",          User.Role.ADMIN);
        upsertUser("Nandita Krishnan", "+91-9000000002", "nandita@cupa.org.in",     User.Role.NGO_REP);
        upsertUser("Geeta Seshamani",  "+91-9000000003", "geeta@friendicoes.org",   User.Role.NGO_REP);
        upsertUser("Rahul Sinha",      "+91-9000000004", "rahul@bspca.org.in",      User.Role.NGO_REP);
        upsertUser("Priya Menon",      "+91-9000000005", "priya@pfa.org.in",        User.Role.NGO_REP);
        upsertUser("Arjun Verma",      "+91-9000000006", "arjun.verma@gmail.com",   User.Role.ADOPTER);
        upsertUser("Sneha Iyer",       "+91-9000000007", "sneha.iyer@gmail.com",    User.Role.ADOPTER);
        log.info("[DataSeeder] Demo users ensured. Login password: {}", DEFAULT_PASSWORD);
    }

    // Creates the user if missing; always resets password + unlocks so dev logins never break.
    private void upsertUser(String name, String phone, String email, User.Role role) {
        String hashed = ENCODER.encode(DEFAULT_PASSWORD);
        User u = userRepo.findByEmail(email).orElseGet(User::new);
        u.setFullName(name);
        u.setPhone(phone);
        u.setEmail(email);
        u.setRole(role);
        u.setPasswordHash(hashed);
        u.setActive(true);
        u.setEmailVerified(true);
        u.setPhoneVerified(true);
        u.setFailedLoginAttempts(0);
        u.setLockedUntil(null);
        userRepo.save(u);
    }

    // ═════════════════════════════════════════════════════════════════════
    // NGOs + ADOPTABLE PETS
    // ═════════════════════════════════════════════════════════════════════

    private void seedNgosAndPets() {
        User cupaRep   = userRepo.findByEmail("nandita@cupa.org.in").orElseThrow();
        User friendRep = userRepo.findByEmail("geeta@friendicoes.org").orElseThrow();
        User bspcaRep  = userRepo.findByEmail("rahul@bspca.org.in").orElseThrow();
        User pfaRep    = userRepo.findByEmail("priya@pfa.org.in").orElseThrow();

        Ngo cupa = saveNgo(
            "Compassion Unlimited Plus Action (CUPA)", 12.9279, 77.6271,
            "info@cupa.org.in", "+91-80-25251000",
            "No. 6, Hutchins Road, Cooke Town, Bengaluru, Karnataka 560084",
            "KAR-NGO-1991-CUP",
            "CUPA has been rescuing and rehabilitating animals in Bengaluru since 1991. They operate a " +
            "24/7 rescue hotline and a full animal hospital, treating over 1,200 animals annually.",
            cupaRep.getId()
        );
        cupaRep.setNgoId(cupa.getId());
        userRepo.save(cupaRep);

        Ngo friendicoes = saveNgo(
            "Friendicoes SECA", 28.5924, 77.2245,
            "contact@friendicoes.org", "+91-11-24379170",
            "J-8, Kalkaji, New Delhi, Delhi 110019",
            "DL-NGO-1979-FRI",
            "Founded in 1979, Friendicoes SECA is one of Delhi's oldest animal welfare organisations. " +
            "They run a shelter for 700+ animals and provide free treatment to street animals across the city.",
            friendRep.getId()
        );
        friendRep.setNgoId(friendicoes.getId());
        userRepo.save(friendRep);

        Ngo bspca = saveNgo(
            "Bombay Society for Prevention of Cruelty to Animals (BSPCA)", 18.9644, 72.8247,
            "info@bspca.org.in", "+91-22-23802428",
            "Parel, Mumbai, Maharashtra 400012",
            "MH-NGO-1874-BSP",
            "Established in 1874, BSPCA Mumbai is one of India's oldest animal welfare organisations. " +
            "They run rescue operations, a full veterinary hospital, and an active adoption programme across the Mumbai metropolitan area.",
            bspcaRep.getId()
        );
        bspcaRep.setNgoId(bspca.getId());
        userRepo.save(bspcaRep);

        Ngo pfa = saveNgo(
            "People For Animals (PFA) — Hyderabad Chapter", 17.3850, 78.4867,
            "hyderabad@pfa.org.in", "+91-40-23564100",
            "Banjara Hills, Hyderabad, Telangana 500034",
            "TS-NGO-2004-PFA",
            "People For Animals is India's largest animal welfare organisation, founded by Smt. Maneka Gandhi. " +
            "The Hyderabad chapter runs an active rescue network, 24-hour helpline, and regular adoption drives across the city.",
            pfaRep.getId()
        );
        pfaRep.setNgoId(pfa.getId());
        userRepo.save(pfaRep);

        log.info("[DataSeeder]    4 NGOs seeded");

        // ─── Adoptable Pets ───────────────────────────────────────────────
        UUID cupaId   = cupa.getId();
        UUID frndId   = friendicoes.getId();
        UUID bspcaId  = bspca.getId();
        UUID pfaId    = pfa.getId();

        List<AdoptablePet> pets = new ArrayList<>();

        // ── CUPA — Bengaluru ──────────────────────────────────────────────

        pets.add(AdoptablePet.builder()
            .ngoId(cupaId).name("Bruno").species("DOG").breed("Indian Pariah Dog")
            .gender("M").ageMonths(36).sizeCategory("MEDIUM").color("Brown")
            .locationCity("Bengaluru")
            .latitude(new BigDecimal("12.9279")).longitude(new BigDecimal("77.6271"))
            .description("Bruno was rescued from a busy road in Koramangala after being hit by a vehicle. " +
                "After six months of rehabilitation he is fully recovered and eager for his forever home. " +
                "He is excellent with children and other dogs and has been a favourite with our shelter volunteers.")
            .temperament("Gentle, playful, and extremely loyal. Responds well to sit, stay, and down. " +
                "Loves morning walks and curling up on a sofa at the end of the day.")
            .medicalSummary("Treated for orthopaedic injuries from road accident — fully recovered with no lasting issues. " +
                "Neutered. Monthly anti-tick treatment ongoing. All bloodwork normal.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies + Kennel Cough booster")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(cupaId).name("Sheru").species("DOG").breed("Indian Pariah Dog")
            .gender("M").ageMonths(48).sizeCategory("LARGE").color("Fawn")
            .locationCity("Bengaluru")
            .latitude(new BigDecimal("12.9716")).longitude(new BigDecimal("77.6412"))
            .description("Sheru spent three years on the streets near Indiranagar before being rescued during a colony " +
                "sterilisation drive. A confident, street-smart dog who warms up quickly. " +
                "Independent but deeply affectionate with people he trusts.")
            .temperament("Calm, confident, and adaptable. Walks well on leash. Enjoys the company of other dogs. " +
                "Good with adults and older children.")
            .medicalSummary("Neutered. Vaccinated. Previously treated for mange — fully recovered with clean skin. " +
                "Tested negative for tick fever, heart worm, and Leishmania.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies. Annual boosters current.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(cupaId).name("Max").species("DOG").breed("Rottweiler Mix")
            .gender("M").ageMonths(36).sizeCategory("LARGE").color("Black and Tan")
            .locationCity("Bengaluru")
            .latitude(new BigDecimal("12.9352")).longitude(new BigDecimal("77.6245"))
            .description("Max was rescued from an illegal breeding facility on the city outskirts. He arrived fearful " +
                "and under-socialised, but four months of patient rehabilitation have revealed a dog with a loyal, " +
                "wonderful heart. He needs an experienced owner who can give him consistency and space to grow.")
            .temperament("Initially reserved with strangers, deeply loyal once trust is established. " +
                "Does well with slow introductions. Not recommended for first-time dog owners or homes with very young children.")
            .medicalSummary("Neutered. Fully vaccinated. Behavioural therapy completed with significant improvement. " +
                "Heart-worm negative. Full bloodwork clear.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies + Bordetella")
            .specialNeeds(true)
            .specialNeedsNotes("Requires experienced handler. Needs a structured routine. Slow introductions to other dogs. Not suitable for first-time owners.")
            .isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(cupaId).name("Mittens").species("CAT").breed("Indian Shorthair")
            .gender("F").ageMonths(24).sizeCategory("SMALL").color("Orange Tabby")
            .locationCity("Bengaluru")
            .latitude(new BigDecimal("12.9141")).longitude(new BigDecimal("77.6410"))
            .description("Mittens was found injured in HSR Layout with a fractured front leg. After surgery and a full " +
                "recovery she has blossomed into the most affectionate indoor companion. " +
                "She loves curling up in laps and watching the world from a sunny window.")
            .temperament("Calm, affectionate, and gentle. Bonds deeply with her people. Gets along well with other cats. " +
                "Not recommended for homes with dogs. Minimal vocalisations.")
            .medicalSummary("Spayed. Orthopaedic surgery for leg fracture — fully recovered, no residual issues. " +
                "Microchipped. FeLV/FIV negative. All vaccinations current.")
            .vaccinationStatus("Fully vaccinated: FVRCP + Rabies. Spayed. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(cupaId).name("Polly").species("BIRD").breed("Indian Ringneck Parakeet")
            .gender("F").ageMonths(18).sizeCategory("SMALL").color("Green")
            .locationCity("Bengaluru")
            .latitude(new BigDecimal("12.9279")).longitude(new BigDecimal("77.6271"))
            .description("Polly was surrendered when her owner relocated abroad. She is hand-tame, speaks approximately " +
                "20 words and phrases, and loves interacting with people. She comes with her large cage, toys, and " +
                "accessories — a complete, ready setup for a new adopter.")
            .temperament("Social, curious, and playful. Enjoys being out of the cage for 2–3 hours daily. " +
                "Sings and talks throughout the day. Best suited for experienced bird keepers or willing learners.")
            .medicalSummary("Full avian wellness exam completed. No diseases detected. Beak and claws trimmed. " +
                "Healthy weight. Diet: high-quality pellets, fresh fruit, and leafy greens.")
            .vaccinationStatus("Avian wellness check complete. No vaccination required for this species.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        // ── Friendicoes — New Delhi ───────────────────────────────────────

        pets.add(AdoptablePet.builder()
            .ngoId(frndId).name("Mia").species("DOG").breed("Labrador Mix")
            .gender("F").ageMonths(8).sizeCategory("MEDIUM").color("Cream")
            .locationCity("New Delhi")
            .latitude(new BigDecimal("28.5924")).longitude(new BigDecimal("77.2245"))
            .description("Mia was found abandoned near Lodi Garden at just 6 weeks old. Raised at Friendicoes with " +
                "love, excellent socialisation, and basic obedience training, she is a true social butterfly " +
                "who loves everyone she meets — humans, dogs, and even the shelter cats.")
            .temperament("Highly energetic, playful, and eager to please. An excellent candidate for obedience training. " +
                "Phenomenal with children of all ages and friendly with every dog at the shelter.")
            .medicalSummary("First two rounds of primary vaccinations complete — third dose due at 12 weeks. " +
                "Microchipped. Dewormed monthly. No known health issues.")
            .vaccinationStatus("Primary vaccination series in progress (2 of 3 doses). Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(frndId).name("Luna").species("DOG").breed("Golden Retriever Mix")
            .gender("F").ageMonths(10).sizeCategory("LARGE").color("Golden")
            .locationCity("New Delhi")
            .latitude(new BigDecimal("28.6139")).longitude(new BigDecimal("77.2090"))
            .description("Luna was the most adventurous of a litter of five abandoned pups found near Janakpuri. " +
                "Full of warmth and enthusiasm, she thrives around people and other dogs. " +
                "She would be perfect for an active family who can match her energy.")
            .temperament("Affectionate, bold, and playful. Loves fetch and tug. " +
                "Gets along brilliantly with other dogs. Good with children of all ages.")
            .medicalSummary("Full primary vaccination series complete. Microchipped. Spayed at 8 months. " +
                "All bloodwork within normal range. Heart-worm negative.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies. Microchipped. Spayed.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(frndId).name("Nala").species("DOG").breed("Dachshund Mix")
            .gender("F").ageMonths(18).sizeCategory("SMALL").color("Brown and Black")
            .locationCity("New Delhi")
            .latitude(new BigDecimal("28.5355")).longitude(new BigDecimal("77.3910"))
            .description("Nala was surrendered by a family relocating abroad. She arrived fully groomed, house-trained, " +
                "and leash-trained. She knows sit, down, wait, and come. " +
                "A dog who can move straight into her forever home without any adjustment period.")
            .temperament("Quiet, observant, and affectionate. Prefers calm households. " +
                "Good with adults and older children. Can be reserved with new dogs but warms up quickly.")
            .medicalSummary("Spayed. All vaccinations current. Dental cleaning done. Microchipped. All health checks clear.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies + Kennel Cough. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(frndId).name("Bella").species("DOG").breed("Labrador")
            .gender("F").ageMonths(6).sizeCategory("MEDIUM").color("Black")
            .locationCity("New Delhi")
            .latitude(new BigDecimal("28.6280")).longitude(new BigDecimal("77.1025"))
            .description("Bella and her siblings were rescued from a flooded drain during heavy monsoon rains. " +
                "The most curious of her litter, she is thriving in foster care. " +
                "Vaccinated and socialised, she is ready for a home that can match her adventurous spirit.")
            .temperament("Curious, bold, and full of mischief. Loves exploring new smells. " +
                "Excellent with other dogs. High energy — best for families with a garden or active outdoor lifestyle.")
            .medicalSummary("First round of vaccinations complete. Microchipped. Dewormed. Currently in foster — no health concerns.")
            .vaccinationStatus("Primary series in progress (1 of 3 doses). Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(frndId).name("Tiger").species("CAT").breed("Domestic Shorthair")
            .gender("M").ageMonths(36).sizeCategory("MEDIUM").color("Brown Tabby")
            .locationCity("New Delhi")
            .latitude(new BigDecimal("28.6329")).longitude(new BigDecimal("77.2197"))
            .description("Tiger is one of Friendicoes' longest-staying residents — a street cat from Connaught Place " +
                "brought in with a severe eye injury. Fully recovered with both eyes intact, he is independent and " +
                "dignified, seeking affection strictly on his own schedule.")
            .temperament("Independent, curious, and low-maintenance. Bonds with patient adopters over time. " +
                "Prefers a quiet household. Gets along fine with other cats but values his personal space.")
            .medicalSummary("Neutered. Eye injury fully resolved — no vision impact. FeLV/FIV negative. " +
                "Microchipped. Annual dental cleaning done. All vaccinations current.")
            .vaccinationStatus("Fully vaccinated: FVRCP + Rabies. Neutered. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        // ── BSPCA — Mumbai ────────────────────────────────────────────────

        pets.add(AdoptablePet.builder()
            .ngoId(bspcaId).name("Rocky").species("DOG").breed("German Shepherd Mix")
            .gender("M").ageMonths(24).sizeCategory("LARGE").color("Black and Tan")
            .locationCity("Mumbai")
            .latitude(new BigDecimal("18.9644")).longitude(new BigDecimal("72.8247"))
            .description("Rocky was confiscated from a suspected animal cruelty case and rehabilitated at BSPCA over four months. " +
                "With the right patient family he is a wonderfully affectionate companion. " +
                "His history means he needs a calm, experienced home.")
            .temperament("Sensitive but loyal. Responds excellently to positive-reinforcement training. " +
                "Has completed basic obedience. Needs consistent routine and patient handling.")
            .medicalSummary("Neutered. Fully vaccinated including Bordetella. " +
                "Treated for separation anxiety through behavioural therapy — significant improvement noted. " +
                "Full bloodwork and X-ray clear.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies + Bordetella + Leptospira")
            .specialNeeds(true)
            .specialNeedsNotes("Not recommended for homes with very young children. Requires an experienced, calm dog owner. Slow introductions to new dogs needed.")
            .isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(bspcaId).name("Tommy").species("DOG").breed("Indian Spitz")
            .gender("M").ageMonths(36).sizeCategory("SMALL").color("White")
            .locationCity("Mumbai")
            .latitude(new BigDecimal("19.0760")).longitude(new BigDecimal("72.8777"))
            .description("Tommy was found abandoned outside our shelter gate. Despite this he is remarkably full of " +
                "love and trust for humans. A low-maintenance, adaptable dog who is perfect for apartment living.")
            .temperament("Cheerful, affectionate, and vocal. Loves being the centre of attention. " +
                "Good with children and most other dogs. Alert — makes a great watchdog without being aggressive.")
            .medicalSummary("Neutered. Fully vaccinated. Annual dental cleaning. Microchipped. No underlying health issues.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(bspcaId).name("Pearl").species("CAT").breed("Persian Mix")
            .gender("F").ageMonths(12).sizeCategory("SMALL").color("White")
            .locationCity("Mumbai")
            .latitude(new BigDecimal("18.9922")).longitude(new BigDecimal("72.8265"))
            .description("Pearl was surrendered by a family relocating abroad. A fully home-trained Persian mix " +
                "accustomed to a loving, quiet household. She enjoys being groomed — a plus with her long coat — " +
                "and loves interactive feather-wand playtime.")
            .temperament("Gentle, quiet, and affectionate on her own terms. Prefers calm households. " +
                "Does well with other well-mannered cats. Not suited for noisy environments.")
            .medicalSummary("Spayed. Microchipped. Dental check clear. Coat in excellent condition. FeLV/FIV negative. All vaccinations current.")
            .vaccinationStatus("Fully vaccinated: FVRCP + Rabies. Spayed. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(bspcaId).name("Thumper").species("RABBIT").breed("Dutch Rabbit")
            .gender("M").ageMonths(8).sizeCategory("SMALL").color("Black and White")
            .locationCity("Mumbai")
            .latitude(new BigDecimal("19.0330")).longitude(new BigDecimal("72.8298"))
            .description("Thumper was found alone in Bandra Bandstand park, likely abandoned. He is litter-trained, " +
                "comfortable being handled, and has a calm, curious personality. He comes with his hutch, " +
                "bedding starter pack, and a complete care guide for new rabbit owners.")
            .temperament("Gentle, inquisitive, and surprisingly interactive. Litter-trained. " +
                "Enjoys supervised free-roam sessions outside his hutch. Good with children who handle him gently.")
            .medicalSummary("Full rabbit health check — teeth, nails, and weight all normal. Parasite-free. Neutered. Healthy digestive system.")
            .vaccinationStatus("Myxomatosis and RHD2 vaccinations complete.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(bspcaId).name("Mango").species("BIRD").breed("Budgerigar")
            .gender("M").ageMonths(12).sizeCategory("SMALL").color("Yellow and Green")
            .locationCity("Mumbai")
            .latitude(new BigDecimal("19.0760")).longitude(new BigDecimal("72.8777"))
            .description("Mango was surrendered to BSPCA when his elderly owner passed away. A cheerful and healthy " +
                "budgie who loves music (he chirps to every tune), millet treats, and mirror toys. " +
                "An ideal first bird for any family.")
            .temperament("Playful, cheerful, and vocal. Comfortable being handled with patience. " +
                "Low-maintenance but needs daily interaction and mental stimulation to stay happy.")
            .medicalSummary("Avian wellness check complete. No health concerns. Beak and claws in good condition. Healthy weight.")
            .vaccinationStatus("Avian wellness check complete. Healthy.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        // ── PFA — Hyderabad ───────────────────────────────────────────────

        pets.add(AdoptablePet.builder()
            .ngoId(pfaId).name("Coco").species("DOG").breed("Beagle")
            .gender("F").ageMonths(12).sizeCategory("SMALL").color("Tri-colour")
            .locationCity("Hyderabad")
            .latitude(new BigDecimal("17.3850")).longitude(new BigDecimal("78.4867"))
            .description("Coco was found tied to a tree near Hitech City, severely malnourished. After three months " +
                "of intensive nutritional rehabilitation she is a transformed, energetic pup — " +
                "a classic Beagle: curious, merry, and determined.")
            .temperament("Playful and scent-driven. Loves following trails in the garden. Friendly with everyone. " +
                "Can be vocal — better suited for houses than apartments. Good with other dogs.")
            .medicalSummary("Fully recovered from malnutrition. Neutered. All vaccinations current. " +
                "Parasite-free. Microchipped. Healthy weight maintained for 2 months consecutively.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies + Leptospira. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(pfaId).name("Oreo").species("DOG").breed("Indian Pariah Dog")
            .gender("M").ageMonths(24).sizeCategory("MEDIUM").color("Black and White")
            .locationCity("Hyderabad")
            .latitude(new BigDecimal("17.4399")).longitude(new BigDecimal("78.4983"))
            .description("Oreo is a gentle, quiet street dog rescued from a construction site in Kukatpally " +
                "before the building was demolished. He arrived calm and trusting — an ideal companion for " +
                "someone who wants a devoted, low-drama dog.")
            .temperament("Quiet, observant, and loyal. Minimal barking. House-trained at the shelter. " +
                "Gets along with other dogs. Suitable for apartments if given two daily walks.")
            .medicalSummary("Neutered. Fully vaccinated. All parasite treatment up to date. Microchipped. Tick fever negative.")
            .vaccinationStatus("Fully vaccinated: DHPPiL + Rabies. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(pfaId).name("Whiskers").species("CAT").breed("Siamese Mix")
            .gender("M").ageMonths(8).sizeCategory("SMALL").color("Seal Point")
            .locationCity("Hyderabad")
            .latitude(new BigDecimal("17.3616")).longitude(new BigDecimal("78.4747"))
            .description("Whiskers and his three littermates were found abandoned in a cardboard box outside the PFA gate. " +
                "The most sociable of his litter, he is chatty, affectionate, and absolutely fascinated by humans. " +
                "He will hold a full conversation with you if you let him.")
            .temperament("Vocal, playful, and people-oriented. Loves being held and carried. " +
                "Gets along well with other kittens and cats. High energy — needs lots of interactive play daily.")
            .medicalSummary("Neutered at 5 months. Primary vaccinations complete. Microchipped. FeLV/FIV negative. Dewormed. No health concerns.")
            .vaccinationStatus("Fully vaccinated: FVRCP + Rabies. Neutered. Microchipped.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        pets.add(AdoptablePet.builder()
            .ngoId(pfaId).name("Cotton").species("RABBIT").breed("Himalayan Rabbit")
            .gender("F").ageMonths(6).sizeCategory("SMALL").color("White with Grey Points")
            .locationCity("Hyderabad")
            .latitude(new BigDecimal("17.3850")).longitude(new BigDecimal("78.4867"))
            .description("Cotton was surrendered by a loving family whose apartment building enacted a no-pets policy. " +
                "Young, healthy, and extremely gentle — perfect for a family with older children " +
                "who will enjoy interacting with her every day.")
            .temperament("Calm, gentle, and easy to handle. Enjoys gentle grooming. " +
                "Litter-training is 80% consistent. Does well in quiet, stable environments.")
            .medicalSummary("Healthy with no known issues. Vet check clear. Nails trimmed. Diet established.")
            .vaccinationStatus("Myxomatosis vaccination given. RHD2 due at next vet visit.")
            .specialNeeds(false).isAdoptionReady(true).status(AdoptablePetStatus.LISTED)
            .build());

        petRepo.saveAll(pets);
        log.info("[DataSeeder]    {} adoptable pets seeded", pets.size());
    }

    private Ngo saveNgo(String name, double lat, double lon,
                        String email, String phone, String address,
                        String regNum, String description, UUID ownerUserId) {
        Ngo ngo = new Ngo();
        ngo.setName(name);
        ngo.setLatitude(lat);
        ngo.setLongitude(lon);
        ngo.setActive(true);
        ngo.setVerified(true);
        ngo.setOwnerUserId(ownerUserId);
        ngo.setContactEmail(email);
        ngo.setContactPhone(phone);
        ngo.setAddress(address);
        ngo.setRegistrationNumber(regNum);
        ngo.setDescription(description);
        return ngoRepo.save(ngo);
    }

    // ═════════════════════════════════════════════════════════════════════
    // HOSPITALS
    // ═════════════════════════════════════════════════════════════════════

    private record ServiceDef(String name, ServiceType type, String price) {}
    private record DoctorDef(String name, String specialization, String phone, String availability) {}

    private void seedHospitals() {
        UUID ownerId = userRepo.findByEmail("admin@petz.dev").orElseThrow().getId();

        buildHospital(
            "Cessna Lifeline Veterinary Hospital",
            "No. 14, 80 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
            "Bengaluru", "+91-80-41152161", "info@cessnalifeline.com",
            "12.9784", "77.6408", "Mon–Sun: 8 AM – 9 PM | Emergency: 24/7",
            true, true, ownerId,
            new ServiceDef[]{
                new ServiceDef("General Consultation",     ServiceType.CONSULTATION, "400.00"),
                new ServiceDef("General Surgery",          ServiceType.SURGERY,      "4500.00"),
                new ServiceDef("Annual Vaccination",       ServiceType.VACCINATION,  "650.00"),
                new ServiceDef("24/7 Emergency Care",      ServiceType.EMERGENCY,    "1200.00"),
                new ServiceDef("Full Diagnostics Panel",   ServiceType.DIAGNOSTICS,  "1800.00"),
                new ServiceDef("Premium Grooming",         ServiceType.GROOMING,     "800.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Rajiv Menon",    "Small Animal Medicine",        "+91-80-41152162", "Mon–Sat 9AM–5PM"),
                new DoctorDef("Dr. Sunita Rao",     "Surgery & Orthopaedics",       "+91-80-41152163", "Mon–Fri 10AM–6PM"),
                new DoctorDef("Dr. Arun Nair",      "Emergency & Critical Care",    "+91-80-41152164", "24/7 On-Call")
            }
        );

        buildHospital(
            "Jeevashree Animal Hospital",
            "No. 552, 3rd Cross, 4th Block, Jayanagar, Bengaluru, Karnataka 560041",
            "Bengaluru", "+91-80-26564437", "care@jeevashree.com",
            "12.9250", "77.5938", "Mon–Sat: 9 AM – 8 PM | Sun: 10 AM – 2 PM",
            true, false, ownerId,
            new ServiceDef[]{
                new ServiceDef("Outpatient Consultation",  ServiceType.CONSULTATION, "350.00"),
                new ServiceDef("Spay / Neuter Surgery",    ServiceType.SURGERY,      "3500.00"),
                new ServiceDef("Core Vaccination Package", ServiceType.VACCINATION,  "550.00"),
                new ServiceDef("X-Ray & Ultrasound",       ServiceType.DIAGNOSTICS,  "1400.00"),
                new ServiceDef("Full Grooming Service",    ServiceType.GROOMING,     "700.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Kavitha Sharma",  "General Practice",          "+91-80-26564438", "Mon–Fri 9AM–6PM"),
                new DoctorDef("Dr. Prakash Iyer",    "Dermatology & Allergy",     "+91-80-26564439", "Tue, Thu, Sat 10AM–4PM")
            }
        );

        buildHospital(
            "Apollo Veterinary Clinic — Chennai",
            "No. 8, Greenways Road, RA Puram, Chennai, Tamil Nadu 600028",
            "Chennai", "+91-44-42138900", "vet@apollochennai.in",
            "13.0240", "80.2595", "Mon–Sat: 8 AM – 9 PM | Emergency: 24/7",
            true, true, ownerId,
            new ServiceDef[]{
                new ServiceDef("Specialist Consultation",      ServiceType.CONSULTATION, "500.00"),
                new ServiceDef("Soft Tissue Surgery",          ServiceType.SURGERY,      "6000.00"),
                new ServiceDef("Annual Wellness Vaccination",  ServiceType.VACCINATION,  "700.00"),
                new ServiceDef("Emergency & Intensive Care",   ServiceType.EMERGENCY,    "1500.00"),
                new ServiceDef("Diagnostic Imaging",           ServiceType.DIAGNOSTICS,  "2200.00"),
                new ServiceDef("Medicated Grooming",           ServiceType.GROOMING,     "900.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Meenakshi Pillai",  "Internal Medicine",        "+91-44-42138901", "Mon–Fri 9AM–5PM"),
                new DoctorDef("Dr. Sridhar Ganesh",    "Oncology & Imaging",       "+91-44-42138902", "Mon, Wed, Fri 10AM–4PM"),
                new DoctorDef("Dr. Prabhakaran K.",    "Emergency Medicine",       "+91-44-42138903", "24/7 On-Call")
            }
        );

        buildHospital(
            "Bombay Veterinary College Teaching Hospital",
            "12th Road, Wadala, Mumbai, Maharashtra 400031",
            "Mumbai", "+91-22-24128561", "bvcth@mafsu.in",
            "19.0176", "72.8562", "Mon–Fri: 9 AM – 5 PM | Emergency: 24/7",
            true, true, ownerId,
            new ServiceDef[]{
                new ServiceDef("Academic Consultation (Subsidised)", ServiceType.CONSULTATION, "200.00"),
                new ServiceDef("Surgical Procedure",                 ServiceType.SURGERY,      "3000.00"),
                new ServiceDef("Government Vaccination Drive",       ServiceType.VACCINATION,  "300.00"),
                new ServiceDef("Emergency Trauma Unit",              ServiceType.EMERGENCY,    "800.00"),
                new ServiceDef("Pathology & Lab Services",           ServiceType.DIAGNOSTICS,  "1200.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Vasant Pawar",     "Large & Small Animal Surgery", "+91-22-24128562", "Mon–Fri 9AM–1PM"),
                new DoctorDef("Dr. Snehal Joshi",     "Veterinary Pathology",         "+91-22-24128563", "Mon–Thu 10AM–4PM"),
                new DoctorDef("Dr. Rohit Kulkarni",   "Emergency & Trauma",           "+91-22-24128564", "24/7 On-Call")
            }
        );

        buildHospital(
            "Sushil's Companion Animal Practice",
            "3B, Ardeshir Dadi Street, Grant Road, Mumbai, Maharashtra 400007",
            "Mumbai", "+91-22-23864255", "info@sushilsvets.com",
            "18.9649", "72.8185", "Mon–Sat: 10 AM – 8 PM",
            true, false, ownerId,
            new ServiceDef[]{
                new ServiceDef("Companion Animal Consultation",     ServiceType.CONSULTATION, "600.00"),
                new ServiceDef("Routine Surgery",                   ServiceType.SURGERY,      "5000.00"),
                new ServiceDef("Annual Booster Programme",          ServiceType.VACCINATION,  "750.00"),
                new ServiceDef("Advanced Diagnostics",              ServiceType.DIAGNOSTICS,  "2500.00"),
                new ServiceDef("Spa & Breed-Specific Grooming",     ServiceType.GROOMING,     "1200.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Sushil Gala",   "Companion Animal Medicine",  "+91-22-23864256", "Mon–Sat 10AM–6PM"),
                new DoctorDef("Dr. Hetal Mehta",   "Cardiology & Ultrasound",    "+91-22-23864257", "Mon, Wed, Fri 11AM–3PM")
            }
        );

        buildHospital(
            "VCA Sparky Veterinary Care",
            "Plot No. 14, Road No. 2, Banjara Hills, Hyderabad, Telangana 500034",
            "Hyderabad", "+91-40-23351234", "sparky@vcahyd.in",
            "17.4146", "78.4484", "Mon–Sun: 8 AM – 10 PM | Emergency: 24/7",
            true, true, ownerId,
            new ServiceDef[]{
                new ServiceDef("General OPD Consultation",         ServiceType.CONSULTATION, "450.00"),
                new ServiceDef("Elective Surgery",                  ServiceType.SURGERY,      "5500.00"),
                new ServiceDef("Puppy/Kitten Vaccination Pack",     ServiceType.VACCINATION,  "600.00"),
                new ServiceDef("Emergency Stabilisation",           ServiceType.EMERGENCY,    "1000.00"),
                new ServiceDef("Bloodwork & Imaging Panel",         ServiceType.DIAGNOSTICS,  "1900.00"),
                new ServiceDef("Grooming & Hygiene Package",        ServiceType.GROOMING,     "750.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Vijay Reddy",      "General Veterinary Practice", "+91-40-23351235", "Mon–Sat 9AM–5PM"),
                new DoctorDef("Dr. Anitha Rao",       "Dentistry & Oral Health",     "+91-40-23351236", "Tue, Thu 9AM–1PM"),
                new DoctorDef("Dr. Prasad Nambiar",   "Emergency Critical Care",     "+91-40-23351237", "24/7 On-Call")
            }
        );

        buildHospital(
            "Paws N Claws Animal Hospital",
            "Shop 12, Sinhagad Road, Near Dandekar Bridge, Pune, Maharashtra 411030",
            "Pune", "+91-20-24333789", "pawsnclaws.pune@gmail.com",
            "18.4867", "73.8250", "Mon–Sat: 9 AM – 9 PM | Sun: 10 AM – 5 PM",
            true, false, ownerId,
            new ServiceDef[]{
                new ServiceDef("OPD Consultation",     ServiceType.CONSULTATION, "300.00"),
                new ServiceDef("General Surgery",      ServiceType.SURGERY,      "3800.00"),
                new ServiceDef("Core Vaccination",     ServiceType.VACCINATION,  "500.00"),
                new ServiceDef("Lab Diagnostics",      ServiceType.DIAGNOSTICS,  "1100.00"),
                new ServiceDef("Grooming & Bathing",   ServiceType.GROOMING,     "650.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Amol Deshpande",  "General Practice & Surgery", "+91-20-24333790", "Mon–Fri 9AM–6PM"),
                new DoctorDef("Dr. Priti Joshi",     "Dermatology",                "+91-20-24333791", "Mon, Wed, Sat 10AM–2PM")
            }
        );

        buildHospital(
            "Delhi Veterinary Hospital (Government)",
            "Rao Tula Ram Marg, Vasant Vihar, New Delhi, Delhi 110057",
            "New Delhi", "+91-11-26140290", "dvh.delhi@gov.in",
            "28.5523", "77.1556", "Mon–Sat: 9 AM – 5 PM | Emergency: 24/7",
            true, true, ownerId,
            new ServiceDef[]{
                new ServiceDef("General Consultation (Govt Rate)",  ServiceType.CONSULTATION, "100.00"),
                new ServiceDef("Subsidised Surgery",                ServiceType.SURGERY,      "2000.00"),
                new ServiceDef("Free Vaccination Drive (Strays)",   ServiceType.VACCINATION,  "0.00"),
                new ServiceDef("24/7 Emergency Unit",               ServiceType.EMERGENCY,    "500.00"),
                new ServiceDef("Basic Lab Services",                ServiceType.DIAGNOSTICS,  "600.00")
            },
            new DoctorDef[]{
                new DoctorDef("Dr. Ramesh Gupta",   "Chief Veterinary Officer",          "+91-11-26140291", "Mon–Fri 10AM–4PM"),
                new DoctorDef("Dr. Neha Tandon",    "Animal Welfare & Vaccination",      "+91-11-26140292", "Mon–Sat 9AM–3PM"),
                new DoctorDef("Dr. Aakash Batra",   "Emergency Services",                "+91-11-26140293", "24/7 On-Call")
            }
        );

        log.info("[DataSeeder]    8 hospitals seeded with services and doctors");
    }

    private void buildHospital(
            String name, String address, String city,
            String phone, String email,
            String lat, String lon, String hours,
            boolean verified, boolean emergency, UUID ownerId,
            ServiceDef[] serviceDefs,
            DoctorDef[] doctorDefs) {

        Hospital hospital = Hospital.builder()
            .ownerId(ownerId)
            .name(name).address(address).city(city)
            .contactPhone(phone).contactEmail(email)
            .latitude(new BigDecimal(lat)).longitude(new BigDecimal(lon))
            .operatingHours(hours)
            .isVerified(verified).emergencyReady(emergency)
            .build();
        hospital = hospitalRepo.save(hospital);

        List<HospitalService> services = new ArrayList<>();
        for (ServiceDef sd : serviceDefs) {
            HospitalService svc = HospitalService.builder()
                .hospital(hospital)
                .serviceName(sd.name())
                .serviceType(sd.type())
                .price(new BigDecimal(sd.price()))
                .build();
            services.add(serviceRepo.save(svc));
        }

        for (DoctorDef dd : doctorDefs) {
            Doctor doctor = Doctor.builder()
                .hospitalId(hospital.getId())
                .name(dd.name())
                .specialization(dd.specialization())
                .contactPhone(dd.phone())
                .availability(dd.availability())
                .isActive(true)
                .services(new HashSet<>(services))
                .build();
            doctorRepo.save(doctor);
        }
    }
}
