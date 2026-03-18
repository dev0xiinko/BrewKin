-- Create table for star reviews (general, for landing page)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for product feedbacks (linked to products)
CREATE TABLE IF NOT EXISTS product_feedbacks (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES profiles(id),
    feedback TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on product feedbacks
CREATE INDEX IF NOT EXISTS idx_product_feedbacks_product_id ON product_feedbacks(product_id);
