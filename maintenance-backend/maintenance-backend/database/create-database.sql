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
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    responsible_unit VARCHAR(255),
    responsible_person VARCHAR(255),
    responsible_technician_id BIGINT,
    warranty_expiry_date DATE,
    maintenance_interval_months INT,
    safety_notes TEXT,
    status VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uk_equipments_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS equipment_images (
    equipment_id BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    image_data MEDIUMBLOB NOT NULL,
    PRIMARY KEY (equipment_id),
    CONSTRAINT fk_equipment_images_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipments (id)
        ON DELETE CASCADE
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
    replaced_parts TEXT,
    completed_date VARCHAR(255),
    has_image_before BOOLEAN NOT NULL DEFAULT FALSE,
    has_image_after BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_report_images (
    id BIGINT NOT NULL AUTO_INCREMENT,
    report_id BIGINT NOT NULL,
    image_type VARCHAR(16) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    image_data MEDIUMBLOB NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_maintenance_report_image (report_id, image_type),
    CONSTRAINT fk_maintenance_report_images_report
        FOREIGN KEY (report_id) REFERENCES maintenance_reports (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_schedules (
    id BIGINT NOT NULL AUTO_INCREMENT,
    shift_name VARCHAR(255),
    tech_name VARCHAR(255),
    area VARCHAR(255),
    is_online BOOLEAN,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    equipment_id BIGINT,
    equipment_code VARCHAR(255),
    equipment_name VARCHAR(255),
    equipment_room_name VARCHAR(255),
    technician_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    duration_minutes INT,
    status VARCHAR(32) NOT NULL,
    notes TEXT,
    result_notes TEXT,
    replaced_parts TEXT,
    completed_at DATETIME,
    has_evidence_image BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    KEY idx_maintenance_tasks_scheduled_date (scheduled_date),
    KEY idx_maintenance_tasks_status (status),
    CONSTRAINT fk_maintenance_tasks_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipments (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_tasks_technician
        FOREIGN KEY (technician_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_part_usages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    report_id BIGINT,
    maintenance_task_id BIGINT,
    part_name VARCHAR(255) NOT NULL,
    part_code VARCHAR(100),
    quantity DECIMAL(12, 3) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    unit_cost DECIMAL(14, 2) NOT NULL,
    supplier VARCHAR(255),
    document_number VARCHAR(100),
    PRIMARY KEY (id),
    KEY idx_part_usages_report (report_id),
    KEY idx_part_usages_task (maintenance_task_id),
    CONSTRAINT fk_part_usages_report
        FOREIGN KEY (report_id) REFERENCES maintenance_reports (id),
    CONSTRAINT fk_part_usages_task
        FOREIGN KEY (maintenance_task_id) REFERENCES maintenance_tasks (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_task_images (
    task_id BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    image_data MEDIUMBLOB NOT NULL,
    PRIMARY KEY (task_id),
    CONSTRAINT fk_maintenance_task_images_task
        FOREIGN KEY (task_id) REFERENCES maintenance_tasks (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
