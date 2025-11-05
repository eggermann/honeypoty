#!/bin/bash

# Honeypoty Database Setup Script

echo "Setting up Honeypoty database..."

# Check if MySQL is running
if ! systemctl is-active --quiet mysql 2>/dev/null && ! service mysql status > /dev/null 2>&1; then
    echo "MySQL is not running. Please start MySQL first."
    exit 1
fi

# Prompt for MySQL credentials if not provided
if [ -z "$DB_USER" ]; then
    read -p "Enter MySQL username (default: root): " DB_USER
    DB_USER=${DB_USER:-root}
fi

if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter MySQL password: " DB_PASSWORD
    echo
fi

# Create database and tables
echo "Creating database and tables..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS honeypoty;
USE honeypoty;

CREATE TABLE IF NOT EXISTS email_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_last_activity (last_activity)
);

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

INSERT INTO email_spaces (email, is_active) 
VALUES ('start@honeypoty.de', TRUE)
ON DUPLICATE KEY UPDATE email = email;
EOF

if [ $? -eq 0 ]; then
    echo "Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.example to .env and configure your database credentials"
    echo "2. Run: npm install"
    echo "3. Run: npm start"
else
    echo "Database setup failed. Please check your MySQL credentials."
    exit 1
fi
