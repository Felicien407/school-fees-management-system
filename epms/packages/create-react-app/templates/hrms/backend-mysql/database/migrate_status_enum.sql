-- Run after schema.sql if upgrading an existing HRMS database
USE HRMS;

ALTER TABLE employees
  MODIFY emp_status ENUM(
    'Active',
    'On Leave',
    'Left',
    'Blacklisted',
    'Deceased',
    'On Mission'
  ) NOT NULL DEFAULT 'Active';
