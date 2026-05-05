-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data for local development  (INSERT IGNORE = safe to re-run on restart)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Slot schema fix: make booking-only columns nullable ──────────────────────
-- pet_id, user_id, slot_id, status are filled only when a slot is actually
-- booked. Pure availability slots (AVAILABLE state) have no pet/user yet.
-- ddl-auto=update doesn't remove NOT NULL once set, so we patch it here.
SET @s := IF((SELECT IS_NULLABLE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='pet_id')='NO',
    'ALTER TABLE appointments MODIFY COLUMN pet_id BINARY(16) NULL', 'DO 0');
PREPARE __s FROM @s; EXECUTE __s; DEALLOCATE PREPARE __s;

SET @s := IF((SELECT IS_NULLABLE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='user_id')='NO',
    'ALTER TABLE appointments MODIFY COLUMN user_id BINARY(16) NULL', 'DO 0');
PREPARE __s FROM @s; EXECUTE __s; DEALLOCATE PREPARE __s;

SET @s := IF((SELECT IS_NULLABLE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='slot_id')='NO',
    'ALTER TABLE appointments MODIFY COLUMN slot_id BINARY(16) NULL', 'DO 0');
PREPARE __s FROM @s; EXECUTE __s; DEALLOCATE PREPARE __s;

SET @s := IF((SELECT IS_NULLABLE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='status')='NO',
    'ALTER TABLE appointments MODIFY COLUMN status VARCHAR(50) NULL', 'DO 0');
PREPARE __s FROM @s; EXECUTE __s; DEALLOCATE PREPARE __s;

-- ── Fix NULL is_locked on any existing appointment rows ──────────────────────
-- Appointment.isLocked is a primitive boolean — Hibernate throws on NULL reads.
-- Must run BEFORE any slot queries so stale rows from previous runs are safe.
UPDATE appointments SET is_locked = 0 WHERE is_locked IS NULL;

-- ── Role migration ──
-- role column is VARCHAR(20) so old values survive schema updates as plain strings.
-- These UPDATEs are idempotent — no-ops once all rows are already migrated.
UPDATE users SET role = 'REPORTER'     WHERE role IN ('ADOPTER', 'VOLUNTEER', '');
UPDATE users SET role = 'HOSPITAL_REP' WHERE role = 'VET';
 
-- Hospitals  (is_verified=1 so they appear in discovery; owner_id is a placeholder UUID)
INSERT IGNORE INTO hospitals
  (id, owner_id, name, address, city, contact_phone, contact_email,
   latitude, longitude, operating_hours, operating_hours_json,
   is_verified, emergency_ready, is_open_now, created_at)
VALUES
(UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('ffffffff-0000-0000-0000-000000000001'),
 'PetCare Animal Hospital',
 '14, MG Road, Andheri West', 'Mumbai',
 '+91-22-4567-8901', 'contact@petcare.in',
 19.1136, 72.8697,
 'Mon-Sat 9:00 AM – 7:00 PM', NULL,
 1, 1, 1, NOW()),
 
(UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('ffffffff-0000-0000-0000-000000000001'),
 'Paws & Claws Vet Clinic',
 '22, Linking Road, Bandra', 'Mumbai',
 '+91-22-6543-2100', 'info@pawsclaws.in',
 19.0596, 72.8295,
 'Mon-Sun 8:00 AM – 9:00 PM', NULL,
 1, 0, 1, NOW()),
 
(UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('ffffffff-0000-0000-0000-000000000001'),
 'Delhi Pet Hospital',
 '5, Connaught Place, New Delhi', 'Delhi',
 '+91-11-2345-6789', 'hello@delhipet.in',
 28.6315, 77.2167,
 'Mon-Sat 10:00 AM – 6:00 PM', NULL,
 1, 1, 1, NOW()),
 
(UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('ffffffff-0000-0000-0000-000000000001'),
 'Green Leaf Animal Clinic',
 '88, Indiranagar 100ft Road', 'Bangalore',
 '+91-80-4100-2233', 'greenleaf@vetclinic.in',
 12.9784, 77.6408,
 'Mon-Fri 9:00 AM – 8:00 PM, Sat 9:00 AM – 5:00 PM', NULL,
 1, 0, 1, NOW()),
 
(UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('ffffffff-0000-0000-0000-000000000001'),
 'Bangalore Emergency Pet Care',
 '31, Koramangala 4th Block', 'Bangalore',
 '+91-80-9988-7766', 'emergency@bepcare.in',
 12.9352, 77.6245,
 'Open 24 Hours', NULL,
 1, 1, 1, NOW());
 
-- Hospital Services
INSERT IGNORE INTO hospital_services (id, hospital_id, service_name, service_type, price) VALUES
-- PetCare Animal Hospital
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000001'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), 'General Consultation', 'CONSULTATION', 500.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000002'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), 'Vaccination Package',  'VACCINATION',   800.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000003'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), 'Minor Surgery',         'SURGERY',       3500.00),
-- Paws & Claws Vet Clinic
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000004'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'), 'General Consultation',  'CONSULTATION',  450.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000005'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'), 'Grooming Session',      'GROOMING',      600.00),
-- Delhi Pet Hospital
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000006'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), 'General Consultation',  'CONSULTATION',  400.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000007'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), 'Diagnostics & Labs',    'DIAGNOSTICS',   1200.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000008'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), 'Emergency Care',        'EMERGENCY',     2000.00),
-- Green Leaf Animal Clinic
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000009'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'), 'General Consultation',  'CONSULTATION',  550.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000010'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'), 'Vaccination',           'VACCINATION',   750.00),
-- Bangalore Emergency Pet Care
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000011'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), 'Emergency Care',        'EMERGENCY',     3000.00),
(UUID_TO_BIN('dddd0000-0000-0000-0000-000000000012'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), 'Surgery',               'SURGERY',       8000.00);
 
-- Doctors
INSERT IGNORE INTO doctors (id, hospital_id, name, specialization, contact_phone, availability, is_active) VALUES
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), 'Anita Sharma',  'Small Animals',           '+91-98100-11111', 'Mon-Fri 9 AM-5 PM',  1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000002'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), 'Rajiv Mehta',   'Surgery & Orthopaedics',  '+91-98100-22222', 'Mon-Sat 10 AM-6 PM', 1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'), 'Priya Nair',    'Dermatology & Grooming',  '+91-98200-33333', 'Tue-Sun 8 AM-4 PM',  1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), 'Suresh Kumar',  'Internal Medicine',       '+91-98300-44444', 'Mon-Fri 10 AM-6 PM', 1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000005'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), 'Kavita Reddy',  'Emergency & Critical Care','+91-98300-55555', 'Mon-Sun 9 AM-9 PM',  1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'), 'Arjun Singh',   'General Practice',        '+91-98400-66666', 'Mon-Fri 9 AM-8 PM',  1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000007'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), 'Meera Patel',   'Emergency & Surgery',     '+91-98500-77777', 'Open 24 Hours',       1),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000008'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), 'Rohan Desai',   'Critical Care',           '+91-98500-88888', 'Open 24 Hours',       1);
 
-- Doctor ↔ Service links
INSERT IGNORE INTO doctor_services (doctor_id, service_id) VALUES
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000002')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000002'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000001')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000002'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000003')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000004')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000005')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000007')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000005'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000006')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000005'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000008')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000009')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000010')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000007'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000011')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000007'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000012')),
(UUID_TO_BIN('eeee0000-0000-0000-0000-000000000008'), UUID_TO_BIN('dddd0000-0000-0000-0000-000000000011'));
 
-- Appointment Slots (rolling — always 1-4 days ahead so they never expire)
INSERT IGNORE INTO appointments
  (id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
   duration_minutes, slot_status, booking_type, version, created_at, updated_at)
VALUES
-- PetCare — Dr. Anita Sharma (day+1)
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000001'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '09:00:00','09:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000002'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '09:30:00','10:00:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000003'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '10:00:00','10:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- PetCare — Dr. Rajiv Mehta (day+1)
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000004'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000002'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '11:00:00','11:45:00', 45,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000005'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000002'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '14:00:00','14:45:00', 45,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- PetCare day+2
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000006'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), DATE_ADD(CURDATE(),INTERVAL 2 DAY), '09:00:00','09:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000007'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'), DATE_ADD(CURDATE(),INTERVAL 2 DAY), '10:00:00','10:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- Paws & Claws — Dr. Priya Nair
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000008'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '09:00:00','09:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000009'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '10:00:00','10:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- Delhi — Dr. Suresh Kumar
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000010'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '10:00:00','10:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000011'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '11:00:00','11:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- Delhi — Dr. Kavita Reddy
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000012'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000005'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '14:00:00','14:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- Green Leaf — Dr. Arjun Singh
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000013'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '09:00:00','09:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000014'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'), DATE_ADD(CURDATE(),INTERVAL 2 DAY), '09:00:00','09:30:00', 30,'AVAILABLE','ROUTINE',0,NOW(),NOW()),
-- Bangalore Emergency — Dr. Meera Patel & Dr. Rohan Desai
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000015'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000007'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '08:00:00','08:30:00', 30,'AVAILABLE','ROUTINE',  0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000016'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000007'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '20:00:00','20:30:00', 30,'AVAILABLE','EMERGENCY',0,NOW(),NOW()),
(UUID_TO_BIN('ffff0000-0000-0000-0000-000000000017'), UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'), UUID_TO_BIN('eeee0000-0000-0000-0000-000000000008'), DATE_ADD(CURDATE(),INTERVAL 1 DAY), '10:00:00','10:30:00', 30,'AVAILABLE','ROUTINE',  0,NOW(),NOW());
 
-- NGOs
INSERT IGNORE INTO ngo (id, name, latitude, longitude, active) VALUES
(UUID_TO_BIN('11110000-0000-0000-0000-000000000001'), 'Happy Paws NGO',        19.0760, 72.8777, 1),
(UUID_TO_BIN('11110000-0000-0000-0000-000000000002'), 'Animal Care Trust',     28.7041, 77.1025, 1),
(UUID_TO_BIN('11110000-0000-0000-0000-000000000003'), 'Paws & Love Foundation',12.9716, 77.5946, 1);
 
-- Adoptable Pets  (status=LISTED so they appear in the public catalog)
INSERT IGNORE INTO adoptable_pets
  (id, ngo_id, name, species, breed, gender, age_months,
   location_city, description, temperament,
   medical_summary, vaccination_status,
   special_needs, special_needs_notes,
   is_adoption_ready, status, created_at, updated_at, version)
VALUES
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'Buddy','DOG','Labrador','MALE',18,
 'Mumbai',
 'A playful and loving Labrador who gets along well with children and other dogs.',
 'Friendly, energetic, loves fetch',
 'Healthy, fully vaccinated and dewormed',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'Luna','CAT','Persian','FEMALE',24,
 'Mumbai',
 'Luna is a calm and affectionate Persian cat who loves cuddles.',
 'Calm, gentle, loves laps',
 'Spayed, vaccinated, healthy',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
 'Rocky','DOG','German Shepherd','MALE',36,
 'Delhi',
 'Rocky is a trained German Shepherd, great for active families.',
 'Alert, loyal, energetic',
 'Fully vaccinated, regular health check-ups',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
 'Milo','DOG','Beagle','MALE',8,
 'Delhi',
 'Milo is a puppy full of energy and love, looking for a forever home.',
 'Playful, curious, loves everyone',
 'First vaccines completed, dewormed',
 'PARTIALLY_VACCINATED', 0, NULL, 0,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
 'Whiskers','CAT','Tabby','FEMALE',12,
 'Bangalore',
 'Whiskers is a playful tabby who loves toys and window watching.',
 'Playful, independent, curious',
 'Spayed, vaccinated',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
 'Charlie','DOG','Indie','MALE',30,
 'Bangalore',
 'Charlie is a resilient street dog who has been rescued and rehabilitated.',
 'Adaptable, brave, affectionate',
 'Vaccinated, neutered, healthy',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'Bella','DOG','Golden Retriever','FEMALE',15,
 'Mumbai',
 'Bella is a sweet Golden Retriever who loves everyone she meets.',
 'Sweet, gentle, obedient',
 'Fully vaccinated, spayed',
 'FULLY_VACCINATED', 1, 'Requires hypoallergenic diet', 1,'LISTED', NOW(), NOW(), 0),
 
(UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000008'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
 'Oliver','CAT','Siamese','MALE',20,
 'Delhi',
 'Oliver is a vocal Siamese who loves attention and interactive play.',
 'Vocal, affectionate, smart',
 'Neutered, vaccinated, healthy',
 'FULLY_VACCINATED', 0, NULL, 1,'LISTED', NOW(), NOW(), 0);
 
-- ─────────────────────────────────────────────────────────────────────────────
-- Dynamic catch-all: seed a Consultation service + one doctor + 4 slots for
-- every VERIFIED hospital that still has NO services.
-- Uses UNHEX(MD5(...)) for deterministic, collision-free BINARY(16) IDs.
-- Safe to re-run: INSERT IGNORE skips duplicates on the same hospital.
-- ─────────────────────────────────────────────────────────────────────────────
 
-- Service: General Consultation
INSERT IGNORE INTO hospital_services (id, hospital_id, service_name, service_type, price)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-CONS'))),
       h.id, 'General Consultation', 'CONSULTATION', 500.00
FROM hospitals h
WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM hospital_services hs WHERE hs.hospital_id = h.id);
 
-- Service: Vaccination
INSERT IGNORE INTO hospital_services (id, hospital_id, service_name, service_type, price)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-VACC'))),
       h.id, 'Vaccination', 'VACCINATION', 700.00
FROM hospitals h
WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM hospital_services hs WHERE hs.hospital_id = h.id AND hs.service_name = 'Vaccination');
 
-- Doctor
INSERT IGNORE INTO doctors (id, hospital_id, name, specialization, availability, is_active)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       h.id, 'Resident Veterinarian', 'General Practice', 'Mon-Fri 9 AM – 5 PM', 1
FROM hospitals h
WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.hospital_id = h.id);
 
-- Doctor ↔ Consultation service link
INSERT IGNORE INTO doctor_services (doctor_id, service_id)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       UNHEX(MD5(CONCAT(HEX(h.id), '-CONS')))
FROM hospitals h
WHERE h.is_verified = 1;
 
-- Doctor ↔ Vaccination service link
INSERT IGNORE INTO doctor_services (doctor_id, service_id)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       UNHEX(MD5(CONCAT(HEX(h.id), '-VACC')))
FROM hospitals h
WHERE h.is_verified = 1;
 
-- Appointment slots (day+1 through day+4, morning + afternoon each day)
INSERT IGNORE INTO appointments
  (id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
   duration_minutes, slot_status, booking_type, version, created_at, updated_at)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-SL-D1-AM'))),
       h.id, UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '09:30:00',
       30, 'AVAILABLE', 'ROUTINE', 0, NOW(), NOW()
FROM hospitals h WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.hospital_id = h.id AND a.slot_status = 'AVAILABLE' AND a.appointment_date > CURDATE());
 
INSERT IGNORE INTO appointments
  (id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
   duration_minutes, slot_status, booking_type, version, created_at, updated_at)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-SL-D1-PM'))),
       h.id, UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '14:30:00',
       30, 'AVAILABLE', 'ROUTINE', 0, NOW(), NOW()
FROM hospitals h WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.hospital_id = h.id AND a.slot_status = 'AVAILABLE' AND a.appointment_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND a.appointment_time = '14:00:00');
 
INSERT IGNORE INTO appointments
  (id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
   duration_minutes, slot_status, booking_type, version, created_at, updated_at)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-SL-D2-AM'))),
       h.id, UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '09:30:00',
       30, 'AVAILABLE', 'ROUTINE', 0, NOW(), NOW()
FROM hospitals h WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.hospital_id = h.id AND a.slot_status = 'AVAILABLE' AND a.appointment_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) AND a.appointment_time = '09:00:00');
 
INSERT IGNORE INTO appointments
  (id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
   duration_minutes, slot_status, booking_type, version, created_at, updated_at)
SELECT UNHEX(MD5(CONCAT(HEX(h.id), '-SL-D2-PM'))),
       h.id, UNHEX(MD5(CONCAT(HEX(h.id), '-DR1'))),
       DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '14:30:00',
       30, 'AVAILABLE', 'ROUTINE', 0, NOW(), NOW()
FROM hospitals h WHERE h.is_verified = 1
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.hospital_id = h.id AND a.slot_status = 'AVAILABLE' AND a.appointment_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) AND a.appointment_time = '14:00:00');
 
-- ═════════════════════════════════════════════════════════════════════════════
-- SESSION 2026-04-29 — schema fixes + demo accounts + 4-hour shift slot seeding
-- ═════════════════════════════════════════════════════════════════════════════
-- These statements are idempotent. Spring Boot runs data.sql on every restart
-- (spring.sql.init.mode=always, jpa.defer-datasource-initialization=true), so
-- each ALTER uses IF EXISTS / IF NOT EXISTS, every UPDATE re-asserts state, and
-- every INSERT uses IGNORE keyed on UUID-derived deterministic IDs.
 
-- ── Schema cleanup: drop orphan NOT-NULL columns left over from old entities ──
-- MySQL's ALTER TABLE ... DROP INDEX has no IF EXISTS form, so wrap each ALTER
-- in a conditional PREPARE that no-ops when the index/column is already gone.
-- Fresh installs run the no-ops; legacy installs perform the drops.
 
SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'hospital_audit_logs'
         AND INDEX_NAME   = 'idx_audit_clinic') > 0,
    'ALTER TABLE hospital_audit_logs DROP INDEX idx_audit_clinic',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
 
SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'hospital_audit_logs'
         AND COLUMN_NAME  = 'clinic_id') > 0,
    'ALTER TABLE hospital_audit_logs DROP COLUMN clinic_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
 
-- Make appointments.appointment_type tolerant of inserts that don't set it.
-- The current entity has no field for this column; it was kept as a NOT NULL
-- enum from a previous schema. Adding a default lets every API path that
-- writes to `appointments` succeed without code changes. Skip if the column
-- isn't present (fresh installs from current entities don't create it).
SET @sql := IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'appointments'
         AND COLUMN_NAME  = 'appointment_type') > 0,
    'ALTER TABLE appointments MODIFY appointment_type ENUM(''EMERGENCY'',''ROUTINE'') NOT NULL DEFAULT ''ROUTINE''',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
 
-- ── Demo accounts: one row per role, all with password Petz@1234 ──
-- BCrypt hash of "Petz@1234" (cost=10). Re-using the same hash across rows is
-- intentional and dev-only; production accounts hash unique passwords each.
SET @petz_pwd = '$2a$10$FRaElkIfKSxPqegRndfQL.MDfm5EZQgb00X0uhym9pyuxzPEn6CWK';
 
-- Upsert demo users so every PETZ role has at least one login.
-- ADMIN, NGO_REP rows are also created by DataSeeder on a fresh DB.
INSERT IGNORE INTO users (
    id, role, full_name, phone, email, password,
    active, email_verified, phone_verified, is_temporary,
    failed_login_attempts, created_at
) VALUES
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'ADMIN',        'Platform Admin',    '+91-9000000001', 'admin@petz.dev',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'NGO_REP',      'Nandita Krishnan',  '+91-9000000002', 'nandita@cupa.org.in',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000003','-','')),
   'NGO_REP',      'Geeta Seshamani',   '+91-9000000003', 'geeta@friendicoes.org',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   'NGO_REP',      'Rahul Sinha',       '+91-9000000004', 'rahul@bspca.org.in',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   'NGO_REP',      'Priya Menon',       '+91-9000000005', 'priya@pfa.org.in',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('a0000000-0000-0000-0000-000000000003','-','')),
   'HOSPITAL_REP', 'Hospital Rep Demo', '+919000010003',  'hospital@petz.dev',
   @petz_pwd, 1, 1, 1, 0, 0, NOW());
 
-- Re-assert known-good password + activation flags for every demo account.
-- Lets a teammate log in with Petz@1234 even after a wrong-password lockout.
UPDATE users
SET password             = @petz_pwd,
    active               = 1,
    email_verified       = 1,
    phone_verified       = 1,
    failed_login_attempts = 0,
    locked_until         = NULL
WHERE email IN (
    'admin@petz.dev',
    'nandita@cupa.org.in',
    'geeta@friendicoes.org',
    'rahul@bspca.org.in',
    'priya@pfa.org.in',
    'hospital@petz.dev',
    -- legacy / teammate test accounts (kept for backward compatibility)
    'ngo@petz.dev',
    'owner@petz.test',
    'john@test.com'
);
 
-- ── Backfill is_locked on legacy slot rows ──
-- Appointment.isLocked is a primitive `boolean` in the entity; rows where
-- is_locked is NULL throw JpaSystemException on read ("Null value was
-- assigned to a property of primitive type"). Earlier SQL seeds (this file's
-- original lines plus older migrations) didn't set the column, so any read
-- of an AVAILABLE slot for those dates 500'd. Idempotent — only touches NULLs.
UPDATE appointments SET is_locked = 0 WHERE is_locked IS NULL;
 
-- ── 4-hour shift slots × 12 days per doctor (96 slots/doctor, 768 total) ──
-- Each active doctor gets 8 × 30-minute AVAILABLE slots on each of 12
-- pre-chosen day-offsets in the next 30 days. Half the doctors run a 09:00
-- morning shift (deterministic from the doctor's UUID), the other half
-- a 14:00 afternoon shift — gives the booking-page calendar a varied feel.
-- Slot IDs are derived from MD5(doctor_id || day_offset || slot_idx) so the
-- block is fully idempotent: re-runs INSERT IGNORE the same rows.
INSERT IGNORE INTO appointments (
    id, hospital_id, doctor_id, appointment_date, appointment_time, end_time,
    duration_minutes, slot_status, booking_type, version, created_at, updated_at,
    is_locked, no_show_count, cancellation_policy_hours
)
SELECT
    UNHEX(MD5(CONCAT(HEX(d.id), '-', LPAD(days.n, 2, '0'), '-', slots.n))),
    d.hospital_id,
    d.id,
    DATE_ADD(CURDATE(), INTERVAL days.n DAY),
    SEC_TO_TIME(
        IF(MOD(ASCII(SUBSTRING(HEX(d.id), 1, 1)), 2) = 0, 9, 14) * 3600
        + slots.n * 1800
    ),
    SEC_TO_TIME(
        IF(MOD(ASCII(SUBSTRING(HEX(d.id), 1, 1)), 2) = 0, 9, 14) * 3600
        + (slots.n + 1) * 1800
    ),
    30, 'AVAILABLE', 'ROUTINE', 0, NOW(), NOW(),
    0, 0, 24
FROM doctors d
CROSS JOIN (
    SELECT 1  AS n UNION ALL SELECT 3  UNION ALL SELECT 5  UNION ALL SELECT 7
    UNION ALL SELECT 9  UNION ALL SELECT 11 UNION ALL SELECT 14 UNION ALL SELECT 17
    UNION ALL SELECT 20 UNION ALL SELECT 23 UNION ALL SELECT 26 UNION ALL SELECT 29
) AS days
CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
) AS slots
WHERE d.is_active = 1;

-- ═════════════════════════════════════════════════════════════════════════════
-- ADOPTION MODULE SEED  (safe to re-run — INSERT IGNORE + deterministic UUIDs)
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Bind NGO reps to their NGOs ──────────────────────────────────────────────
-- Without ngo_id set on the user row, the NGO adoption review page always
-- returns an empty list (every query is scoped to the reviewer's ngo_id).
-- Maps the data.sql demo NGO_REP accounts to the three data.sql NGOs.
UPDATE users SET ngo_id = UUID_TO_BIN('11110000-0000-0000-0000-000000000001')
WHERE email IN ('nandita@cupa.org.in', 'geeta@friendicoes.org');

UPDATE users SET ngo_id = UUID_TO_BIN('11110000-0000-0000-0000-000000000002')
WHERE email = 'rahul@bspca.org.in';

UPDATE users SET ngo_id = UUID_TO_BIN('11110000-0000-0000-0000-000000000003')
WHERE email = 'priya@pfa.org.in';

-- ── Sample adoption applications (one per status variant) ───────────────────
-- version=0 is required — AdoptionApplication uses @Version optimistic locking.
-- A NULL version causes OptimisticLockException on every approve/clarify/reject.
INSERT IGNORE INTO adoption_applications
  (id, adopter_id, adoptable_pet_id, ngo_id,
   status, current_step,
   full_name, phone, email, address_line, city, pincode,
   housing_type, has_yard, other_pets_count, work_schedule_hours,
   prev_pet_ownership, prev_pet_details, vet_support,
   consent_home_visit, consent_follow_up, consent_background_check,
   clarification_questions, decision_reason,
   created_at, updated_at, last_activity_at, submitted_at, decided_at, version)
VALUES

-- 1. SUBMITTED — shows in NGO 1 Pending tab (nandita / geeta)
(UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('bbbb0000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000001'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'SUBMITTED', 'REVIEW',
 'Arjun Verma', '+91-9000000006', 'arjun.verma@gmail.com',
 '12, Park Street', 'Mumbai', '400001',
 'APARTMENT', 0, 0, 8,
 1, 'Had a Labrador growing up', 1,
 1, 1, 1,
 NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 0),

-- 2. UNDER_REVIEW — shows in NGO 1 Under Review tab
(UUID_TO_BIN('dd000000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('bbbb0000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000002'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'UNDER_REVIEW', 'REVIEW',
 'Sneha Iyer', '+91-9000000007', 'sneha.iyer@gmail.com',
 '5, Linking Road', 'Mumbai', '400050',
 'HOUSE', 1, 1, 6,
 1, 'Owned cats for 5 years', 1,
 1, 1, 1,
 NULL, NULL,
 DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 7 DAY), NULL, 0),

-- 3. CLARIFICATION_REQUESTED — shows in NGO 2 Clarification tab (rahul)
(UUID_TO_BIN('dd000000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('bbbb0000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000003'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
 'CLARIFICATION_REQUESTED', 'REVIEW',
 'Arjun Verma', '+91-9000000006', 'arjun.verma@gmail.com',
 '12, Park Street', 'Delhi', '110001',
 'APARTMENT', 0, 0, 8,
 1, 'Had a German Shepherd before', 1,
 1, 1, 1,
 'Please describe your daily schedule and how the dog will be cared for during work hours.', NULL,
 DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, 0),

-- 4. APPROVED — shows in NGO 1 Approved tab
(UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'),
 UUID_TO_BIN('bbbb0000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000007'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
 'APPROVED', 'REVIEW',
 'Sneha Iyer', '+91-9000000007', 'sneha.iyer@gmail.com',
 '5, Linking Road', 'Mumbai', '400050',
 'HOUSE', 1, 0, 7,
 1, 'Golden Retriever owner for 3 years', 1,
 1, 1, 1,
 NULL, 'Application approved after home visit. Excellent match for Bella.',
 DATE_SUB(NOW(), INTERVAL 14 DAY), NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 0),

-- 5. REJECTED — shows in NGO 3 Rejected tab (priya)
(UUID_TO_BIN('dd000000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('bbbb0000-0000-0000-0000-000000000006'),
 UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
 UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
 'REJECTED', 'REVIEW',
 'Arjun Verma', '+91-9000000006', 'arjun.verma@gmail.com',
 '12, Park Street', 'Bangalore', '560001',
 'APARTMENT', 0, 0, 10,
 0, NULL, 0,
 1, 1, 1,
 NULL, 'Applicant works 10+ hours daily with no support for the pet during the day.',
 DATE_SUB(NOW(), INTERVAL 10 DAY), NOW(), NOW(), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 0);

-- Fix any existing rows that were inserted without version (NULL breaks optimistic locking)
UPDATE adoption_applications SET version = 0 WHERE version IS NULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- SESSION 2026-05-05 — Full-stack seed: reporter users, NGO details, hospital
--   pets, appointments, medical records, completed adoption, follow-ups, KYC,
--   adoption media, SOS/rescue chain, and notifications.
-- All INSERT IGNORE + deterministic UNHEX UUIDs → safe to re-run on restart.
-- ═════════════════════════════════════════════════════════════════════════════

SET @petz_pwd = '$2a$10$FRaElkIfKSxPqegRndfQL.MDfm5EZQgb00X0uhym9pyuxzPEn6CWK';

-- ── Reporter (REPORTER) users ─────────────────────────────────────────────────
-- bbbb0000-...006 & ...007 are already FK-referenced by adoption_applications
-- but were never inserted as user rows — add them + two extra reporters.
INSERT IGNORE INTO users (
    id, role, full_name, phone, email, password,
    active, email_verified, phone_verified, is_temporary,
    failed_login_attempts, created_at
) VALUES
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   'REPORTER', 'Arjun Verma',  '+91-9000000006', 'arjun.verma@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),

  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   'REPORTER', 'Sneha Iyer',   '+91-9000000007', 'sneha.iyer@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),

  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   'REPORTER', 'Karan Shah',   '+91-9000000008', 'karan.shah@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),

  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   'REPORTER', 'Divya Nair',   '+91-9000000009', 'divya.nair@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW());

-- Re-assert credentials for all reporter demo accounts
UPDATE users
SET password = @petz_pwd, active = 1, email_verified = 1,
    phone_verified = 1, failed_login_attempts = 0, locked_until = NULL
WHERE email IN (
    'arjun.verma@gmail.com', 'sneha.iyer@gmail.com',
    'karan.shah@gmail.com',  'divya.nair@gmail.com'
);

-- ── Enrich NGO rows ───────────────────────────────────────────────────────────
-- Original INSERT only set id/name/lat/lon/active.
-- Fill contact, verification, owner, and description columns the UI reads.
UPDATE ngo SET
    is_verified         = 1,
    owner_user_id       = UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
    contact_email       = 'contact@happypaws.org',
    contact_phone       = '+91-9100000001',
    address             = '14, Andheri West, Mumbai, MH 400058',
    registration_number = 'MH-NGO-2018-00145',
    description         = 'Happy Paws rescues, rehabilitates, and rehomes stray and abandoned animals across Mumbai.',
    created_at          = COALESCE(created_at, NOW())
WHERE id = UUID_TO_BIN('11110000-0000-0000-0000-000000000001');

UPDATE ngo SET
    is_verified         = 1,
    owner_user_id       = UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
    contact_email       = 'info@animalcaretrust.org',
    contact_phone       = '+91-9100000002',
    address             = '7, Hauz Khas Village, New Delhi, DL 110016',
    registration_number = 'DL-NGO-2015-00089',
    description         = 'Animal Care Trust provides shelter, medical care, and adoption services for animals in Delhi NCR.',
    created_at          = COALESCE(created_at, NOW())
WHERE id = UUID_TO_BIN('11110000-0000-0000-0000-000000000002');

UPDATE ngo SET
    is_verified         = 1,
    owner_user_id       = UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
    contact_email       = 'hello@pawsandlove.org',
    contact_phone       = '+91-9100000003',
    address             = '32, Koramangala 1st Block, Bangalore, KA 560034',
    registration_number = 'KA-NGO-2019-00321',
    description         = 'Paws & Love Foundation champions pet welfare through adoption, education, and community rescue in Bangalore.',
    created_at          = COALESCE(created_at, NOW())
WHERE id = UUID_TO_BIN('11110000-0000-0000-0000-000000000003');

-- ── Hospital-module pets (owned by reporter users, used for booking) ──────────
INSERT IGNORE INTO pets (id, user_id, name, species, breed, date_of_birth, created_at) VALUES
  (UNHEX(REPLACE('pet00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   'Max',     'DOG',  'Labrador',    '2022-06-15', NOW()),

  (UNHEX(REPLACE('pet00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   'Mittens', 'CAT',  'Persian',     '2021-11-20', NOW()),

  (UNHEX(REPLACE('pet00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   'Bruno',   'DOG',  'Beagle',      '2023-03-10', NOW()),

  (UNHEX(REPLACE('pet00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   'Snowy',   'BIRD', 'Budgerigar',  '2023-08-05', NOW());

-- ── Appointments: one upcoming CONFIRMED + one past COMPLETED ─────────────────
INSERT IGNORE INTO appointments (
    id, hospital_id, doctor_id, pet_id, user_id,
    appointment_date, appointment_time, end_time,
    duration_minutes, status, slot_status, booking_type, service_type,
    version, is_locked, no_show_count, cancellation_policy_hours,
    created_at, updated_at
) VALUES
  -- Arjun's Max at PetCare — Dr. Anita Sharma — upcoming CONFIRMED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', '11:30:00',
   30, 'CONFIRMED', 'BOOKED', 'ROUTINE', 'CONSULTATION',
   0, 0, 0, 24, NOW(), NOW()),

  -- Sneha's Mittens at Paws & Claws — Dr. Priya Nair — past COMPLETED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:00:00', '10:30:00',
   30, 'COMPLETED', 'BOOKED', 'ROUTINE', 'CONSULTATION',
   0, 0, 0, 24,
   DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

  -- Karan's Bruno at Delhi Pet Hospital — Dr. Suresh Kumar — past CANCELLED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000004'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   DATE_SUB(CURDATE(), INTERVAL 8 DAY), '10:00:00', '10:30:00',
   30, 'CANCELLED', 'BOOKED', 'ROUTINE', 'VACCINATION',
   0, 0, 0, 24,
   DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- ── Medical record for the completed appointment ──────────────────────────────
INSERT IGNORE INTO medical_records (
    id, pet_id, appointment_id, diagnosis, treatment, next_visit_date, created_at
) VALUES
  (UNHEX(REPLACE('medr0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('appt0000-0000-0000-0000-000000000002','-','')),
   'Mild upper respiratory infection',
   'Doxycycline 50 mg once daily for 7 days. Keep warm and well-hydrated. Recheck in 2 weeks.',
   DATE_ADD(CURDATE(), INTERVAL 14 DAY),
   DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ── Adoptable-pet photos (one primary image per pet) ─────────────────────────
INSERT IGNORE INTO adoption_media (
    id, adoptable_pet_id, file_url, file_name,
    media_type, display_order, is_primary, uploaded_at
) VALUES
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000001'),
   'https://images.petz.dev/pets/buddy-lab.jpg',       'buddy-lab.jpg',       'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000002'),
   'https://images.petz.dev/pets/luna-persian.jpg',    'luna-persian.jpg',    'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000003'),
   'https://images.petz.dev/pets/rocky-gsd.jpg',       'rocky-gsd.jpg',       'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000004'),
   'https://images.petz.dev/pets/milo-beagle.jpg',     'milo-beagle.jpg',     'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
   'https://images.petz.dev/pets/whiskers-tabby.jpg',  'whiskers-tabby.jpg',  'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000006','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000006'),
   'https://images.petz.dev/pets/charlie-indie.jpg',   'charlie-indie.jpg',   'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000007','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000007'),
   'https://images.petz.dev/pets/bella-golden.jpg',    'bella-golden.jpg',    'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000008','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000008'),
   'https://images.petz.dev/pets/oliver-siamese.jpg',  'oliver-siamese.jpg',  'IMAGE', 1, 1, NOW());

-- ── KYC documents ─────────────────────────────────────────────────────────────
-- APPROVED application (dd-004, Sneha adopting Bella): both docs VERIFIED.
-- SUBMITTED application (dd-001, Arjun for Buddy): docs uploaded, PENDING review.
INSERT IGNORE INTO kyc_documents (
    id, application_id, doc_type, file_url, file_name,
    verification_status, uploaded_at
) VALUES
  (UNHEX(REPLACE('kycd0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'),
   'ID_PROOF',
   'https://storage.petz.dev/kyc/sneha-aadhar.jpg',      'sneha_aadhar.jpg',
   'VERIFIED', DATE_SUB(NOW(), INTERVAL 12 DAY)),

  (UNHEX(REPLACE('kycd0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'),
   'ADDRESS_PROOF',
   'https://storage.petz.dev/kyc/sneha-utility-bill.jpg','sneha_utility_bill.jpg',
   'VERIFIED', DATE_SUB(NOW(), INTERVAL 12 DAY)),

  (UNHEX(REPLACE('kycd0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'),
   'ID_PROOF',
   'https://storage.petz.dev/kyc/arjun-pan.jpg',         'arjun_pan.jpg',
   'PENDING', DATE_SUB(NOW(), INTERVAL 3 DAY)),

  (UNHEX(REPLACE('kycd0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'),
   'ADDRESS_PROOF',
   'https://storage.petz.dev/kyc/arjun-electricity.jpg', 'arjun_electricity_bill.jpg',
   'PENDING', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ── Finalized adoption ────────────────────────────────────────────────────────
-- Matches the APPROVED application (dd-004): Sneha adopting Bella from NGO 1.
-- Bella's adoptable_pet status flipped to ON_HOLD when approved.
INSERT IGNORE INTO adoptions (
    id, application_id, adopter_id, ngo_id, adoptable_pet_id,
    status, handover_date, handover_location,
    finalized_at, created_at, version
) VALUES
  (UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000007'),
   'COMPLETED',
   DATE_SUB(CURDATE(), INTERVAL 2 DAY),
   'Happy Paws NGO Centre, Andheri West, Mumbai',
   DATE_SUB(NOW(), INTERVAL 2 DAY),
   DATE_SUB(NOW(), INTERVAL 2 DAY),
   0);

-- Reflect Bella's status in the adoptable_pets table
UPDATE adoptable_pets
SET status = 'ADOPTED', updated_at = DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE id = UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000007');

-- ── Adoption follow-ups (3 auto-created per adoption) ────────────────────────
INSERT IGNORE INTO adoption_follow_ups (
    id, adoption_id, follow_up_type, due_date, status,
    notes, concern_flag, created_at
) VALUES
  -- DAY_7 — completed, no concerns
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   'DAY_7',
   DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 DAY), INTERVAL 7 DAY),
   'COMPLETED',
   'Bella has settled in well. Eating regularly and bonding with the family. No concerns.',
   0, DATE_SUB(NOW(), INTERVAL 2 DAY)),

  -- DAY_30 — upcoming, still scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   'DAY_30',
   DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 DAY), INTERVAL 30 DAY),
   'SCHEDULED',
   NULL, 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),

  -- DAY_90 — far future, still scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   'DAY_90',
   DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 2 DAY), INTERVAL 90 DAY),
   'SCHEDULED',
   NULL, 0, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── SOS reports ───────────────────────────────────────────────────────────────
INSERT IGNORE INTO sos_reports (
    id, reporter_id, latitude, longitude,
    urgency_level, current_status, description, reported_at
) VALUES
  -- SOS 1: fully resolved mission (COMPLETE)
  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   19.0825, 72.8905,
   'MODERATE', 'COMPLETE',
   'Injured stray dog near Andheri station, limping and bleeding on left hind leg.',
   DATE_SUB(NOW(), INTERVAL 2 DAY)),

  -- SOS 2: mission dispatched, en route (DISPATCHED)
  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   12.9715, 77.5946,
   'CRITICAL', 'DISPATCHED',
   'Cat struck by vehicle on Koramangala road. Visible injuries, needs immediate help.',
   DATE_SUB(NOW(), INTERVAL 3 HOUR)),

  -- SOS 3: just filed, awaiting assignment (REPORTED)
  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   28.6358, 77.2144,
   'LOW', 'REPORTED',
   'Small bird with broken wing near Connaught Place. Calm but cannot fly.',
   DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- ── Status logs (audit trail per SOS report) ──────────────────────────────────
INSERT IGNORE INTO status_logs (id, sos_report_id, status, updated_at) VALUES
  -- SOS 1 full lifecycle
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'REPORTED',    DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'ASSIGNED',    DATE_SUB(NOW(), INTERVAL 47 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'DISPATCHED',  DATE_SUB(NOW(), INTERVAL 46 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'ON_SITE',     DATE_SUB(NOW(), INTERVAL 45 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'TRANSPORTING',DATE_SUB(NOW(), INTERVAL 44 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'COMPLETE',    DATE_SUB(NOW(), INTERVAL 43 HOUR)),
  -- SOS 2 in-progress
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'REPORTED',    DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000008','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'ASSIGNED',    DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000009','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'DISPATCHED',  DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
  -- SOS 3 just filed
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000010','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')), 'REPORTED',    DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- ── Rescue missions ───────────────────────────────────────────────────────────
INSERT IGNORE INTO rescue_missions (
    id, sos_report_id, assigned_ngo_user_id, assigned_ngo_id,
    rescue_status, eta_minutes, sos_lat, sos_lon, severity_level, ngo_status,
    accepted_at, dispatched_at, on_site_at, transporting_at, completed_at,
    created_at, updated_at
) VALUES
  -- Mission 1: MISSION_COMPLETE (nandita from NGO 1 completed the rescue)
  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
   'MISSION_COMPLETE', 15, 19.0825, 72.8905, 2, 'COMPLETED',
   DATE_SUB(NOW(), INTERVAL 47 HOUR),
   DATE_SUB(NOW(), INTERVAL 46 HOUR),
   DATE_SUB(NOW(), INTERVAL 45 HOUR),
   DATE_SUB(NOW(), INTERVAL 44 HOUR),
   DATE_SUB(NOW(), INTERVAL 43 HOUR),
   DATE_SUB(NOW(), INTERVAL 2 DAY),
   DATE_SUB(NOW(), INTERVAL 43 HOUR)),

  -- Mission 2: DISPATCHED (priya from NGO 3 en route)
  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   'DISPATCHED', 20, 12.9715, 77.5946, 3, 'ACTIVE',
   DATE_SUB(NOW(), INTERVAL 2 HOUR),
   DATE_SUB(NOW(), INTERVAL 90 MINUTE),
   NULL, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 3 HOUR),
   DATE_SUB(NOW(), INTERVAL 90 MINUTE));

-- ── NGO assignments ───────────────────────────────────────────────────────────
INSERT IGNORE INTO ngo_assignments (
    id, sos_report_id, ngo_id, volunteer_id,
    assigned_at, accepted_at, arrival_at, assignment_status
) VALUES
  -- SOS 1 assignment — ARRIVED (mission complete)
  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000001'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   DATE_SUB(NOW(), INTERVAL 47 HOUR),
   DATE_SUB(NOW(), INTERVAL 47 HOUR),
   DATE_SUB(NOW(), INTERVAL 45 HOUR),
   'ARRIVED'),

  -- SOS 2 assignment — ACCEPTED, still en route
  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   DATE_SUB(NOW(), INTERVAL 2 HOUR),
   DATE_SUB(NOW(), INTERVAL 2 HOUR),
   NULL,
   'ACCEPTED');

-- ── On-site assessments ───────────────────────────────────────────────────────
INSERT IGNORE INTO on_site_assessments (
    id, sos_report_id, volunteer_id,
    animal_condition, injury_description,
    decision, decision_justification, assessed_at
) VALUES
  (UNHEX(REPLACE('osa00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'INJURED',
   'Laceration on left hind leg (~4 cm). No apparent fracture. Animal is alert and responsive.',
   'TRANSPORT_TO_HOSPITAL',
   'Wound requires professional cleaning and suturing. Transported to PetCare Animal Hospital.',
   DATE_SUB(NOW(), INTERVAL 45 HOUR));

-- ── Mission summaries ─────────────────────────────────────────────────────────
INSERT IGNORE INTO mission_summaries (
    id, rescue_mission_id, outcome, timeline, notes, submitted_by, submitted_at
) VALUES
  (UNHEX(REPLACE('msm00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000001','-','')),
   'Dog rescued and transported to PetCare Animal Hospital. Wound sutured. Prognosis good.',
   'Reported -> Assigned (13 min) -> On-site (60 min) -> Transport (45 min) -> Complete',
   'Animal was cooperative. First aid applied on-site before transport.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   DATE_SUB(NOW(), INTERVAL 43 HOUR));

-- ── Case verifications ────────────────────────────────────────────────────────
INSERT IGNORE INTO case_verifications (
    id, rescue_mission_id, verified_by,
    flagged, flag_notes, audit_notes, closed_at
) VALUES
  (UNHEX(REPLACE('csv00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   0, NULL,
   'Mission executed within SLA. Response time 13 min (target <= 20 min). All documentation complete.',
   DATE_SUB(NOW(), INTERVAL 40 HOUR));

-- ── Notifications ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO notifications (
    id, user_id, type, title, body,
    reference_id, reference_type, is_read, created_at
) VALUES
  -- Arjun: application submitted confirmation
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   'ADOPTION_APPLICATION', 'Application Submitted',
   'Your adoption application for Buddy has been submitted and is under review by Happy Paws NGO.',
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'), 'APPLICATION',
   0, DATE_SUB(NOW(), INTERVAL 3 DAY)),

  -- Sneha: application approved
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   'ADOPTION_DECISION', 'Application Approved',
   'Your application to adopt Bella has been approved. Handover is scheduled — congratulations!',
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'), 'APPLICATION',
   1, DATE_SUB(NOW(), INTERVAL 2 DAY)),

  -- Sneha: 7-day follow-up reminder
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   'ADOPTION_FOLLOW_UP', '7-Day Follow-up Due',
   'It has been 7 days since Bella joined your home. Please complete the follow-up check-in.',
   UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000001','-','')), 'FOLLOW_UP',
   1, DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 7 DAY)),

  -- Arjun: SOS report received
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   'SOS_ALERT', 'SOS Report Received',
   'Your SOS report has been received. An NGO volunteer is being assigned.',
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')), 'SOS_REPORT',
   0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),

  -- Nandita (NGO rep): new adoption application in queue
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'ADOPTION_APPLICATION', 'New Adoption Application',
   'A new application for Buddy has been submitted. Please review at your earliest convenience.',
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'), 'APPLICATION',
   0, DATE_SUB(NOW(), INTERVAL 3 DAY)),

  -- Karan: SOS mission resolved
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   'RESCUE_UPDATE', 'Rescue Mission Resolved',
   'Your SOS report has been resolved. The animal has been transported to PetCare Animal Hospital.',
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')), 'SOS_REPORT',
   1, DATE_SUB(NOW(), INTERVAL 43 HOUR)),

  -- Admin: system audit notification
  (UNHEX(REPLACE('notf0000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'SYSTEM', 'Weekly Digest Ready',
   '3 adoption applications pending review. 1 rescue mission active. 0 disputes open.',
   NULL, NULL,
   0, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ═════════════════════════════════════════════════════════════════════════════
-- SESSION 2026-05-05 TOP-UP — bring every table to ≥ 5 rows
-- Tables topped up: ngo(+2), pets(+1), adoption_applications(+4),
--   adoptions(+4), adoption_follow_ups(+12), kyc_documents(+1),
--   medical_records(+4), appointments(+4), sos_reports(+4), status_logs(+14),
--   rescue_missions(+3), ngo_assignments(+3), on_site_assessments(+4),
--   mission_summaries(+4), case_verifications(+4), adoption_media(+4),
--   sos_media(+5), blackout_dates(+5), hospital_audit_logs(+5),
--   adoption_audit_logs(+5), adoption_disputes(+5)
-- ═════════════════════════════════════════════════════════════════════════════

SET @petz_pwd = '$2a$10$FRaElkIfKSxPqegRndfQL.MDfm5EZQgb00X0uhym9pyuxzPEn6CWK';

-- ── 4 new users: 2 NGO reps + 2 reporters ────────────────────────────────────
INSERT IGNORE INTO users (
    id, role, full_name, phone, email, password,
    active, email_verified, phone_verified, is_temporary,
    failed_login_attempts, created_at
) VALUES
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   'NGO_REP',  'Aryan Kapoor',   '+91-9200000010', 'aryan@furever.org',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   'NGO_REP',  'Fatima Sheikh',  '+91-9200000011', 'fatima@animalaid.org',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   'REPORTER', 'Raj Kumar',      '+91-9200000012', 'raj.kumar@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000d','-','')),
   'REPORTER', 'Meera Singh',    '+91-9200000013', 'meera.singh@gmail.com',
   @petz_pwd, 1, 1, 1, 0, 0, NOW());

-- ── 2 new NGOs (total 5) ──────────────────────────────────────────────────────
INSERT IGNORE INTO ngo (
    id, name, latitude, longitude, active,
    is_verified, owner_user_id,
    contact_email, contact_phone, address,
    registration_number, description, created_at
) VALUES
  (UUID_TO_BIN('11110000-0000-0000-0000-000000000004'),
   'Furever Friends Animal Rescue', 18.5204, 73.8567, 1, 1,
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   'hello@furever.org', '+91-9200000010',
   '22, Aundh Road, Pune, MH 411007',
   'MH-NGO-2020-00412',
   'Furever Friends rescues abandoned and abused animals across Pune and surrounding districts.',
   NOW()),
  (UUID_TO_BIN('11110000-0000-0000-0000-000000000005'),
   'Animal Aid India', 17.3850, 78.4867, 1, 1,
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   'care@animalaid.org', '+91-9200000011',
   '45, Banjara Hills Road No. 12, Hyderabad, TS 500034',
   'TS-NGO-2017-00203',
   'Animal Aid India runs Hyderabad''s largest stray animal welfare program with 24/7 rescue services.',
   NOW());

-- Bind new NGO reps to their NGOs
UPDATE users SET ngo_id = UUID_TO_BIN('11110000-0000-0000-0000-000000000004')
WHERE email = 'aryan@furever.org';
UPDATE users SET ngo_id = UUID_TO_BIN('11110000-0000-0000-0000-000000000005')
WHERE email = 'fatima@animalaid.org';

-- ── 4 new adoptable pets for new NGOs ────────────────────────────────────────
INSERT IGNORE INTO adoptable_pets
  (id, ngo_id, name, species, breed, gender, age_months,
   location_city, description, temperament,
   medical_summary, vaccination_status,
   special_needs, special_needs_notes,
   is_adoption_ready, status, created_at, updated_at, version)
VALUES
  (UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000009'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000004'),
   'Tiger','CAT','Tabby Mix','MALE',9,
   'Pune','Tiger is a bold, playful tomcat who loves chasing toys and climbing.',
   'Bold, energetic, curious',
   'Neutered, vaccinated, FIV negative','FULLY_VACCINATED',
   0,NULL,1,'LISTED',NOW(),NOW(),0),

  (UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000010'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000004'),
   'Rex','DOG','Rottweiler Mix','MALE',28,
   'Pune','Rex is a gentle giant rescued from the streets. Excellent with older children.',
   'Calm, loyal, protective',
   'Vaccinated, neutered, healthy joints','FULLY_VACCINATED',
   0,NULL,1,'LISTED',NOW(),NOW(),0),

  (UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000011'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000005'),
   'Coco','DOG','Cocker Spaniel','FEMALE',14,
   'Hyderabad','Coco is a cheerful Cocker Spaniel who adores cuddles and long walks.',
   'Cheerful, affectionate, social',
   'Spayed, vaccinated, good health','FULLY_VACCINATED',
   0,NULL,1,'LISTED',NOW(),NOW(),0),

  (UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000012'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000005'),
   'Daisy','CAT','Domestic Shorthair','FEMALE',6,
   'Hyderabad','Daisy is a tiny kitten with big eyes and an even bigger personality.',
   'Playful, curious, loves humans',
   'Vaccinated, spayed, healthy','PARTIALLY_VACCINATED',
   0,NULL,0,'LISTED',NOW(),NOW(),0);

-- Photos for the 4 new pets
INSERT IGNORE INTO adoption_media (
    id, adoptable_pet_id, file_url, file_name,
    media_type, display_order, is_primary, uploaded_at
) VALUES
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000009','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000009'),
   'https://images.petz.dev/pets/tiger-tabby.jpg',   'tiger-tabby.jpg',   'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000010','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000010'),
   'https://images.petz.dev/pets/rex-rott.jpg',      'rex-rott.jpg',      'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000011','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000011'),
   'https://images.petz.dev/pets/coco-spaniel.jpg',  'coco-spaniel.jpg',  'IMAGE', 1, 1, NOW()),
  (UNHEX(REPLACE('amda0000-0000-0000-0000-000000000012','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000012'),
   'https://images.petz.dev/pets/daisy-kitten.jpg',  'daisy-kitten.jpg',  'IMAGE', 1, 1, NOW());

-- ── 1 new hospital pet (total 5) ──────────────────────────────────────────────
INSERT IGNORE INTO pets (id, user_id, name, species, breed, date_of_birth, created_at) VALUES
  (UNHEX(REPLACE('pet00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   'Leo', 'DOG', 'Golden Retriever', '2021-04-22', NOW());

-- ── 4 new APPROVED adoption applications (total 9) ───────────────────────────
INSERT IGNORE INTO adoption_applications
  (id, adopter_id, adoptable_pet_id, ngo_id,
   status, current_step,
   full_name, phone, email, address_line, city, pincode,
   housing_type, has_yard, other_pets_count, work_schedule_hours,
   prev_pet_ownership, prev_pet_details, vet_support,
   consent_home_visit, consent_follow_up, consent_background_check,
   clarification_questions, decision_reason,
   created_at, updated_at, last_activity_at, submitted_at, decided_at, version)
VALUES
  -- Karan + Milo (NGO 2)
  (UUID_TO_BIN('dd000000-0000-0000-0000-000000000006'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000004'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   'APPROVED','REVIEW',
   'Karan Shah','+91-9000000008','karan.shah@gmail.com',
   '7, Vasant Vihar','Delhi','110057',
   'HOUSE',1,0,7,
   1,'Grew up with a Beagle','Yes, Dr. Suri at Delhi Pet Hospital',
   1,1,1,NULL,'Great home for Milo. Large yard and prior small-breed experience.',
   DATE_SUB(NOW(),INTERVAL 13 DAY),NOW(),NOW(),DATE_SUB(NOW(),INTERVAL 13 DAY),DATE_SUB(NOW(),INTERVAL 10 DAY),0),

  -- Divya + Whiskers (NGO 3)
  (UUID_TO_BIN('dd000000-0000-0000-0000-000000000007'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   'APPROVED','REVIEW',
   'Divya Nair','+91-9000000009','divya.nair@gmail.com',
   '3, Whitefield Main Road','Bangalore','560066',
   'APARTMENT',0,0,6,
   1,'Cat owner for 4 years','Yes, Green Leaf Animal Clinic nearby',
   1,1,1,NULL,'Excellent candidate. Cat-experienced, calm apartment environment.',
   DATE_SUB(NOW(),INTERVAL 15 DAY),NOW(),NOW(),DATE_SUB(NOW(),INTERVAL 15 DAY),DATE_SUB(NOW(),INTERVAL 12 DAY),0),

  -- Raj + Oliver (NGO 2)
  (UUID_TO_BIN('dd000000-0000-0000-0000-000000000008'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000008'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   'APPROVED','REVIEW',
   'Raj Kumar','+91-9200000012','raj.kumar@gmail.com',
   '18, Sector 15, Dwarka','Delhi','110078',
   'HOUSE',1,1,8,
   1,'Siamese cat for 6 years — very experienced','Yes, registered vet at Delhi Pet Hospital',
   1,1,1,NULL,'Experienced Siamese owner with ideal setup for Oliver.',
   DATE_SUB(NOW(),INTERVAL 8 DAY),NOW(),NOW(),DATE_SUB(NOW(),INTERVAL 8 DAY),DATE_SUB(NOW(),INTERVAL 5 DAY),0),

  -- Meera + Charlie (NGO 3)
  (UUID_TO_BIN('dd000000-0000-0000-0000-000000000009'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000d','-','')),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000006'),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   'APPROVED','REVIEW',
   'Meera Singh','+91-9200000013','meera.singh@gmail.com',
   '9, JP Nagar 3rd Phase','Bangalore','560078',
   'HOUSE',1,0,5,
   1,'Rescued Indie dog for 3 years — ideal match','Yes, Bangalore Emergency Pet Care is nearby',
   1,1,1,NULL,'Meera has experience with street dogs. Charlie will thrive here.',
   DATE_SUB(NOW(),INTERVAL 23 DAY),NOW(),NOW(),DATE_SUB(NOW(),INTERVAL 23 DAY),DATE_SUB(NOW(),INTERVAL 20 DAY),0);

-- ── 4 more completed adoptions (total 5) ─────────────────────────────────────
INSERT IGNORE INTO adoptions (
    id, application_id, adopter_id, ngo_id, adoptable_pet_id,
    status, handover_date, handover_location,
    finalized_at, created_at, version
) VALUES
  (UNHEX(REPLACE('adon0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000006'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000004'),
   'COMPLETED', DATE_SUB(CURDATE(),INTERVAL 10 DAY),
   'Animal Care Trust Centre, Hauz Khas, Delhi',
   DATE_SUB(NOW(),INTERVAL 10 DAY), DATE_SUB(NOW(),INTERVAL 10 DAY), 0),

  (UNHEX(REPLACE('adon0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000007'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
   'COMPLETED', DATE_SUB(CURDATE(),INTERVAL 12 DAY),
   'Paws & Love Foundation, Koramangala, Bangalore',
   DATE_SUB(NOW(),INTERVAL 12 DAY), DATE_SUB(NOW(),INTERVAL 12 DAY), 0),

  (UNHEX(REPLACE('adon0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000008'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000008'),
   'COMPLETED', DATE_SUB(CURDATE(),INTERVAL 5 DAY),
   'Animal Care Trust Centre, Hauz Khas, Delhi',
   DATE_SUB(NOW(),INTERVAL 5 DAY), DATE_SUB(NOW(),INTERVAL 5 DAY), 0),

  (UNHEX(REPLACE('adon0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000009'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000d','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000006'),
   'COMPLETED', DATE_SUB(CURDATE(),INTERVAL 20 DAY),
   'Paws & Love Foundation, Koramangala, Bangalore',
   DATE_SUB(NOW(),INTERVAL 20 DAY), DATE_SUB(NOW(),INTERVAL 20 DAY), 0);

-- Mark adopted pets' status
UPDATE adoptable_pets SET status='ADOPTED', updated_at=NOW()
WHERE id IN (
    UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000004'),
    UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000005'),
    UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000008'),
    UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000006')
);

-- ── 12 follow-ups for the 4 new adoptions (total 15) ─────────────────────────
INSERT IGNORE INTO adoption_follow_ups (
    id, adoption_id, follow_up_type, due_date, status, notes, concern_flag, created_at
) VALUES
  -- Adoption 2 (Karan+Milo, 10 days ago): DAY_7 completed, rest scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000002','-','')),
   'DAY_7',  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 10 DAY),INTERVAL 7 DAY),
   'COMPLETED','Milo is energetic and eating well. Karan reports no issues.',0,DATE_SUB(NOW(),INTERVAL 10 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000002','-','')),
   'DAY_30', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 10 DAY),INTERVAL 30 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 10 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000002','-','')),
   'DAY_90', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 10 DAY),INTERVAL 90 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 10 DAY)),

  -- Adoption 3 (Divya+Whiskers, 12 days ago): DAY_7 completed, rest scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000003','-','')),
   'DAY_7',  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 12 DAY),INTERVAL 7 DAY),
   'COMPLETED','Whiskers has bonded with Divya. Eating and playing normally.',0,DATE_SUB(NOW(),INTERVAL 12 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000008','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000003','-','')),
   'DAY_30', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 12 DAY),INTERVAL 30 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 12 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000009','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000003','-','')),
   'DAY_90', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 12 DAY),INTERVAL 90 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 12 DAY)),

  -- Adoption 4 (Raj+Oliver, 5 days ago): all scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000010','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000004','-','')),
   'DAY_7',  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 5 DAY),INTERVAL 7 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 5 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000011','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000004','-','')),
   'DAY_30', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 5 DAY),INTERVAL 30 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 5 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000012','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000004','-','')),
   'DAY_90', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 5 DAY),INTERVAL 90 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 5 DAY)),

  -- Adoption 5 (Meera+Charlie, 20 days ago): DAY_7 FLAGGED (missed), rest scheduled
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000013','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000005','-','')),
   'DAY_7',  DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 20 DAY),INTERVAL 7 DAY),
   'FLAGGED','Follow-up overdue. Meera did not respond to reminders. NGO to call.',1,DATE_SUB(NOW(),INTERVAL 20 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000014','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000005','-','')),
   'DAY_30', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 20 DAY),INTERVAL 30 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 20 DAY)),
  (UNHEX(REPLACE('flwp0000-0000-0000-0000-000000000015','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000005','-','')),
   'DAY_90', DATE_ADD(DATE_SUB(CURDATE(),INTERVAL 20 DAY),INTERVAL 90 DAY),
   'SCHEDULED',NULL,0,DATE_SUB(NOW(),INTERVAL 20 DAY));

-- ── 1 more KYC document (total 5) ────────────────────────────────────────────
INSERT IGNORE INTO kyc_documents (
    id, application_id, doc_type, file_url, file_name,
    verification_status, uploaded_at
) VALUES
  (UNHEX(REPLACE('kycd0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('dd000000-0000-0000-0000-000000000006'),
   'ID_PROOF',
   'https://storage.petz.dev/kyc/karan-aadhar.jpg','karan_aadhar.jpg',
   'VERIFIED', DATE_SUB(NOW(),INTERVAL 11 DAY));

-- ── 4 more completed appointments + medical records (total 5 each) ────────────
INSERT IGNORE INTO appointments (
    id, hospital_id, doctor_id, pet_id, user_id,
    appointment_date, appointment_time, end_time,
    duration_minutes, status, slot_status, booking_type, service_type,
    version, is_locked, no_show_count, cancellation_policy_hours,
    created_at, updated_at
) VALUES
  -- Karan's Bruno at Green Leaf — Dr. Arjun Singh — COMPLETED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000006'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   DATE_SUB(CURDATE(),INTERVAL 10 DAY),'09:30:00','10:00:00',
   30,'COMPLETED','BOOKED','ROUTINE','VACCINATION',
   0,0,0,24,DATE_SUB(NOW(),INTERVAL 10 DAY),DATE_SUB(NOW(),INTERVAL 10 DAY)),

  -- Raj's Leo at PetCare — Dr. Anita Sharma — COMPLETED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000001'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   DATE_SUB(CURDATE(),INTERVAL 7 DAY),'10:00:00','10:30:00',
   30,'COMPLETED','BOOKED','ROUTINE','CONSULTATION',
   0,0,0,24,DATE_SUB(NOW(),INTERVAL 7 DAY),DATE_SUB(NOW(),INTERVAL 7 DAY)),

  -- Arjun's Max at Delhi Pet Hospital — Dr. Kavita Reddy — COMPLETED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000006','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000005'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   DATE_SUB(CURDATE(),INTERVAL 15 DAY),'14:00:00','14:30:00',
   30,'COMPLETED','BOOKED','EMERGENCY','EMERGENCY',
   0,0,0,24,DATE_SUB(NOW(),INTERVAL 15 DAY),DATE_SUB(NOW(),INTERVAL 15 DAY)),

  -- Meera's Snowy at Paws & Claws — Dr. Priya Nair — COMPLETED
  (UNHEX(REPLACE('appt0000-0000-0000-0000-000000000007','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'),
   UUID_TO_BIN('eeee0000-0000-0000-0000-000000000003'),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000d','-','')),
   DATE_SUB(CURDATE(),INTERVAL 3 DAY),'09:00:00','09:30:00',
   30,'COMPLETED','BOOKED','ROUTINE','CONSULTATION',
   0,0,0,24,DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY));

INSERT IGNORE INTO medical_records (
    id, pet_id, appointment_id, diagnosis, treatment, next_visit_date, created_at
) VALUES
  (UNHEX(REPLACE('medr0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('appt0000-0000-0000-0000-000000000004','-','')),
   'Routine vaccination — Rabies + DHPPiL',
   'Administered Rabies and DHPPiL booster. Next booster due in 12 months.',
   DATE_ADD(CURDATE(),INTERVAL 365 DAY), DATE_SUB(NOW(),INTERVAL 10 DAY)),

  (UNHEX(REPLACE('medr0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('appt0000-0000-0000-0000-000000000005','-','')),
   'Seasonal allergies — skin inflammation',
   'Cetirizine 5 mg once daily for 10 days. Avoid grass exposure. Follow-up in 3 weeks.',
   DATE_ADD(CURDATE(),INTERVAL 21 DAY), DATE_SUB(NOW(),INTERVAL 7 DAY)),

  (UNHEX(REPLACE('medr0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('appt0000-0000-0000-0000-000000000006','-','')),
   'Paw laceration — deep cut on right forepaw',
   'Wound cleaned, sutured (3 stitches). Antibiotic ointment. E-collar for 7 days. Rest advised.',
   DATE_ADD(CURDATE(),INTERVAL 7 DAY), DATE_SUB(NOW(),INTERVAL 15 DAY)),

  (UNHEX(REPLACE('medr0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('pet00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('appt0000-0000-0000-0000-000000000007','-','')),
   'Annual wellness check — healthy',
   'All vitals normal. Weight 42 g (healthy range). Clipped beak and nails. No concerns.',
   DATE_ADD(CURDATE(),INTERVAL 365 DAY), DATE_SUB(NOW(),INTERVAL 3 DAY));

-- ── 4 more SOS reports (total 7) ─────────────────────────────────────────────
INSERT IGNORE INTO sos_reports (
    id, reporter_id, latitude, longitude,
    urgency_level, current_status, description, reported_at
) VALUES
  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   18.5204, 73.8567, 'MODERATE','COMPLETE',
   'Stray dog with limping gait near Aundh Bridge. Appeared to have a leg injury.',
   DATE_SUB(NOW(),INTERVAL 5 DAY)),

  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000d','-','')),
   17.3850, 78.4867, 'CRITICAL','COMPLETE',
   'Cat found unconscious near Banjara Hills flyover. Suspected vehicle accident.',
   DATE_SUB(NOW(),INTERVAL 3 DAY)),

  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   12.9352, 77.6245, 'LOW','COMPLETE',
   'Small bird reported tangled in plastic near Koramangala lake. Could not be located on arrival.',
   DATE_SUB(NOW(),INTERVAL 1 DAY)),

  (UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   28.6315, 77.2167, 'MODERATE','ON_SITE',
   'Injured monkey near Connaught Place metro. Volunteer on scene — appears to have a broken arm.',
   DATE_SUB(NOW(),INTERVAL 2 HOUR));

-- Status logs for the 4 new SOS reports
INSERT IGNORE INTO status_logs (id, sos_report_id, status, updated_at) VALUES
  -- SOS 4 full lifecycle
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000011','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')), 'REPORTED',   DATE_SUB(NOW(),INTERVAL 5 DAY)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000012','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')), 'ASSIGNED',   DATE_SUB(NOW(),INTERVAL 119 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000013','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')), 'ON_SITE',    DATE_SUB(NOW(),INTERVAL 118 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000014','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')), 'COMPLETE',   DATE_SUB(NOW(),INTERVAL 117 HOUR)),
  -- SOS 5
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000015','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'REPORTED',   DATE_SUB(NOW(),INTERVAL 3 DAY)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000016','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'ASSIGNED',   DATE_SUB(NOW(),INTERVAL 71 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000017','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'DISPATCHED', DATE_SUB(NOW(),INTERVAL 70 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000018','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'ON_SITE',    DATE_SUB(NOW(),INTERVAL 69 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000019','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'TRANSPORTING',DATE_SUB(NOW(),INTERVAL 68 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000020','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')), 'COMPLETE',   DATE_SUB(NOW(),INTERVAL 67 HOUR)),
  -- SOS 6
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000021','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')), 'REPORTED',   DATE_SUB(NOW(),INTERVAL 1 DAY)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000022','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')), 'ASSIGNED',   DATE_SUB(NOW(),INTERVAL 23 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000023','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')), 'COMPLETE',   DATE_SUB(NOW(),INTERVAL 22 HOUR)),
  -- SOS 7
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000024','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')), 'REPORTED',   DATE_SUB(NOW(),INTERVAL 2 HOUR)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000025','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')), 'ASSIGNED',   DATE_SUB(NOW(),INTERVAL 100 MINUTE)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000026','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')), 'ON_SITE',    DATE_SUB(NOW(),INTERVAL 40 MINUTE));

-- Close SOS 2 (cat mission) — update existing mission + SOS to COMPLETE
UPDATE rescue_missions SET
    rescue_status   = 'MISSION_COMPLETE',
    on_site_at      = DATE_SUB(NOW(), INTERVAL 60 MINUTE),
    transporting_at = DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    completed_at    = DATE_SUB(NOW(), INTERVAL 10 MINUTE),
    updated_at      = DATE_SUB(NOW(), INTERVAL 10 MINUTE)
WHERE id = UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000002','-',''));

UPDATE sos_reports SET current_status = 'COMPLETE'
WHERE id = UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-',''));

INSERT IGNORE INTO status_logs (id, sos_report_id, status, updated_at) VALUES
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000027','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'ON_SITE',     DATE_SUB(NOW(),INTERVAL 60 MINUTE)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000028','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'TRANSPORTING',DATE_SUB(NOW(),INTERVAL 30 MINUTE)),
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000029','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')), 'COMPLETE',    DATE_SUB(NOW(),INTERVAL 10 MINUTE));

-- ── 3 more rescue missions (total 5) ─────────────────────────────────────────
INSERT IGNORE INTO rescue_missions (
    id, sos_report_id, assigned_ngo_user_id, assigned_ngo_id,
    rescue_status, eta_minutes, sos_lat, sos_lon, severity_level, ngo_status,
    accepted_at, dispatched_at, on_site_at, transporting_at, completed_at,
    created_at, updated_at
) VALUES
  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000004'),
   'MISSION_COMPLETE',20, 18.5204,73.8567,2,'COMPLETED',
   DATE_SUB(NOW(),INTERVAL 119 HOUR), NULL,
   DATE_SUB(NOW(),INTERVAL 118 HOUR), NULL,
   DATE_SUB(NOW(),INTERVAL 117 HOUR),
   DATE_SUB(NOW(),INTERVAL 5 DAY), DATE_SUB(NOW(),INTERVAL 117 HOUR)),

  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000005'),
   'MISSION_COMPLETE',25, 17.3850,78.4867,3,'COMPLETED',
   DATE_SUB(NOW(),INTERVAL 71 HOUR),
   DATE_SUB(NOW(),INTERVAL 70 HOUR),
   DATE_SUB(NOW(),INTERVAL 69 HOUR),
   DATE_SUB(NOW(),INTERVAL 68 HOUR),
   DATE_SUB(NOW(),INTERVAL 67 HOUR),
   DATE_SUB(NOW(),INTERVAL 3 DAY), DATE_SUB(NOW(),INTERVAL 67 HOUR)),

  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   'MISSION_COMPLETE',15, 12.9352,77.6245,1,'COMPLETED',
   DATE_SUB(NOW(),INTERVAL 23 HOUR), NULL,
   DATE_SUB(NOW(),INTERVAL 22 HOUR), NULL,
   DATE_SUB(NOW(),INTERVAL 22 HOUR),
   DATE_SUB(NOW(),INTERVAL 1 DAY), DATE_SUB(NOW(),INTERVAL 22 HOUR));

-- ── 3 more NGO assignments (total 5) ─────────────────────────────────────────
INSERT IGNORE INTO ngo_assignments (
    id, sos_report_id, ngo_id, volunteer_id,
    assigned_at, accepted_at, arrival_at, assignment_status
) VALUES
  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000004'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   DATE_SUB(NOW(),INTERVAL 119 HOUR), DATE_SUB(NOW(),INTERVAL 119 HOUR),
   DATE_SUB(NOW(),INTERVAL 118 HOUR), 'ARRIVED'),

  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000005'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   DATE_SUB(NOW(),INTERVAL 71 HOUR), DATE_SUB(NOW(),INTERVAL 71 HOUR),
   DATE_SUB(NOW(),INTERVAL 69 HOUR), 'ARRIVED'),

  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000003'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   DATE_SUB(NOW(),INTERVAL 23 HOUR), DATE_SUB(NOW(),INTERVAL 23 HOUR),
   DATE_SUB(NOW(),INTERVAL 22 HOUR), 'ARRIVED');

-- ── 4 more on-site assessments (total 5) ─────────────────────────────────────
INSERT IGNORE INTO on_site_assessments (
    id, sos_report_id, volunteer_id,
    animal_condition, injury_description,
    decision, decision_justification, assessed_at
) VALUES
  -- SOS 4 (Pune dog) — minor limp, released on-site
  (UNHEX(REPLACE('osa00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   'MINOR_INJURY',
   'Mild sprain on right hind leg. No open wounds or fracture apparent. Dog alert and mobile.',
   'RELEASE',
   'Injury is superficial — sprain only. Dog was mobile and responsive. Released after first aid.',
   DATE_SUB(NOW(),INTERVAL 118 HOUR)),

  -- SOS 5 (Hyderabad cat) — serious, transported to hospital
  (UNHEX(REPLACE('osa00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   'CRITICAL',
   'Cat unconscious, suspected internal bleeding and fractured left foreleg from vehicle impact.',
   'TRANSPORT_TO_HOSPITAL',
   'Critical condition requiring immediate veterinary surgery. Transported to Animal Aid Vet Clinic.',
   DATE_SUB(NOW(),INTERVAL 69 HOUR)),

  -- SOS 6 (Bangalore bird) — could not locate animal
  (UNHEX(REPLACE('osa00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   'UNKNOWN',
   'Searched the reported area for 30 minutes. No bird found. Likely flew away or was removed.',
   'CANNOT_LOCATE',
   'Animal not found at the reported location. Area canvassed thoroughly. Mission closed.',
   DATE_SUB(NOW(),INTERVAL 22 HOUR)),

  -- SOS 7 (Delhi monkey) — volunteer on scene, will transport
  (UNHEX(REPLACE('osa00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   'INJURED',
   'Monkey with suspected fractured right arm. Sitting on a ledge, agitated but accessible.',
   'TRANSPORT_TO_HOSPITAL',
   'Fracture confirmed visually. Sedation required before transport. Delhi Wildlife Vet alerted.',
   DATE_SUB(NOW(),INTERVAL 40 MINUTE));

-- ── 4 more mission summaries (total 5) ───────────────────────────────────────
INSERT IGNORE INTO mission_summaries (
    id, rescue_mission_id, outcome, timeline, notes, submitted_by, submitted_at
) VALUES
  -- RSM 2 (SOS 2 cat — now COMPLETE)
  (UNHEX(REPLACE('msm00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000002','-','')),
   'Cat transported to Bangalore Emergency Pet Care. Emergency surgery performed. Stable condition.',
   'Reported -> Assigned (60 min) -> Dispatched (30 min) -> On-site (30 min) -> Transport (20 min) -> Complete',
   'Cat was unresponsive on arrival. IV fluids administered en route. Vet confirmed internal injuries.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   DATE_SUB(NOW(),INTERVAL 10 MINUTE)),

  -- RSM 3 (SOS 4 Pune dog — RELEASE)
  (UNHEX(REPLACE('msm00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000003','-','')),
   'Dog assessed on-site — minor sprain, no transport needed. First aid applied, released.',
   'Reported -> Assigned (1 min) -> On-site (60 min) -> Complete (same visit)',
   'Quick response. Animal was cooperative. Released after first aid and monitoring.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   DATE_SUB(NOW(),INTERVAL 117 HOUR)),

  -- RSM 4 (SOS 5 Hyderabad cat — TRANSPORT)
  (UNHEX(REPLACE('msm00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000004','-','')),
   'Critically injured cat transported to Animal Aid Vet Clinic. Surgery successful.',
   'Reported -> Assigned (1 min) -> On-site (2 hrs) -> Transport (60 min) -> Complete',
   'Cat required sedation before handling. Post-surgery prognosis: good recovery expected.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000b','-','')),
   DATE_SUB(NOW(),INTERVAL 67 HOUR)),

  -- RSM 5 (SOS 6 Bangalore bird — CANNOT_LOCATE)
  (UNHEX(REPLACE('msm00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000005','-','')),
   'Animal could not be located at reported site. Area searched for 30 minutes. Mission closed.',
   'Reported -> Assigned (1 hr) -> On-site (1 hr search) -> Closed',
   'Reporter was advised to call again if the animal reappears. No further action required.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   DATE_SUB(NOW(),INTERVAL 22 HOUR));

-- ── 4 more case verifications (total 5) ──────────────────────────────────────
INSERT IGNORE INTO case_verifications (
    id, rescue_mission_id, verified_by,
    flagged, flag_notes, audit_notes, closed_at
) VALUES
  (UNHEX(REPLACE('csv00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   0,NULL,'Priya responded within 60 min. Cat surgery outcome positive. All docs submitted.',
   DATE_SUB(NOW(),INTERVAL 5 MINUTE)),

  (UNHEX(REPLACE('csv00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   0,NULL,'Fast response (1 min). RELEASE decision appropriate. No follow-up needed.',
   DATE_SUB(NOW(),INTERVAL 116 HOUR)),

  (UNHEX(REPLACE('csv00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   0,NULL,'Exemplary response. Critical case handled within SLA. Post-surgery report attached.',
   DATE_SUB(NOW(),INTERVAL 66 HOUR)),

  (UNHEX(REPLACE('csv00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   1,'Animal not found - reporter should have been asked for photo before dispatch.',
   'CANNOT_LOCATE outcome. Flagged to improve reporter verification flow before dispatching.',
   DATE_SUB(NOW(),INTERVAL 21 HOUR));

-- ── 5 SOS media (photos from SOS reports) ────────────────────────────────────
INSERT IGNORE INTO sos_media (id, sos_report_id, file_url, media_type) VALUES
  (UNHEX(REPLACE('sosm0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000001','-','')),
   'https://media.petz.dev/sos/sos1-dog-andheri.jpg','PHOTO'),
  (UNHEX(REPLACE('sosm0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000002','-','')),
   'https://media.petz.dev/sos/sos2-cat-koramangala.jpg','PHOTO'),
  (UNHEX(REPLACE('sosm0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000004','-','')),
   'https://media.petz.dev/sos/sos4-dog-pune.jpg','PHOTO'),
  (UNHEX(REPLACE('sosm0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000005','-','')),
   'https://media.petz.dev/sos/sos5-cat-hyderabad.jpg','PHOTO'),
  (UNHEX(REPLACE('sosm0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')),
   'https://media.petz.dev/sos/sos7-monkey-delhi.jpg','PHOTO');

-- ── 5 blackout dates (one per hospital) ──────────────────────────────────────
INSERT IGNORE INTO blackout_dates (id, hospital_id, blackout_date, reason, created_at) VALUES
  (UNHEX(REPLACE('blkd0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'),
   DATE_ADD(CURDATE(),INTERVAL 15 DAY),'Annual staff training day',NOW()),
  (UNHEX(REPLACE('blkd0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'),
   DATE_ADD(CURDATE(),INTERVAL 20 DAY),'Clinic renovation — closed for one day',NOW()),
  (UNHEX(REPLACE('blkd0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'),
   DATE_ADD(CURDATE(),INTERVAL 10 DAY),'Public holiday — Republic Day',NOW()),
  (UNHEX(REPLACE('blkd0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'),
   DATE_ADD(CURDATE(),INTERVAL 7 DAY),'Equipment calibration — no surgery slots',NOW()),
  (UNHEX(REPLACE('blkd0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'),
   DATE_ADD(CURDATE(),INTERVAL 25 DAY),'Emergency team conference — reduced capacity',NOW());

-- ── 5 hospital audit logs ─────────────────────────────────────────────────────
INSERT IGNORE INTO hospital_audit_logs (
    id, hospital_id, admin_id, action, reason, performed_at
) VALUES
  (UNHEX(REPLACE('haud0000-0000-0000-0000-000000000001','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000001'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'HOSPITAL_VERIFIED','Hospital passed inspection. All licences valid.',DATE_SUB(NOW(),INTERVAL 60 DAY)),
  (UNHEX(REPLACE('haud0000-0000-0000-0000-000000000002','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000002'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'HOSPITAL_VERIFIED','All documentation reviewed and approved.',DATE_SUB(NOW(),INTERVAL 55 DAY)),
  (UNHEX(REPLACE('haud0000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000003'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'EMERGENCY_READY_ENABLED','Hospital confirmed 24-hr emergency readiness.',DATE_SUB(NOW(),INTERVAL 50 DAY)),
  (UNHEX(REPLACE('haud0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000004'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'HOSPITAL_VERIFIED','Green Leaf passed re-inspection after equipment upgrade.',DATE_SUB(NOW(),INTERVAL 45 DAY)),
  (UNHEX(REPLACE('haud0000-0000-0000-0000-000000000005','-','')),
   UUID_TO_BIN('cccc0000-0000-0000-0000-000000000005'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   'EMERGENCY_READY_ENABLED','Bangalore Emergency cleared for critical case intake.',DATE_SUB(NOW(),INTERVAL 40 DAY));

-- ── 5 adoption audit logs ─────────────────────────────────────────────────────
INSERT IGNORE INTO adoption_audit_logs (
    id, target_type, target_id, actor_id, action, reason, metadata, performed_at
) VALUES
  (UNHEX(REPLACE('aaud0000-0000-0000-0000-000000000001','-','')),
   'APPLICATION', UUID_TO_BIN('dd000000-0000-0000-0000-000000000001'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000006','-','')),
   'APPLICATION_SUBMITTED','Applicant submitted all sections.',NULL,DATE_SUB(NOW(),INTERVAL 3 DAY)),

  (UNHEX(REPLACE('aaud0000-0000-0000-0000-000000000002','-','')),
   'APPLICATION', UUID_TO_BIN('dd000000-0000-0000-0000-000000000004'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'APPLICATION_APPROVED','Home visit completed. Applicant approved.',NULL,DATE_SUB(NOW(),INTERVAL 2 DAY)),

  (UNHEX(REPLACE('aaud0000-0000-0000-0000-000000000003','-','')),
   'ADOPTION', UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'HANDOVER_COMPLETED','Bella handed over to Sneha Iyer.',NULL,DATE_SUB(NOW(),INTERVAL 2 DAY)),

  (UNHEX(REPLACE('aaud0000-0000-0000-0000-000000000004','-','')),
   'APPLICATION', UUID_TO_BIN('dd000000-0000-0000-0000-000000000005'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000005','-','')),
   'APPLICATION_REJECTED','Applicant works 10+ hours with no pet support.',NULL,DATE_SUB(NOW(),INTERVAL 4 DAY)),

  (UNHEX(REPLACE('aaud0000-0000-0000-0000-000000000005','-','')),
   'PET_LISTING', UUID_TO_BIN('aaaa0000-0000-0000-0000-000000000009'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000a','-','')),
   'LISTING_CREATED','New pet Tiger listed for adoption by Furever Friends.',NULL,NOW());

-- ── 5 adoption disputes ───────────────────────────────────────────────────────
INSERT IGNORE INTO adoption_disputes (
    id, adoption_id, raised_by_user_id, description,
    status, admin_action, resolution, resolved_by, resolved_at, created_at
) VALUES
  -- Resolved: process complaint on adoption 2
  (UNHEX(REPLACE('disp0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000008','-','')),
   'NGO did not communicate the handover location clearly. Had to call multiple times.',
   'RESOLVED','WARN',
   'NGO issued a formal apology. Communication guidelines updated for future handovers.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   DATE_SUB(NOW(),INTERVAL 8 DAY), DATE_SUB(NOW(),INTERVAL 9 DAY)),

  -- Open: concern about follow-up being missed on adoption 5
  (UNHEX(REPLACE('disp0000-0000-0000-0000-000000000002','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000002','-','')),
   'Adopter Meera Singh has not responded to 7-day follow-up. Welfare concern for Charlie.',
   'OPEN',NULL,NULL,NULL,NULL,DATE_SUB(NOW(),INTERVAL 2 DAY)),

  -- Resolved: documentation dispute on adoption 3
  (UNHEX(REPLACE('disp0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000009','-','')),
   'KYC documents were requested again after being already verified. Caused unnecessary delay.',
   'RESOLVED','WARN',
   'Admin reviewed KYC logs — duplicate request was a system error. Bug fixed in workflow.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   DATE_SUB(NOW(),INTERVAL 10 DAY), DATE_SUB(NOW(),INTERVAL 11 DAY)),

  -- Resolved: health concern on adoption 1
  (UNHEX(REPLACE('disp0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000001','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000007','-','')),
   'Bella showed signs of anxiety after handover. Requested guidance from the NGO.',
   'RESOLVED','OVERRIDE',
   'NGO counselled adopter on separation anxiety management. Follow-up scheduled. No escalation needed.',
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000001','-','')),
   DATE_SUB(NOW(),INTERVAL 1 DAY), DATE_SUB(NOW(),INTERVAL 1 DAY)),

  -- Open: condition-of-animal complaint on adoption 4
  (UNHEX(REPLACE('disp0000-0000-0000-0000-000000000005','-','')),
   UNHEX(REPLACE('adon0000-0000-0000-0000-000000000004','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-00000000000c','-','')),
   'Oliver appears underweight compared to the profile photos shown before adoption. Concerned about his diet history.',
   'OPEN',NULL,NULL,NULL,NULL,DATE_SUB(NOW(),INTERVAL 3 DAY));

-- ═════════════════════════════════════════════════════════════════════════════
-- NGO ASSIGNMENT FIX — seed rescue missions + assignments for SOS 3 & SOS 7
-- These reports were inserted directly into the DB, bypassing the queue
-- service that normally runs assignToNextNgo() on report creation.
-- SOS 3 (Low, Delhi bird)  → ASSIGNED → NGO 2 (Animal Care Trust, rahul) PENDING
-- SOS 7 (Moderate, Delhi monkey) → ON_SITE → NGO 2 (rahul) ARRIVED
-- ═════════════════════════════════════════════════════════════════════════════

-- Promote SOS 3 from REPORTED to ASSIGNED (queue would have done this)
UPDATE sos_reports SET current_status = 'ASSIGNED'
WHERE id = UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-',''));

-- Add ASSIGNED status log for SOS 3
INSERT IGNORE INTO status_logs (id, sos_report_id, status, updated_at) VALUES
  (UNHEX(REPLACE('stl00000-0000-0000-0000-000000000030','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')),
   'ASSIGNED', DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- Rescue mission for SOS 3 (ASSIGNED, awaiting NGO acceptance)
INSERT IGNORE INTO rescue_missions (
    id, sos_report_id, assigned_ngo_user_id, assigned_ngo_id,
    rescue_status, eta_minutes, sos_lat, sos_lon, severity_level, ngo_status,
    accepted_at, dispatched_at, on_site_at, transporting_at, completed_at,
    created_at, updated_at
) VALUES
  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   'ASSIGNED', NULL, 28.6358, 77.2144, 1, 'PENDING',
   NULL, NULL, NULL, NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 25 MINUTE),
   DATE_SUB(NOW(), INTERVAL 20 MINUTE));

-- NGO assignment for SOS 3 — PENDING (rahul notified, not yet accepted)
INSERT IGNORE INTO ngo_assignments (
    id, sos_report_id, ngo_id, volunteer_id,
    assigned_at, accepted_at, arrival_at, assignment_status
) VALUES
  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000006','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000003','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   DATE_SUB(NOW(), INTERVAL 20 MINUTE),
   NULL, NULL,
   'PENDING');

-- Rescue mission for SOS 7 (ON_SITE — volunteer already at scene)
INSERT IGNORE INTO rescue_missions (
    id, sos_report_id, assigned_ngo_user_id, assigned_ngo_id,
    rescue_status, eta_minutes, sos_lat, sos_lon, severity_level, ngo_status,
    accepted_at, dispatched_at, on_site_at, transporting_at, completed_at,
    created_at, updated_at
) VALUES
  (UNHEX(REPLACE('rsm00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   'ON_SITE', 10, 28.6315, 77.2167, 2, 'ACTIVE',
   DATE_SUB(NOW(), INTERVAL 100 MINUTE),
   DATE_SUB(NOW(), INTERVAL 80 MINUTE),
   DATE_SUB(NOW(), INTERVAL 40 MINUTE),
   NULL, NULL,
   DATE_SUB(NOW(), INTERVAL 2 HOUR),
   DATE_SUB(NOW(), INTERVAL 40 MINUTE));

-- NGO assignment for SOS 7 — ARRIVED (rahul on scene)
INSERT IGNORE INTO ngo_assignments (
    id, sos_report_id, ngo_id, volunteer_id,
    assigned_at, accepted_at, arrival_at, assignment_status
) VALUES
  (UNHEX(REPLACE('nga00000-0000-0000-0000-000000000007','-','')),
   UNHEX(REPLACE('sos00000-0000-0000-0000-000000000007','-','')),
   UUID_TO_BIN('11110000-0000-0000-0000-000000000002'),
   UNHEX(REPLACE('bbbb0000-0000-0000-0000-000000000004','-','')),
   DATE_SUB(NOW(), INTERVAL 100 MINUTE),
   DATE_SUB(NOW(), INTERVAL 100 MINUTE),
   DATE_SUB(NOW(), INTERVAL 40 MINUTE),
   'ARRIVED');
