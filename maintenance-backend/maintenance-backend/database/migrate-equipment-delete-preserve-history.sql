USE smartschool_db;

ALTER TABLE maintenance_tasks
    MODIFY COLUMN equipment_id BIGINT NULL;
