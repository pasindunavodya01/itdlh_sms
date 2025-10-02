const db = require('./db');

const createAnnouncementsTables = () => {
  const announcementsTable = `
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      sender_id VARCHAR(255) NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      target_type ENUM('all', 'specific') DEFAULT 'all',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const recipientsTable = `
    CREATE TABLE IF NOT EXISTS announcement_recipients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      announcement_id INT NOT NULL,
      student_id VARCHAR(255) NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
      UNIQUE KEY unique_announcement_student (announcement_id, student_id)
    )
  `;

  db.query(announcementsTable, (err) => {
    if (err) {
      console.error('Error creating announcements table:', err);
    } else {
      console.log('Announcements table created successfully');
    }
  });

  db.query(recipientsTable, (err) => {
    if (err) {
      console.error('Error creating announcement_recipients table:', err);
    } else {
      console.log('Announcement_recipients table created successfully');
    }
  });
};

createAnnouncementsTables();
