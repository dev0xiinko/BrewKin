-- Overhauled product feedbacks table
DROP TABLE IF EXISTS product_feedbacks CASCADE;

CREATE TABLE product_feedbacks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    feedback TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id, order_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_product_order ON product_feedbacks(user_id, product_id, order_id);
