CREATE DATABASE IF NOT EXISTS smartschool_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartschool_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    shift VARCHAR(255),
    area VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS equipments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    room_code VARCHAR(255),
    room_full_name VARCHAR(255),
    area VARCHAR(255),
    installed_date VARCHAR(255),
    last_maintenance_date VARCHAR(255),
    last_repair_date VARCHAR(255),
    status VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uk_equipments_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_reports (
    id BIGINT NOT NULL AUTO_INCREMENT,
    equipment_code VARCHAR(255),
    equipment_name VARCHAR(255),
    room_badge VARCHAR(255),
    description TEXT,
    reporter_name VARCHAR(255),
    reported_time VARCHAR(255),
    ai_severity VARCHAR(255),
    resolved_by_ai BOOLEAN,
    status VARCHAR(255),
    assigned_tech_name VARCHAR(255),
    accepted_at VARCHAR(255),
    root_cause_note TEXT,
    replaced_parts VARCHAR(255),
    completed_date VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_schedules (
    id BIGINT NOT NULL AUTO_INCREMENT,
    shift_name VARCHAR(255),
    tech_name VARCHAR(255),
    area VARCHAR(255),
    is_online BOOLEAN,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
