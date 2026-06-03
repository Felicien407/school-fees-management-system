CREATE DATABASE IF NOT EXISTS HRMS;
USE HRMS;

CREATE TABLE IF NOT EXISTS departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  depart_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS positions (
  position_id INT AUTO_INCREMENT PRIMARY KEY,
  pos_name VARCHAR(100) NOT NULL UNIQUE,
  required_qualification VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  emp_first_name VARCHAR(60) NOT NULL,
  emp_last_name VARCHAR(60) NOT NULL,
  emp_gender ENUM('Male', 'Female') NOT NULL,
  emp_date_of_birth DATE NOT NULL,
  emp_email VARCHAR(120) NOT NULL UNIQUE,
  emp_telephone VARCHAR(20) NOT NULL,
  emp_address VARCHAR(255) NOT NULL,
  emp_hire_date DATE NOT NULL,
  emp_status ENUM('On Leave', 'Left', 'Blacklisted', 'Deceased', 'On Mission') NOT NULL,
  department_id INT NOT NULL,
  position_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(department_id),
  FOREIGN KEY (position_id) REFERENCES positions(position_id)
);

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  employee_id INT UNIQUE,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

INSERT INTO users (user_name, password)
VALUES ('admin', '$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C')
ON DUPLICATE KEY UPDATE user_name = user_name;
