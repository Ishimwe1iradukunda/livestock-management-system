CREATE TABLE production_records (
  id BIGSERIAL PRIMARY KEY,
  animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  product_type VARCHAR(50) NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL,
  production_date DATE NOT NULL,
  quality_grade VARCHAR(20),
  price_per_unit DOUBLE PRECISION DEFAULT 0,
  total_value DOUBLE PRECISION DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_production_records_animal_id ON production_records(animal_id);
CREATE INDEX idx_production_records_date ON production_records(production_date);
CREATE INDEX idx_production_records_product_type ON production_records(product_type);
