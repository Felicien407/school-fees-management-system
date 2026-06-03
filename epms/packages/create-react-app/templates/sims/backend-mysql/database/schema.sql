CREATE DATABASE IF NOT EXISTS SIMS;
USE SIMS;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(120) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_spare_name_category (name, category)
);

CREATE TABLE IF NOT EXISTS stock_in (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spare_part_id INT NOT NULL,
  stock_in_quantity INT NOT NULL,
  stock_in_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_in_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
);

CREATE TABLE IF NOT EXISTS stock_out (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spare_part_id INT NOT NULL,
  stock_out_quantity INT NOT NULL,
  stock_out_unit_price DECIMAL(12,2) NOT NULL,
  stock_out_total_price DECIMAL(14,2) NOT NULL,
  stock_out_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_out_part FOREIGN KEY (spare_part_id) REFERENCES spare_parts(id)
);

INSERT INTO users (username, email, password_hash)
VALUES ('admin', 'admin@exam.local', '$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C')
ON DUPLICATE KEY UPDATE username=username;
