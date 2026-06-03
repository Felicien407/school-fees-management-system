-- Run if upgrading an existing HRMS database to exam status values
USE HRMS;

UPDATE employees SET emp_status = 'On Mission' WHERE emp_status = 'Active';

ALTER TABLE employees
  MODIFY emp_status ENUM(
    'On Leave',
    'Left',
    'Blacklisted',
    'Deceased',
    'On Mission'
  ) NOT NULL;
