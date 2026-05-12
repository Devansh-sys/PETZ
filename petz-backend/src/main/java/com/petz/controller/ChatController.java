package com.petz.controller;

import com.petz.dto.request.ChatRequest;
import com.petz.service.ChatDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatDataService chatDataService;

    // ── Q&A record ────────────────────────────────────────────────────────
    private record QnA(String[] keywords, String answer) {
        boolean matches(String msg) {
            for (String k : keywords) if (msg.contains(k)) return true;
            return false;
        }
    }

    // ── Common Q&A (all roles) ────────────────────────────────────────────
    private static final List<QnA> COMMON = List.of(
        new QnA(new String[]{"hello", "hi ", "hey ", "help me", "what can you do", "healio"},
            "Hi there! 👋 I'm **Healio**, your PETZ companion! Ask me anything about the platform or pet care. 🐾"),
        new QnA(new String[]{"thank", "thanks", "awesome", "great job", "well done", "good bot"},
            "Happy to help! 🐾✨ Anything else I can do for you?"),
        new QnA(new String[]{"notification", "alert", "bell icon"},
            "Your notifications 🔔 are in the top-right bell icon. They update in real time when something changes on your account."),
        new QnA(new String[]{"what is petz", "about petz", "petz platform", "how does petz work"},
            "PETZ 🐾 is an Animal Welfare Platform connecting **Pet Owners**, **NGOs**, and **Hospitals**. You can book vet appointments, adopt pets, report rescues, and more — all in one place!"),
        new QnA(new String[]{"profile", "edit profile", "update profile", "my account"},
            "To edit your profile 👤, click on your avatar at the top → **Profile Settings**. Update your name, email, phone, and photo."),
        new QnA(new String[]{"password", "change password", "reset password"},
            "To change your password 🔐, go to **Profile Settings** → **Change Password**. Use at least 8 characters with numbers and symbols."),
        new QnA(new String[]{"vaccination", "vaccine", "vaccinate", "shot", "immuniz"},
            "Vaccination schedules 💉: Dogs — Rabies + DHPPi annually. Cats — FVRCP + Rabies yearly. Puppies/kittens start at 6–8 weeks with booster series. Always confirm with your vet!"),
        new QnA(new String[]{"emergency", "not breathing", "unconscious", "choking", "seizure"},
            "🚨 **PET EMERGENCY** — Rush to the nearest vet immediately! Don't wait. For choking, carefully check the mouth. Never give human pain medications to pets — they are toxic!"),
        new QnA(new String[]{"injured", "hurt", "bleeding", "wound", "first aid"},
            "If your pet is injured 🚑: Stay calm, apply gentle pressure to wounds with a clean cloth, and get to a vet ASAP. Don't use human medications — they can be fatal to animals!"),
        new QnA(new String[]{"tick", "flea", "parasite", "worm", "deworm"},
            "For parasites 🦟: Use vet-recommended monthly flea/tick prevention. Deworm puppies every 2 weeks until 12 weeks, then quarterly for adults. Remove ticks fully with tweezers — never crush them!"),
        new QnA(new String[]{"spay", "neuter", "sterilize"},
            "Spaying/neutering 🏥 reduces cancer risk, prevents unwanted litters, and improves behaviour. Recommended at 6–9 months for cats and 6–18 months for dogs depending on breed size."),
        new QnA(new String[]{"grooming", "bath", "bathe", "trim nail", "brush"},
            "Grooming 🛁: Bathe dogs every 1–4 weeks. Brush teeth 2–3x/week with pet toothpaste. Trim nails every 3–4 weeks. Cats are self-groomers but long-haired breeds need regular brushing."),
        new QnA(new String[]{"dental", "teeth", "tooth", "bad breath"},
            "Dental care 🦷: Brush with pet-safe toothpaste 2–3x/week. Dental chews help too. Bad breath often signals dental disease — ask your vet about a professional cleaning once a year."),
        new QnA(new String[]{"dog food", "feed my dog", "dog diet", "dog eat", "puppy food"},
            "Dog diet 🐕: High-quality commercial food matched to age/size. Avoid onions, garlic, grapes, chocolate, and xylitol — all toxic! Adults eat 2x/day; puppies 3–4x/day. Always fresh water."),
        new QnA(new String[]{"cat food", "feed my cat", "cat diet", "cat eat", "kitten food"},
            "Cat diet 🐱: Obligate carnivores — they need meat-based food. Avoid dog food, raw fish regularly, onions, and milk (most cats are lactose intolerant). Feed 2–3x/day with fresh water always."),
        new QnA(new String[]{"puppy", "kitten", "new pet", "baby animal", "got a new"},
            "New pet tips 🐣: Vet visit in the first week, start vaccinations, pet-proof your home (cover cables, secure trash), begin basic training early, and socialise gently. Feed age-appropriate food 3–4x/day.")
    );

    // ── USER Q&A ──────────────────────────────────────────────────────────
    private static final List<QnA> USER_QNA = List.of(
        new QnA(new String[]{"book appointment", "schedule appointment", "make appointment", "book a vet", "new appointment"},
            "To book a vet appointment 📅: Go to **Appointments** → **Book Appointment** → choose hospital, doctor, your pet, and time slot. You'll get a confirmation notification once the hospital confirms!"),
        new QnA(new String[]{"my appointments", "show appointments", "view appointments", "upcoming appointment", "check appointment"},
            "Your appointments are in the **Appointments** section 📋, organised by status — Pending, Confirmed, Completed, and Cancelled. Click any one for full details."),
        new QnA(new String[]{"cancel appointment", "cancel my appointment"},
            "To cancel an appointment ❌: Go to **Appointments** → click the appointment → select **Cancel**. The hospital will be notified. Please cancel in advance as a courtesy 🙏"),
        new QnA(new String[]{"reschedule", "change appointment", "move appointment"},
            "To reschedule ↩️: Cancel your existing appointment and rebook at the new time. Go to **Appointments** → Cancel → then **Book Appointment** again with your preferred slot."),
        new QnA(new String[]{"adopt", "adopt a pet", "pet adoption", "browse animals", "find a pet"},
            "To adopt a pet 🐾: Go to **Adoption** → browse available animals → click one you like → fill out the application (reason, housing type, experience). The NGO reviews and responds!"),
        new QnA(new String[]{"adoption application", "adoption status", "my application", "application status", "did they approve"},
            "Check your adoption applications under **Adoption → My Applications** 📋. Status can be: Pending (under review), Approved ✅, or Rejected ❌. You'll get a notification on any update."),
        new QnA(new String[]{"register pet", "add pet", "add my pet", "new pet registration"},
            "To register a pet 🐶: Go to **My Pets** → **Add Pet** → fill in name, species, breed, age, and weight. Your pet then appears when booking appointments!"),
        new QnA(new String[]{"my pets", "view pets", "pet list", "registered pets", "show my pets"},
            "All your registered pets are in the **My Pets** section 🐾. Click any pet to view or edit their details."),
        new QnA(new String[]{"report rescue", "report stray", "stray animal", "stray dog", "stray cat", "found injured"},
            "To report a stray or injured animal 🆘: Go to **Rescue** → **Report a Rescue** → fill in animal type, urgency, location, your **10-digit mobile number** (required so the NGO can contact you), and describe the situation. A nearby NGO is auto-assigned!"),
        new QnA(new String[]{"my rescue", "rescue status", "rescue report", "did ngo respond"},
            "Your rescue reports are in the **Rescue** section 🚨. You can see the status (Pending → Assigned → In Progress → Completed) and which NGO is handling it."),
        new QnA(new String[]{"hospital", "find hospital", "vet hospital", "clinic", "which hospital"},
            "To find hospitals 🏥: Go to **Hospitals** in the sidebar. Browse verified hospitals by name and city. Click on one to see services, doctors, and contact details."),
        new QnA(new String[]{"cost", "fee", "price", "how much", "payment", "charge"},
            "Appointment fees 💰 are set by each hospital and vary by doctor. You'll see the fee when selecting a doctor during booking. Payments are made directly at the hospital — PETZ doesn't process payments."),
        new QnA(new String[]{"what is my appointment status", "appointment confirmed", "is it confirmed"},
            "Appointment statuses: ⏳ **Pending** — waiting for hospital confirmation. ✅ **Confirmed** — hospital approved it. ✔ **Completed** — visit done. ❌ **Cancelled** — cancelled by you or hospital."),
        new QnA(new String[]{"senior pet", "old dog", "old cat", "aging pet", "elderly pet"},
            "Senior pet care 🐕‍🦺: Schedule vet check-ups every 6 months (not yearly). Watch for arthritis (limping), dental disease, weight changes, and cognitive decline. Senior-formula food helps. Keep them comfortable and loved! ❤️"),
        new QnA(new String[]{"toxic", "poison", "dangerous food", "what not to feed", "can dog eat", "can cat eat"},
            "⚠️ Toxic foods for pets: **Dogs** — Chocolate, grapes, raisins, onions, garlic, xylitol (in sugar-free gum), avocado, alcohol. **Cats** — Onions, garlic, lilies (deadly!), chocolate, xylitol, raw dough. When in doubt — don't feed it!")
    );

    // ── NGO Q&A ───────────────────────────────────────────────────────────
    private static final List<QnA> NGO_QNA = List.of(
        new QnA(new String[]{"add animal", "list animal", "post animal", "create listing", "new animal listing"},
            "To add an animal listing 🐾: Go to **Animal Listings** → **Add Animal** → fill in name, species, breed, age, gender, description, city. After saving, upload a photo from the edit popup. The animal appears in the public adoption feed immediately!"),
        new QnA(new String[]{"delete animal", "remove animal", "remove listing", "delete listing"},
            "To remove an animal listing 🗑: Go to **Animal Listings** → click the animal card → click **Remove Animal** in the popup. This also removes all pending adoption applications for that animal."),
        new QnA(new String[]{"edit animal", "update animal", "modify listing", "change animal details"},
            "To edit an animal listing ✏️: Go to **Animal Listings** → click the animal card → click **Edit** in the popup. Update any field — name, species, breed, age, description, or city."),
        new QnA(new String[]{"upload photo", "animal photo", "add photo", "photo not showing", "image"},
            "To upload a photo 📸: Go to **Animal Listings** → click the animal → **Edit** → **Upload Photo**. Accepted: JPG, PNG (max 10MB). Good photos increase adoption chances significantly!"),
        new QnA(new String[]{"review application", "approve application", "reject application", "adoption application", "pending application", "applications"},
            "To review adoption applications 📋: Go to **Applications** → click a Pending application → add optional review notes (sent to the applicant) → click **Approve** ✅ or **Reject** ❌. The applicant is notified automatically!"),
        new QnA(new String[]{"accept rescue", "accept assignment", "rescue queue", "rescue assigned", "new rescue"},
            "New rescues appear in **Rescue Queue** 🚨. Click a card to see full details → you'll see the **reporter's mobile number** you can call directly 📞 → click **Accept** to take it on or **Decline** if you cannot respond right now."),
        new QnA(new String[]{"complete rescue", "mark complete", "finish rescue", "rescue done", "resolved"},
            "To complete a rescue ✅: Open it from **Rescue Queue** → in the popup, write completion notes → click **Mark as Complete**. The reporter gets notified, and the rescue moves to Completed."),
        new QnA(new String[]{"decline rescue", "reject rescue", "can't take rescue", "unable to respond"},
            "To decline a rescue ❌: Open the rescue card → click **Decline** (on the card or in the popup). It will be reassigned to another NGO. Only decline if truly unable — every rescue counts! 🙏"),
        new QnA(new String[]{"my animals", "all animals", "animal listings", "how many animals"},
            "All your animal listings are in **Animal Listings** 📋. You can filter by status (Available / Reserved / Adopted), search by name or species, and see totals in the stat strip."),
        new QnA(new String[]{"animal status", "available", "reserved", "adopted status"},
            "Animal statuses: 🟢 **Available** — listed, open for applications. 🟡 **Reserved** — an application was approved. 🔵 **Adopted** — adoption completed. Status updates automatically when you approve an application."),
        new QnA(new String[]{"ngo profile", "organization profile", "edit ngo", "ngo details"},
            "Edit your NGO profile 🏢 in **Settings/Profile** — update organisation name, address, city, contact email, phone, and description. A complete profile builds trust with adopters!"),
        new QnA(new String[]{"verified", "verification", "ngo status", "approved ngo"},
            "NGO verification ✅ is done by the PETZ Admin. Once verified, your listings appear publicly and you receive rescue assignments. Contact the admin if verification has been pending too long."),
        new QnA(new String[]{"housing type", "applicant housing", "apartment house"},
            "The **Housing Type** in adoption applications shows where the applicant lives (Apartment, House with Yard, Farm, etc.). It helps assess if the home suits the animal — e.g., large dogs need space!"),
        new QnA(new String[]{"statistics", "stats", "numbers", "ngo stats", "my stats"},
            "Your NGO stats are on the **Dashboard** 📊: total animal listings, pending adoption applications, active rescues, and completed rescues. A great way to track your impact!"),
        new QnA(new String[]{"applicant", "adopter", "who applied", "application details"},
            "Adoption applications show the applicant's housing type, other pets, reason for adoption, and pet experience. Use these details to make the best match for each animal 🐾."),
        new QnA(new String[]{"pending approval", "pending rescue", "what needs attention"},
            "Check your **Dashboard** for a quick overview of what needs attention: pending adoption applications, active rescue assignments awaiting action, and new animal listing updates.")
    );

    // ── HOSPITAL Q&A ──────────────────────────────────────────────────────
    private static final List<QnA> HOSPITAL_QNA = List.of(
        new QnA(new String[]{"view appointments", "all appointments", "appointment list", "show appointments"},
            "All your hospital's appointments are in the **Appointments** section 📋. Filter by status (Pending / Confirmed / Completed / Cancelled) or toggle **Today** to see just today's schedule."),
        new QnA(new String[]{"confirm appointment", "approve appointment", "accept booking"},
            "To confirm a Pending appointment ✅: Go to **Appointments** → find the pending booking → click **Confirm**. The pet owner is notified immediately."),
        new QnA(new String[]{"cancel appointment", "reject appointment", "decline booking"},
            "To cancel an appointment ❌: Go to **Appointments** → find it → click **Cancel**. The pet owner will be notified. Add a reason if possible so they can rebook."),
        new QnA(new String[]{"today appointment", "today's schedule", "today only", "appointments today"},
            "To view only today's appointments 📅: Go to **Appointments** → toggle the **Today** filter. This gives you a focused view of your day without past/future clutter."),
        new QnA(new String[]{"pending appointments", "unconfirmed", "new bookings", "new appointment"},
            "Pending appointments are new bookings waiting for your confirmation ⏳. Go to **Appointments** → filter by **Pending**. Confirm or cancel promptly so pet owners can plan!"),
        new QnA(new String[]{"hospital profile", "edit hospital", "update hospital", "hospital details", "our profile"},
            "Edit your hospital profile 🏥 in **Settings/Profile** — update hospital name, address, city, phone, email, services, and working hours. A complete profile attracts more bookings!"),
        new QnA(new String[]{"doctor", "vet", "veterinarian", "our doctors", "doctor list"},
            "Your associated doctors/vets appear during appointment booking so pet owners can choose their preferred specialist. Keep the doctor list updated in **Hospital Profile → Doctors**."),
        new QnA(new String[]{"completed appointment", "finished appointments", "past appointments", "history"},
            "Completed appointments are in **Appointments** → filter by **Completed** 📁. These form your service history and help track overall activity and capacity."),
        new QnA(new String[]{"specialization", "specialty", "services", "what we treat"},
            "Your hospital's specializations are shown publicly when pet owners browse 🏥. Keep them updated in **Hospital Profile → Services** to attract the right cases."),
        new QnA(new String[]{"working hours", "timing", "opening hours", "schedule", "open time"},
            "Update your working hours in **Hospital Profile** 🕐 so pet owners know when to book. Update for holidays and seasonal changes to avoid confusion."),
        new QnA(new String[]{"contact", "phone number", "email address", "location", "address"},
            "Your contact details (phone, email, address) are publicly visible to pet owners 📞. Keep them current in **Hospital Profile** — pet owners often contact before booking."),
        new QnA(new String[]{"emergency", "urgent case", "walk in", "emergency patient"},
            "For emergency walk-ins 🚨: Handle at your discretion. If a PETZ rescue case needs urgent vet care, coordinate directly with the assigned NGO. You can add emergency notes in appointment completion."),
        new QnA(new String[]{"how many appointment", "appointment count", "busy", "workload"},
            "Your appointment count is on the **Dashboard** and **Appointments** page 📊. Filter by date or status to manage capacity. Great for planning staff schedules!"),
        new QnA(new String[]{"verified", "verification", "hospital status", "approved hospital"},
            "Hospital verification ✅ is done by the PETZ Admin. Once approved, you appear in the public hospital directory and pet owners can book with you."),
        new QnA(new String[]{"pet owner", "client", "patient owner", "customer"},
            "Pet owners book through PETZ 🐾. Each appointment shows the pet's details (name, species, breed, age) and the selected doctor. Their contact info is in the appointment details."),
        new QnA(new String[]{"follow up", "followup", "follow-up", "second visit"},
            "For follow-ups 📅, note 'Follow-up required' in the completion notes so the owner knows to rebook. The owner can rebook through the normal appointment flow. A dedicated follow-up feature is planned!")
    );

    // ── ADMIN Q&A ─────────────────────────────────────────────────────────
    private static final List<QnA> ADMIN_QNA = List.of(
        new QnA(new String[]{"approve ngo", "ngo approval", "pending ngo", "verify ngo"},
            "To approve an NGO ✅: Go to **Admin → NGO Management** → find the pending NGO → click **Approve**. They immediately gain access to post animal listings and receive rescue assignments. Review details carefully!"),
        new QnA(new String[]{"approve hospital", "hospital approval", "pending hospital", "verify hospital"},
            "To approve a hospital 🏥: Go to **Admin → Hospital Management** → find the pending hospital → click **Approve**. They'll appear in the public directory for pet owners."),
        new QnA(new String[]{"reject ngo", "reject hospital", "decline approval", "reject registration"},
            "To reject a pending NGO/Hospital ❌: Go to the management section → find the application → click **Reject**. They'll be notified and can reapply with corrections."),
        new QnA(new String[]{"all users", "user list", "manage users", "total users", "user count"},
            "View all users in **Admin → User Management** 👥. See counts by role (Pet Owner, NGO, Hospital), filter by status, and manage accounts as needed."),
        new QnA(new String[]{"platform stats", "statistics", "dashboard", "platform overview", "overview"},
            "Your Admin dashboard shows real-time platform stats 📊: total users, registered animals, active rescues, pending approvals, adoption rates, and more."),
        new QnA(new String[]{"pending approval", "what needs approval", "pending", "needs review"},
            "Pending approvals ⏳ are highlighted on your Admin Dashboard — NGOs and Hospitals waiting for verification. Review and act on them to keep the platform running smoothly!"),
        new QnA(new String[]{"ngo management", "manage ngo", "ngo list", "all ngos"},
            "In **Admin → NGO Management** 🏢: see all NGOs (approved & pending), their verification status, animal listing count, and rescue stats. Approve, reject, or monitor each one."),
        new QnA(new String[]{"hospital management", "manage hospital", "hospital list", "all hospitals"},
            "In **Admin → Hospital Management** 🏥: view all registered hospitals, approval status, appointment counts, and contacts. Approve new hospitals and monitor existing ones."),
        new QnA(new String[]{"total animals", "animals on platform", "how many animals"},
            "Total animals listed across all NGOs is on your **Admin Dashboard** 🐾. You can also browse all listings in the Adoption section, filtered by NGO."),
        new QnA(new String[]{"total rescue", "rescue statistics", "rescue count", "rescue data"},
            "Rescue stats 🚨 on your Dashboard: total reports, assigned, in progress, and completed. Use this to monitor NGO responsiveness and rescue system health."),
        new QnA(new String[]{"adoption statistics", "adoption data", "adoption rate"},
            "Adoption stats 🐾: total applications, approval rates, and successful adoptions are visible on your Admin Dashboard under the Adoption metrics section."),
        new QnA(new String[]{"user roles", "roles", "role management", "permissions"},
            "PETZ has 4 roles 🔐: **Pet Owner** (books appointments, adopts), **NGO** (lists animals, handles rescues), **Hospital** (manages appointments), **Admin** (manages the platform). Assigned at registration."),
        new QnA(new String[]{"ban", "block user", "remove user", "suspend user", "delete user"},
            "User management (ban/suspend) is in **Admin → User Management** 👥. Find the user → view account → use the management options. Use carefully and only for policy violations."),
        new QnA(new String[]{"platform health", "system health", "is everything working", "system status"},
            "Monitor platform health 🟢 via your Dashboard stats. Unusual numbers (all rescues stalled, hospitals all pending) may indicate a process issue. Check your Railway deployment logs for server health."),
        new QnA(new String[]{"verified ngo", "approved ngo", "ngo count", "active ngo"},
            "Approved vs pending NGOs are in **Admin → NGO Management** 🏢. The status badge shows clearly. Verified NGOs appear in rescue routing and their animals show in the adoption feed."),
        new QnA(new String[]{"verified hospital", "approved hospital", "hospital count", "active hospital"},
            "Approved vs pending hospitals are in **Admin → Hospital Management** 🏥. Only approved hospitals appear in the public directory for bookings.")
    );

    // ── POST /chat ─────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatRequest req) {

        Long   userId   = req.getUserId();
        String role     = req.getRole()     != null ? req.getRole().toUpperCase() : "USER";
        String userName = req.getUserName() != null ? req.getUserName()           : "";

        // ── Proactive greeting ─────────────────────────────────────────────
        if ("__init__".equals(req.getMessage())) {
            String greeting = chatDataService.buildProactiveGreeting(userId, role, userName);
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("response",   greeting);
            resp.put("isGreeting", true);
            return ResponseEntity.ok(resp);
        }

        if (req.getMessage() == null || req.getMessage().isBlank()) {
            return ok("Please type a message first! 🐾");
        }

        String reply = findAnswer(req.getMessage().trim(), role);
        return ResponseEntity.ok(Map.of("response", reply));
    }

    // ── Keyword matcher ────────────────────────────────────────────────────
    private String findAnswer(String message, String role) {
        String msg = message.toLowerCase();

        // Role-specific first
        List<QnA> roleList = switch (role) {
            case "NGO"      -> NGO_QNA;
            case "HOSPITAL" -> HOSPITAL_QNA;
            case "ADMIN"    -> ADMIN_QNA;
            default         -> USER_QNA;
        };

        for (QnA q : roleList)   if (q.matches(msg)) return q.answer();
        for (QnA q : COMMON)     if (q.matches(msg)) return q.answer();

        // Default fallback
        return "Hmm, I'm not sure about that one 🤔 Try asking about:\n"
             + roleHints(role);
    }

    private String roleHints(String role) {
        return switch (role) {
            case "NGO"      -> "🐾 Adding/removing animal listings\n📋 Reviewing adoption applications\n🚨 Accepting or completing rescues\n📊 Your NGO stats";
            case "HOSPITAL" -> "📋 Viewing or confirming appointments\n🏥 Your hospital profile\n📊 Today's schedule\n🔔 Notifications";
            case "ADMIN"    -> "✅ Approving NGOs and Hospitals\n📊 Platform statistics\n👥 User management\n🚨 Rescue monitoring";
            default         -> "📅 Booking appointments\n🐾 Pet adoption\n🐶 Registering your pets\n🆘 Reporting a rescue\n💉 Pet health tips";
        };
    }

    // ── Convenience response ───────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> ok(String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("response", message);
        return ResponseEntity.ok(m);
    }
}
