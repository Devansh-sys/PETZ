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
-- ----------------------------------------------------------

-- Default ADMIN user (password: admin@petz123)
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('Admin User', 'admin@petz.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdBKOdm.y',
        '9999999999', 'ADMIN')
ON DUPLICATE KEY UPDATE id = id;

-- Sample NGO owner
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('NGO Owner', 'ngo@petz.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdBKOdm.y',
        '9888888888', 'NGO')
ON DUPLICATE KEY UPDATE id = id;

-- Sample hospital owner
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('Hospital Owner', 'hospital@petz.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdBKOdm.y',
        '9777777777', 'HOSPITAL')
ON DUPLICATE KEY UPDATE id = id;

-- Sample regular user
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('John Doe', 'user@petz.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdBKOdm.y',
        '9666666666', 'USER')
ON DUPLICATE KEY UPDATE id = id;
