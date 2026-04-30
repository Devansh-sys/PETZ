-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data for local development  (INSERT IGNORE = safe to re-run on restart)
-- ─────────────────────────────────────────────────────────────────────────────
 
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
 
-- Upsert two extra demo users so every PETZ role has at least one login. The
-- ADMIN, NGO_REP, ADOPTER and REPORTER rows are already created by DataSeeder
-- on a fresh DB; this block only adds VOLUNTEER and VET if missing.
INSERT IGNORE INTO users (
    id, role, full_name, phone, email, password,
    active, email_verified, phone_verified, is_temporary,
    failed_login_attempts, created_at
) VALUES
  (UNHEX(REPLACE('a0000000-0000-0000-0000-000000000001','-','')),
   'VOLUNTEER', 'Volunteer Demo', '+919000010001', 'volunteer@petz.dev',
   @petz_pwd, 1, 1, 1, 0, 0, NOW()),
  (UNHEX(REPLACE('a0000000-0000-0000-0000-000000000002','-','')),
   'VET',       'Dr. Vet Demo',   '+919000010002', 'vet@petz.dev',
   @petz_pwd, 1, 1, 1, 0, 0, NOW());
 
-- Re-assert known-good password + activation flags for every demo account.
-- Lets a teammate log in with Petz@1234 even after a wrong-password lockout.
UPDATE users
SET password = @petz_pwd,
    active = 1,
    email_verified = 1,
    phone_verified = 1,
    failed_login_attempts = 0,
    locked_until = NULL
WHERE email IN (
    'admin@petz.dev',
    'ngo@petz.dev',
    'owner@petz.test',
    'john@test.com',
    'volunteer@petz.dev',
    'vet@petz.dev'
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
 
 