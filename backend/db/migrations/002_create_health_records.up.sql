CREATE TABLE health_records (
  id BIGSERIAL PRIMARY KEY,
  animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccination', 'treatment', 'checkup', 'illness', 'injury', 'medication')),
  description TEXT NOT NULL,
  veterinarian VARCHAR(100),
  cost DOUBLE PRECISION DEFAULT 0,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX idx_health_records_date ON health_records(record_date);
CREATE INDEX idx_health_records_type ON health_records(record_type);
