-- =========================================================
-- PETZ PLATFORM — COMPLETE DATABASE SCHEMA
-- MySQL 8.0+
-- =========================================================

CREATE DATABASE IF NOT EXISTS petz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petz_db;

-- ----------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20)   NOT NULL DEFAULT 'USER',
    profile_photo VARCHAR(500),
    address       VARCHAR(300),
    city          VARCHAR(100),
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 2. NGOS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ngos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id   BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    registration_no VARCHAR(100),
    description     TEXT,
    city            VARCHAR(100),
    address         VARCHAR(300),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    logo_url        VARCHAR(500),
    is_verified     BOOLEAN  NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ngo_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------
-- 3. HOSPITALS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    name         VARCHAR(200) NOT NULL,
    address      VARCHAR(300),
    city         VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(150),
    latitude     DECIMAL(10,7),
    longitude    DECIMAL(10,7),
    logo_url     VARCHAR(500),
    is_active    BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hospital_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------
-- 4. DOCTORS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id   BIGINT NOT NULL,
    name          VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone         VARCHAR(20),
    email         VARCHAR(150),
    photo_url     VARCHAR(500),
    schedule_start TIME,
    schedule_end   TIME,
    slot_duration  INT NOT NULL DEFAULT 30,
    is_active     BOOLEAN  NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- ----------------------------------------------------------
-- 5. PETS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pets (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id    BIGINT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    species     VARCHAR(50),
    breed       VARCHAR(100),
    age_years   INT,
    gender      VARCHAR(10),
    weight_kg   DECIMAL(5,2),
    photo_url   VARCHAR(500),
    notes       TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ----------------------------------------------------------
-- 6. APPOINTMENTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    pet_id       BIGINT,
    hospital_id  BIGINT NOT NULL,
    doctor_id    BIGINT NOT NULL,
    appt_date    DATE NOT NULL,
    appt_time    TIME NOT NULL,
    reason       TEXT,
    status       VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes        TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT fk_appt_pet      FOREIGN KEY (pet_id)      REFERENCES pets(id),
    CONSTRAINT fk_appt_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    CONSTRAINT fk_appt_doctor   FOREIGN KEY (doctor_id)   REFERENCES doctors(id)
);

-- ----------------------------------------------------------
-- 7. RESCUE REPORTS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS rescue_reports (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id  BIGINT NOT NULL,
    assigned_ngo BIGINT,
    animal_type  VARCHAR(50),
    description  TEXT,
    latitude     DECIMAL(10,7),
    longitude    DECIMAL(10,7),
    address      VARCHAR(300),
    photo_url    VARCHAR(500),
    status       VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    criticality  VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    resolution_notes TEXT,
    reported_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rescue_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_rescue_ngo      FOREIGN KEY (assigned_ngo) REFERENCES ngos(id)
);

-- ----------------------------------------------------------
-- 8. ADOPTABLE ANIMALS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS adoptable_animals (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    ngo_id       BIGINT NOT NULL,
    name         VARCHAR(100) NOT NULL,
    species      VARCHAR(50),
    breed        VARCHAR(100),
    age_months   INT,
    gender       VARCHAR(10),
    description  TEXT,
    photo_url    VARCHAR(500),
    city         VARCHAR(100),
    is_vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
    is_neutered   BOOLEAN NOT NULL DEFAULT FALSE,
    status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_animal_ngo FOREIGN KEY (ngo_id) REFERENCES ngos(id)
);

-- ----------------------------------------------------------
-- 9. ADOPTION APPLICATIONS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS adoption_applications (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    animal_id      BIGINT NOT NULL,
    applicant_id   BIGINT NOT NULL,
    ngo_id         BIGINT NOT NULL,
    reason         TEXT,
    experience     TEXT,
    housing_type   VARCHAR(50),
    has_other_pets BOOLEAN DEFAULT FALSE,
    status         VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_notes    TEXT,
    applied_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_adoption_animal     FOREIGN KEY (animal_id)    REFERENCES adoptable_animals(id),
    CONSTRAINT fk_adoption_applicant  FOREIGN KEY (applicant_id) REFERENCES users(id),
    CONSTRAINT fk_adoption_ngo        FOREIGN KEY (ngo_id)       REFERENCES ngos(id)
);

-- ----------------------------------------------------------
-- 10. NOTIFICATIONS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    title        VARCHAR(200) NOT NULL,
    message      TEXT NOT NULL,
    type         VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    ref_id       BIGINT,
    ref_type     VARCHAR(50),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------
-- 11. RESCUE QUEUE (NGO assignment tracking)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS rescue_queue (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    rescue_id    BIGINT NOT NULL UNIQUE,
    ngo_id       BIGINT NOT NULL,
    assigned_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP NOT NULL,
    responded_at TIMESTAMP,
    response     VARCHAR(20),
    CONSTRAINT fk_queue_rescue FOREIGN KEY (rescue_id) REFERENCES rescue_reports(id),
    CONSTRAINT fk_queue_ngo    FOREIGN KEY (ngo_id)    REFERENCES ngos(id)
);

-- ----------------------------------------------------------
-- 12. OTP TOKENS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(150) NOT NULL,
    otp_code    VARCHAR(10)  NOT NULL,
    purpose     VARCHAR(50)  NOT NULL DEFAULT 'PHONE_VERIFY',
    is_used     BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 13. FILE UPLOADS (audit trail)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_uploads (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    uploader_id  BIGINT,
    file_name    VARCHAR(300) NOT NULL,
    file_path    VARCHAR(500) NOT NULL,
    mime_type    VARCHAR(100),
    size_bytes   BIGINT,
    context      VARCHAR(50),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- SEED DATA
-- All passwords = admin@petz123
-- BCrypt hash (cost 10): $2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG
-- ----------------------------------------------------------

-- ── USERS ──────────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, phone, role, city, address) VALUES
('Admin User',      'admin@petz.com',     '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9999999999', 'ADMIN',    'Mumbai', '1 Admin Lane, Mumbai'),
('Riya Sharma',     'ngo@petz.com',       '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9888888888', 'NGO',      'Mumbai', '23 NGO Colony, Andheri'),
('Arjun Mehta',     'hospital@petz.com',  '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9777777777', 'HOSPITAL', 'Delhi',  '45 Hospital Road, Saket'),
('John Doe',        'user@petz.com',      '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9666666666', 'USER',     'Mumbai', '12 Park Street, Bandra'),
('Sneha Kapoor',    'ngo2@petz.com',      '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9555555555', 'NGO',      'Delhi',  '67 Green Avenue, Saket'),
('Vikram Singh',    'hospital2@petz.com', '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9444444444', 'HOSPITAL', 'Bangalore', '89 Clinic Road, Koramangala'),
('Priya Nair',      'user2@petz.com',     '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG', '9333333333', 'USER',     'Delhi',  '34 Lotus Colony, Dwarka')
ON DUPLICATE KEY UPDATE password_hash = '$2a$10$edSboBRto4R0pN4NIX4oh.OObHEeKRCySjiSFulEa4.7IsE42UgWG';

-- ── NGOS ───────────────────────────────────────────────────
INSERT INTO ngos (owner_user_id, name, registration_no, description, city, address, phone, email, is_verified, is_active)
SELECT id, 'Paws & Care NGO', 'NGO-REG-001',
       'We rescue and rehabilitate stray animals across Mumbai. Operating since 2015.',
       'Mumbai', '23 NGO Colony, Andheri West', '9888888888', 'contact@pawscare.org', TRUE, TRUE
FROM users WHERE email = 'ngo@petz.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO ngos (owner_user_id, name, registration_no, description, city, address, phone, email, is_verified, is_active)
SELECT id, 'Happy Tails Foundation', 'NGO-REG-002',
       'Dedicated to finding loving homes for abandoned and rescued animals in Delhi.',
       'Delhi', '67 Green Avenue, Saket', '9555555555', 'info@happytails.org', TRUE, TRUE
FROM users WHERE email = 'ngo2@petz.com'
ON DUPLICATE KEY UPDATE name = name;

-- ── HOSPITALS ──────────────────────────────────────────────
INSERT INTO hospitals (owner_user_id, name, address, city, phone, email, latitude, longitude, is_active)
SELECT id, 'City Pet Hospital',
       '45 Hospital Road, Saket', 'Delhi', '9777777777', 'info@citypethospital.com',
       28.5274856, 77.2167157, TRUE
FROM users WHERE email = 'hospital@petz.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO hospitals (owner_user_id, name, address, city, phone, email, latitude, longitude, is_active)
SELECT id, 'Healthy Paws Clinic',
       '89 Clinic Road, Koramangala', 'Bangalore', '9444444444', 'care@healthypaws.com',
       12.9352273, 77.6244516, TRUE
FROM users WHERE email = 'hospital2@petz.com'
ON DUPLICATE KEY UPDATE name = name;

-- ── DOCTORS ────────────────────────────────────────────────
INSERT INTO doctors (hospital_id, name, specialization, phone, email, schedule_start, schedule_end, slot_duration, is_active)
SELECT h.id, 'Dr. Anil Sharma', 'General Veterinary', '9111111111', 'anil@citypethospital.com',
       '09:00:00', '17:00:00', 30, TRUE
FROM hospitals h WHERE h.email = 'info@citypethospital.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO doctors (hospital_id, name, specialization, phone, email, schedule_start, schedule_end, slot_duration, is_active)
SELECT h.id, 'Dr. Priya Mehta', 'Surgery & Orthopaedics', '9222222222', 'priya@citypethospital.com',
       '10:00:00', '18:00:00', 45, TRUE
FROM hospitals h WHERE h.email = 'info@citypethospital.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO doctors (hospital_id, name, specialization, phone, email, schedule_start, schedule_end, slot_duration, is_active)
SELECT h.id, 'Dr. Raj Kumar', 'Dermatology & Nutrition', '9333111111', 'raj@healthypaws.com',
       '09:00:00', '15:00:00', 30, TRUE
FROM hospitals h WHERE h.email = 'care@healthypaws.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO doctors (hospital_id, name, specialization, phone, email, schedule_start, schedule_end, slot_duration, is_active)
SELECT h.id, 'Dr. Sara Singh', 'Dentistry & Ophthalmology', '9444111111', 'sara@healthypaws.com',
       '11:00:00', '19:00:00', 30, TRUE
FROM hospitals h WHERE h.email = 'care@healthypaws.com'
ON DUPLICATE KEY UPDATE name = name;

-- ── PETS ───────────────────────────────────────────────────
INSERT INTO pets (owner_id, name, species, breed, age_years, gender, weight_kg, notes)
SELECT id, 'Bruno', 'Dog', 'Labrador Retriever', 3, 'Male', 28.5, 'Friendly and loves to play fetch.'
FROM users WHERE email = 'user@petz.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO pets (owner_id, name, species, breed, age_years, gender, weight_kg, notes)
SELECT id, 'Whiskers', 'Cat', 'Persian', 2, 'Female', 4.2, 'Shy but affectionate once comfortable.'
FROM users WHERE email = 'user@petz.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO pets (owner_id, name, species, breed, age_years, gender, weight_kg, notes)
SELECT id, 'Max', 'Dog', 'German Shepherd', 4, 'Male', 32.0, 'Very active, needs daily walks.'
FROM users WHERE email = 'user2@petz.com'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO pets (owner_id, name, species, breed, age_years, gender, weight_kg, notes)
SELECT id, 'Milo', 'Cat', 'Siamese', 1, 'Male', 3.5, 'Playful kitten, vaccinated.'
FROM users WHERE email = 'user2@petz.com'
ON DUPLICATE KEY UPDATE name = name;

-- ── APPOINTMENTS ───────────────────────────────────────────
INSERT INTO appointments (user_id, pet_id, hospital_id, doctor_id, appt_date, appt_time, reason, status)
SELECT
    u.id,
    p.id,
    h.id,
    d.id,
    DATE_ADD(CURDATE(), INTERVAL 2 DAY),
    '10:00:00',
    'Annual vaccination and general checkup',
    'CONFIRMED'
FROM users u, pets p, hospitals h, doctors d
WHERE u.email = 'user@petz.com'
  AND p.name = 'Bruno' AND p.owner_id = u.id
  AND h.email = 'info@citypethospital.com'
  AND d.email = 'anil@citypethospital.com'
LIMIT 1;

INSERT INTO appointments (user_id, pet_id, hospital_id, doctor_id, appt_date, appt_time, reason, status)
SELECT
    u.id,
    p.id,
    h.id,
    d.id,
    DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    '11:30:00',
    'Skin allergy follow-up',
    'PENDING'
FROM users u, pets p, hospitals h, doctors d
WHERE u.email = 'user@petz.com'
  AND p.name = 'Whiskers' AND p.owner_id = u.id
  AND h.email = 'info@citypethospital.com'
  AND d.email = 'priya@citypethospital.com'
LIMIT 1;

INSERT INTO appointments (user_id, pet_id, hospital_id, doctor_id, appt_date, appt_time, reason, status)
SELECT
    u.id,
    p.id,
    h.id,
    d.id,
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    '14:00:00',
    'Dental cleaning and eye examination',
    'PENDING'
FROM users u, pets p, hospitals h, doctors d
WHERE u.email = 'user2@petz.com'
  AND p.name = 'Max' AND p.owner_id = u.id
  AND h.email = 'care@healthypaws.com'
  AND d.email = 'sara@healthypaws.com'
LIMIT 1;

-- ── RESCUE REPORTS ─────────────────────────────────────────
INSERT INTO rescue_reports (reporter_id, assigned_ngo, animal_type, description, latitude, longitude, address, status, criticality)
SELECT u.id, n.id,
       'Dog',
       'Injured stray dog found near the main market, limping badly, needs urgent care.',
       19.0760, 72.8777,
       'Near Main Market, Andheri West, Mumbai',
       'ASSIGNED', 'HIGH'
FROM users u, ngos n
WHERE u.email = 'user@petz.com' AND n.email = 'contact@pawscare.org'
LIMIT 1;

INSERT INTO rescue_reports (reporter_id, assigned_ngo, animal_type, description, latitude, longitude, address, status, criticality)
SELECT u.id, n.id,
       'Cat',
       'Kitten stuck on rooftop, meowing continuously, unable to come down.',
       28.6139, 77.2090,
       'Block C, Saket, Delhi',
       'PENDING', 'MEDIUM'
FROM users u, ngos n
WHERE u.email = 'user2@petz.com' AND n.email = 'info@happytails.org'
LIMIT 1;

INSERT INTO rescue_reports (reporter_id, assigned_ngo, animal_type, description, latitude, longitude, address, status, criticality, resolution_notes)
SELECT u.id, n.id,
       'Bird',
       'Injured pigeon with broken wing found in the park.',
       19.0522, 72.8311,
       'Central Park, Bandra, Mumbai',
       'RESOLVED', 'LOW',
       'Bird was rescued and handed over to a wildlife rehabilitator.'
FROM users u, ngos n
WHERE u.email = 'user@petz.com' AND n.email = 'contact@pawscare.org'
LIMIT 1;

-- ── ADOPTABLE ANIMALS ──────────────────────────────────────
INSERT INTO adoptable_animals (ngo_id, name, species, breed, age_months, gender, description, city, is_vaccinated, is_neutered, status)
SELECT id, 'Charlie', 'Dog', 'Mixed Breed', 18, 'Male',
       'Friendly and energetic dog, great with kids. Rescued from the streets.',
       'Mumbai', TRUE, TRUE, 'AVAILABLE'
FROM ngos WHERE email = 'contact@pawscare.org'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO adoptable_animals (ngo_id, name, species, breed, age_months, gender, description, city, is_vaccinated, is_neutered, status)
SELECT id, 'Luna', 'Cat', 'Tabby', 8, 'Female',
       'Sweet and calm cat, loves cuddles. Good with other cats.',
       'Mumbai', TRUE, TRUE, 'AVAILABLE'
FROM ngos WHERE email = 'contact@pawscare.org'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO adoptable_animals (ngo_id, name, species, breed, age_months, gender, description, city, is_vaccinated, is_neutered, status)
SELECT id, 'Rocky', 'Dog', 'Beagle Mix', 24, 'Male',
       'Playful and loyal dog. Trained for basic commands. Loves outdoor activities.',
       'Delhi', TRUE, FALSE, 'AVAILABLE'
FROM ngos WHERE email = 'info@happytails.org'
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO adoptable_animals (ngo_id, name, species, breed, age_months, gender, description, city, is_vaccinated, is_neutered, status)
SELECT id, 'Bella', 'Cat', 'Persian Mix', 12, 'Female',
       'Gentle and quiet cat, prefers a calm home environment. Fully vaccinated.',
       'Delhi', TRUE, TRUE, 'AVAILABLE'
FROM ngos WHERE email = 'info@happytails.org'
ON DUPLICATE KEY UPDATE name = name;

-- ── ADOPTION APPLICATIONS ──────────────────────────────────
INSERT INTO adoption_applications (animal_id, applicant_id, ngo_id, reason, experience, housing_type, has_other_pets, status)
SELECT a.id, u.id, n.id,
       'I have always wanted a dog companion. I work from home so I can give him full attention.',
       'Had a dog for 5 years growing up.',
       'APARTMENT', FALSE, 'PENDING'
FROM adoptable_animals a, users u, ngos n
WHERE a.name = 'Charlie' AND u.email = 'user@petz.com' AND n.email = 'contact@pawscare.org'
LIMIT 1;

INSERT INTO adoption_applications (animal_id, applicant_id, ngo_id, reason, experience, housing_type, has_other_pets, status)
SELECT a.id, u.id, n.id,
       'Looking for a gentle cat to keep me company. I live alone and have a quiet home.',
       'Owned two cats before, very experienced.',
       'HOUSE', FALSE, 'APPROVED'
FROM adoptable_animals a, users u, ngos n
WHERE a.name = 'Bella' AND u.email = 'user2@petz.com' AND n.email = 'info@happytails.org'
LIMIT 1;

-- ── NOTIFICATIONS ──────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Welcome to Petz!', 'Your account has been created successfully. Start exploring our services.', 'GENERAL', FALSE
FROM users WHERE email = 'user@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Appointment Confirmed', 'Your appointment for Bruno at City Pet Hospital on has been confirmed.', 'APPOINTMENT', FALSE
FROM users WHERE email = 'user@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Rescue Report Update', 'Your rescue report has been assigned to Paws & Care NGO.', 'RESCUE', TRUE
FROM users WHERE email = 'user@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Welcome to Petz!', 'Your account has been created successfully. Start exploring our services.', 'GENERAL', FALSE
FROM users WHERE email = 'user2@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Adoption Application Approved', 'Congratulations! Your adoption application for Bella has been approved.', 'ADOPTION', FALSE
FROM users WHERE email = 'user2@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'New Rescue Report', 'A new rescue report has been assigned to your NGO. Please review it.', 'RESCUE', FALSE
FROM users WHERE email = 'ngo@petz.com';

INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'New Adoption Application', 'A new adoption application has been submitted for Charlie.', 'ADOPTION', FALSE
FROM users WHERE email = 'ngo@petz.com';
