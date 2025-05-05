CREATE DATABASE IF NOT EXISTS customer_registration;
USE customer_registration;

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(10),
  dob DATE NOT NULL,
  address TEXT NOT NULL,
  password VARCHAR(255) NOT NULL,
  latitude VARCHAR(20),
  longitude VARCHAR(20),
  user_agent TEXT,
  platform VARCHAR(100),
  screen_resolution VARCHAR(20),
  submission_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);