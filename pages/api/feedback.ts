import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const { product_id, order_id, feedback, rating } = req.body
  // Extract user id from Supabase JWT in Authorization header
  const authHeader = req.headers["authorization"] || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  let user_id = null
  if (token) {
    try {
      const decoded = jwt.decode(token)
      user_id = decoded?.sub || null
    } catch {}
  }
  // Validate UUID (simple regex)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!product_id || !order_id || !rating || !user_id || !uuidRegex.test(user_id)) {
    return res.status(400).json({
      error: "Missing or invalid fields",
      debug: {
        product_id,
        order_id,
        rating,
        user_id,
        user_id_valid: uuidRegex.test(user_id),
        token: authHeader,
        body: req.body
      }
    })
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    // Insert feedback (one per user/product/order)
    const { error: insertError } = await supabase.from("product_feedbacks").insert({
      product_id,
      user_id,
      order_id,
      feedback: feedback || null,
      rating,
    })
    if (insertError) {
      if (insertError.code === "23505") {
        return res.status(409).json({ error: "You have already submitted feedback for this product in this order." })
      }
      return res.status(500).json({ error: "Failed to submit feedback", details: insertError })
    }
    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: "Failed to submit feedback", details: e })
  }
}
