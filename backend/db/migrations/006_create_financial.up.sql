CREATE TABLE financial_records (
  id BIGSERIAL PRIMARY KEY,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category VARCHAR(50) NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  animal_id BIGINT REFERENCES animals(id),
  payment_method VARCHAR(50),
  receipt_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_records_type ON financial_records(transaction_type);
CREATE INDEX idx_financial_records_category ON financial_records(category);
CREATE INDEX idx_financial_records_date ON financial_records(transaction_date);
CREATE INDEX idx_financial_records_animal_id ON financial_records(animal_id);
