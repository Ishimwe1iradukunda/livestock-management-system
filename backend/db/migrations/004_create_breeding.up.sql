CREATE TABLE breeding_records (
  id BIGSERIAL PRIMARY KEY,
  mother_id BIGINT NOT NULL REFERENCES animals(id),
  father_id BIGINT REFERENCES animals(id),
  breeding_date DATE NOT NULL,
  breeding_method VARCHAR(50) DEFAULT 'natural' CHECK (breeding_method IN ('natural', 'artificial')),
  expected_due_date DATE,
  actual_birth_date DATE,
  number_of_offspring INTEGER DEFAULT 0,
  breeding_notes TEXT,
  birth_notes TEXT,
  is_successful BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_breeding_records_mother ON breeding_records(mother_id);
CREATE INDEX idx_breeding_records_father ON breeding_records(father_id);
CREATE INDEX idx_breeding_records_breeding_date ON breeding_records(breeding_date);
