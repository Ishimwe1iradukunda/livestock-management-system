-- Feed/Food inventory management
CREATE TABLE feeds (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hay', 'grain', 'pellets', 'supplement', 'mineral', 'concentrate', 'silage', 'pasture')),
  supplier VARCHAR(100),
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  cost_per_unit DOUBLE PRECISION DEFAULT 0,
  protein_percentage DOUBLE PRECISION DEFAULT 0,
  energy_value DOUBLE PRECISION DEFAULT 0, -- MJ/kg or similar
  fiber_percentage DOUBLE PRECISION DEFAULT 0,
  fat_percentage DOUBLE PRECISION DEFAULT 0,
  description TEXT,
  storage_location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feed inventory tracking
CREATE TABLE feed_inventory (
  id BIGSERIAL PRIMARY KEY,
  feed_id BIGINT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  quantity_on_hand DOUBLE PRECISION NOT NULL DEFAULT 0,
  reorder_level DOUBLE PRECISION DEFAULT 0,
  max_stock_level DOUBLE PRECISION DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Feed purchases/restocking
CREATE TABLE feed_purchases (
  id BIGSERIAL PRIMARY KEY,
  feed_id BIGINT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  supplier VARCHAR(100),
  quantity DOUBLE PRECISION NOT NULL,
  unit_cost DOUBLE PRECISION NOT NULL,
  total_cost DOUBLE PRECISION NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE,
  batch_number VARCHAR(50),
  invoice_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update feeding_records to reference feeds table
ALTER TABLE feeding_records 
ADD COLUMN feed_id BIGINT REFERENCES feeds(id),
ADD COLUMN nutritional_value JSONB DEFAULT '{}'; -- Store calculated nutritional info

-- Create indexes for performance
CREATE INDEX idx_feeds_type ON feeds(type);
CREATE INDEX idx_feeds_active ON feeds(is_active);
CREATE INDEX idx_feed_inventory_feed_id ON feed_inventory(feed_id);
CREATE INDEX idx_feed_purchases_feed_id ON feed_purchases(feed_id);
CREATE INDEX idx_feed_purchases_date ON feed_purchases(purchase_date);
CREATE INDEX idx_feeding_records_feed_id ON feeding_records(feed_id);

-- Create trigger to update feed inventory when purchases are made
CREATE OR REPLACE FUNCTION update_feed_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory when feed is purchased
  INSERT INTO feed_inventory (feed_id, quantity_on_hand, last_updated)
  VALUES (NEW.feed_id, NEW.quantity, NOW())
  ON CONFLICT (feed_id) 
  DO UPDATE SET 
    quantity_on_hand = feed_inventory.quantity_on_hand + NEW.quantity,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feed_inventory
  AFTER INSERT ON feed_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_inventory();

-- Create trigger to reduce inventory when feeding occurs
CREATE OR REPLACE FUNCTION reduce_feed_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduce inventory when feed is used for feeding
  IF NEW.feed_id IS NOT NULL THEN
    UPDATE feed_inventory 
    SET 
      quantity_on_hand = quantity_on_hand - NEW.quantity,
      last_updated = NOW()
    WHERE feed_id = NEW.feed_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reduce_feed_inventory
  AFTER INSERT ON feeding_records
  FOR EACH ROW
  EXECUTE FUNCTION reduce_feed_inventory();