-- Add soft delete support to all tables
-- This migration adds is_deleted flag and created_by/updated_by columns for audit trail

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_by UUID;

ALTER TABLE stock_entries ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE stock_entries ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE stock_entries ADD COLUMN IF NOT EXISTS updated_by UUID;

ALTER TABLE cheques ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE cheques ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE cheques ADD COLUMN IF NOT EXISTS updated_by UUID;

ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS updated_by UUID;

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_expenses_is_deleted ON expenses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_stock_entries_is_deleted ON stock_entries(is_deleted);
CREATE INDEX IF NOT EXISTS idx_cheques_is_deleted ON cheques(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sales_is_deleted ON sales(is_deleted);
CREATE INDEX IF NOT EXISTS idx_vendors_is_deleted ON vendors(is_deleted);

-- Add foreign key constraints for created_by and updated_by
ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE stock_entries
  ADD CONSTRAINT fk_stock_created_by FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE stock_entries
  ADD CONSTRAINT fk_stock_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE cheques
  ADD CONSTRAINT fk_cheques_created_by FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE cheques
  ADD CONSTRAINT fk_cheques_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE sales
  ADD CONSTRAINT fk_sales_created_by FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE sales
  ADD CONSTRAINT fk_sales_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE vendors
  ADD CONSTRAINT fk_vendors_created_by FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE vendors
  ADD CONSTRAINT fk_vendors_updated_by FOREIGN KEY (updated_by) REFERENCES employees(id) ON DELETE SET NULL;
