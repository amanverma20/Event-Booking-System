-- Schema for Smart Event Booking (MySQL)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(30),
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(200) NOT NULL,
  date DATETIME NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  img VARCHAR(500),
  category VARCHAR(50),
  organizer VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date_is_active (date, is_active),
  INDEX idx_location (location),
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('confirmed','cancelled','pending') NOT NULL DEFAULT 'confirmed',
  payment_id VARCHAR(100),
  qr_code LONGTEXT,
  CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_status (event_id, status),
  INDEX idx_email (email),
  INDEX idx_booking_date (booking_date)
);


