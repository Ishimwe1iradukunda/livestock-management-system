CREATE TABLE animals (
  id BIGSERIAL PRIMARY KEY,
  tag_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'quarantine')),
  weight DOUBLE PRECISION,
  color VARCHAR(50),
  notes TEXT,
  purchase_date DATE,
  purchase_price DOUBLE PRECISION,
  supplier VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_animals_tag_number ON animals(tag_number);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_status ON animals(status);
