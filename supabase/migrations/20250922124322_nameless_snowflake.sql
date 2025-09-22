/*
  # Create notifications system

  1. New Tables
    - `notifications`
      - `id` (bigserial, primary key)
      - `type` (varchar, notification type)
      - `title` (varchar, notification title)
      - `message` (text, notification message)
      - `priority` (varchar, priority level)
      - `entity_id` (bigint, optional reference to related entity)
      - `entity_type` (varchar, type of related entity)
      - `action_url` (varchar, optional action URL)
      - `is_read` (boolean, read status)
      - `read_at` (timestamp, when read)
      - `scheduled_for` (timestamp, when to show notification)
      - `created_at` (timestamp, creation time)

  2. Security
    - No RLS needed for notifications (internal system)

  3. Indexes
    - Index on is_read for quick filtering
    - Index on priority for sorting
    - Index on scheduled_for for scheduled notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('health_reminder', 'feed_alert', 'production_milestone', 'financial_alert', 'system_alert')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  entity_id BIGINT,
  entity_type VARCHAR(50) CHECK (entity_type IN ('animal', 'feed', 'health_record', 'production_record')),
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);