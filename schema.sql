-- DukanDiary - Textile Retail Management System
-- Supabase PostgreSQL Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gst_number VARCHAR(15) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STOCK ENTRIES TABLE
-- ============================================================================
CREATE TABLE stock_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL CHECK (unit IN ('metres', 'pieces')),
  rate_per_unit DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CHEQUES TABLE
-- ============================================================================
CREATE TABLE cheques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_issued DATE NOT NULL,
  cheque_number VARCHAR(20) NOT NULL UNIQUE,
  bank_name VARCHAR(100) NOT NULL,
  payee VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  purpose TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Issued', 'Cleared', 'Bounced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SALES TABLE
-- ============================================================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('daily', 'monthly', 'yearly')),
  total_amount DECIMAL(12, 2) NOT NULL,
  cash_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  upi_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SETTINGS TABLE
-- ============================================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  pin VARCHAR(4) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('manager', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(50) NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name VARCHAR(255),
  table_name VARCHAR(100),
  record_id UUID,
  changes JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Employees indexes
CREATE INDEX idx_employees_pin ON employees(pin);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Audit Log indexes
CREATE INDEX idx_audit_log_employee_id ON audit_log(employee_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- Stock Entries indexes
CREATE INDEX idx_stock_entries_date ON stock_entries(date DESC);
CREATE INDEX idx_stock_entries_vendor_id ON stock_entries(vendor_id);
CREATE INDEX idx_stock_entries_created_at ON stock_entries(created_at DESC);

-- Expenses indexes
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_payment_mode ON expenses(payment_mode);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);

-- Cheques indexes
CREATE INDEX idx_cheques_date_issued ON cheques(date_issued DESC);
CREATE INDEX idx_cheques_due_date ON cheques(due_date);
CREATE INDEX idx_cheques_status ON cheques(status);
CREATE INDEX idx_cheques_created_at ON cheques(created_at DESC);

-- Sales indexes
CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_sales_period_type ON sales(period_type);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);

-- Settings indexes
CREATE INDEX idx_settings_key ON settings(key);

-- Vendors indexes
CREATE INDEX idx_vendors_created_at ON vendors(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheques ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - VENDORS
-- ============================================================================

CREATE POLICY "vendors_read_policy" ON vendors
  FOR SELECT
  USING (true);

CREATE POLICY "vendors_create_policy" ON vendors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vendors_update_policy" ON vendors
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "vendors_delete_policy" ON vendors
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - STOCK ENTRIES
-- ============================================================================

CREATE POLICY "stock_entries_read_policy" ON stock_entries
  FOR SELECT
  USING (true);

CREATE POLICY "stock_entries_create_policy" ON stock_entries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "stock_entries_update_policy" ON stock_entries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "stock_entries_delete_policy" ON stock_entries
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - EXPENSES
-- ============================================================================

CREATE POLICY "expenses_read_policy" ON expenses
  FOR SELECT
  USING (true);

CREATE POLICY "expenses_create_policy" ON expenses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - CHEQUES
-- ============================================================================

CREATE POLICY "cheques_read_policy" ON cheques
  FOR SELECT
  USING (true);

CREATE POLICY "cheques_create_policy" ON cheques
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "cheques_update_policy" ON cheques
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cheques_delete_policy" ON cheques
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - SALES
-- ============================================================================

CREATE POLICY "sales_read_policy" ON sales
  FOR SELECT
  USING (true);

CREATE POLICY "sales_create_policy" ON sales
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "sales_update_policy" ON sales
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "sales_delete_policy" ON sales
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - SETTINGS
-- ============================================================================

CREATE POLICY "settings_read_policy" ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "settings_create_policy" ON settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "settings_update_policy" ON settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "settings_delete_policy" ON settings
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - EMPLOYEES
-- ============================================================================

CREATE POLICY "employees_read_policy" ON employees
  FOR SELECT
  USING (true);

CREATE POLICY "employees_create_policy" ON employees
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "employees_update_policy" ON employees
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "employees_delete_policy" ON employees
  FOR DELETE
  USING (true);

-- ============================================================================
-- RLS POLICIES - AUDIT LOG
-- ============================================================================

CREATE POLICY "audit_log_read_policy" ON audit_log
  FOR SELECT
  USING (true);

CREATE POLICY "audit_log_create_policy" ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('default_email_recipient', 'owner@dukandiary.com'),
  ('default_pin', '1234'),
  ('business_name', 'VS Kumaraswamy Reddiar'),
  ('expense_categories', 'Rent,Utilities,Salary,Marketing,Supplies,Transportation,Insurance,Maintenance,Office Equipment,Professional Fees,Licenses,Other')
  ON CONFLICT (key) DO NOTHING;

-- Insert employees with PIN authentication
INSERT INTO employees (name, pin, role, is_active) VALUES
  ('Alwar', '3745', 'manager', true),
  ('Hari', '2145', 'staff', true),
  ('Vijay', '1861', 'staff', true),
  ('Jagadeesh', '9383', 'staff', true),
  ('Raman', '2245', 'staff', true)
  ON CONFLICT (pin) DO NOTHING;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE vendors IS 'Vendor/Supplier information for textile purchases';
COMMENT ON TABLE stock_entries IS 'Daily stock entries from vendors with item details and costs';
COMMENT ON TABLE expenses IS 'Business expense tracking with categories and payment methods';
COMMENT ON TABLE cheques IS 'Cheque register for tracking issued, cleared, and bounced cheques';
COMMENT ON TABLE sales IS 'Daily/monthly/yearly sales records with payment method breakdown';
COMMENT ON TABLE settings IS 'Application configuration and settings';
COMMENT ON TABLE employees IS 'Employee/User management with PIN-based authentication';
COMMENT ON TABLE audit_log IS 'Audit trail tracking all CREATE, UPDATE, DELETE, and LOGIN actions';

COMMENT ON COLUMN vendors.gst_number IS 'GST Registration Number (unique per vendor)';
COMMENT ON COLUMN stock_entries.unit IS 'Unit of measurement: metres or pieces';
COMMENT ON COLUMN expenses.payment_mode IS 'Payment method: Cash, UPI, or Bank';
COMMENT ON COLUMN cheques.status IS 'Status of cheque: Issued, Cleared, or Bounced';
COMMENT ON COLUMN sales.period_type IS 'Type of sales record: daily, monthly, or yearly';

-- ============================================================================
-- NOTE: RLS POLICIES
-- ============================================================================
-- The current RLS policies allow unrestricted access (true for all conditions).
-- For a production system with multiple users, modify policies to:
--   USING (auth.uid() = user_id)  -- Restrict to authenticated users
--   USING (auth.uid() IN (SELECT user_id FROM team_members ...))  -- Team access
-- You'll need to add a user_id or team_id column to tables and set up
-- Supabase authentication accordingly.
-- ============================================================================
