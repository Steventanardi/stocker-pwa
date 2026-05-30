-- Create the items table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  barcode TEXT,
  sku TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  currency TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  selling_price NUMERIC,
  min_quantity NUMERIC,
  location TEXT,
  notes TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create inventory_categories table
CREATE TABLE IF NOT EXISTS inventory_categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create transaction_categories table
CREATE TABLE IF NOT EXISTS transaction_categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  description TEXT,
  related_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create the budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Create the savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  currency TEXT NOT NULL,
  target_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to prevent conflicts when rerunning
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view their own savings_goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert their own savings_goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings_goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings_goals" ON savings_goals;

DROP POLICY IF EXISTS "Users can view their own inv categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can insert their own inv categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can update their own inv categories" ON inventory_categories;
DROP POLICY IF EXISTS "Users can delete their own inv categories" ON inventory_categories;

DROP POLICY IF EXISTS "Users can view their own txn categories" ON transaction_categories;
DROP POLICY IF EXISTS "Users can insert their own txn categories" ON transaction_categories;
DROP POLICY IF EXISTS "Users can update their own txn categories" ON transaction_categories;
DROP POLICY IF EXISTS "Users can delete their own txn categories" ON transaction_categories;

-- Create policies for each table
CREATE POLICY "Users can view their own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own savings_goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings_goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings_goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings_goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own inv categories" ON inventory_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inv categories" ON inventory_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inv categories" ON inventory_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inv categories" ON inventory_categories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own txn categories" ON transaction_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own txn categories" ON transaction_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own txn categories" ON transaction_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own txn categories" ON transaction_categories FOR DELETE USING (auth.uid() = user_id);
