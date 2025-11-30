-- Create customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    username VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(255),
    date_of_birth VARCHAR(255),
    occupation VARCHAR(255)
);

-- Create transactions table (if not exists)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    customer_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create bills table (if not exists)
CREATE TABLE IF NOT EXISTS bills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    due_date DATE NOT NULL,
    category VARCHAR(255),
    recurring BOOLEAN DEFAULT false,
    frequency VARCHAR(255),
    status VARCHAR(255) DEFAULT 'pending',
    paid_date DATE,
    customer_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create budgets table (if not exists)
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    limit NUMERIC(19, 2) NOT NULL,
    period VARCHAR(255),
    customer_id BIGINT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create savings table (if not exists)
CREATE TABLE IF NOT EXISTS savings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(255) NOT NULL,
    balance NUMERIC(19, 2) NOT NULL,
    interest_rate NUMERIC(5, 2),
    goal NUMERIC(19, 2),
    description TEXT,
    customer_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create saving_transactions table (if not exists)
CREATE TABLE IF NOT EXISTS saving_transactions (
    id BIGSERIAL PRIMARY KEY,
    saving_id BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (saving_id) REFERENCES savings(id) ON DELETE CASCADE
);
