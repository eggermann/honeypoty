-- Honeypoty Database Schema

CREATE DATABASE IF NOT EXISTS honeypoty;
USE honeypoty;

-- Table for email spaces
CREATE TABLE IF NOT EXISTS email_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_last_activity (last_activity)
);

-- Table for incoming emails
CREATE TABLE IF NOT EXISTS emails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    space_id INT NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject TEXT,
    body TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES email_spaces(id) ON DELETE CASCADE,
    INDEX idx_space_id (space_id),
    INDEX idx_sender (sender_email)
);

-- Insert the initial space
INSERT INTO email_spaces (email, is_active) 
VALUES ('start@honeypoty.de', TRUE)
ON DUPLICATE KEY UPDATE email = email;
