CREATE TABLE feeding_schedules (
  id BIGSERIAL PRIMARY KEY,
  animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  feed_type VARCHAR(100) NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  frequency VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feeding_records (
  id BIGSERIAL PRIMARY KEY,
  animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  feed_type VARCHAR(100) NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  feeding_date DATE NOT NULL,
  cost DOUBLE PRECISION DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feeding_schedules_animal_id ON feeding_schedules(animal_id);
CREATE INDEX idx_feeding_records_animal_id ON feeding_records(animal_id);
CREATE INDEX idx_feeding_records_date ON feeding_records(feeding_date);
