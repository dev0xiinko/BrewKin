import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const { product_id, feedback, rating } = req.body
  // TODO: Replace with real user id from session/auth
  const user_id = req.cookies["user_id"] || "anonymous"
  if (!product_id || !feedback || !rating) {
    return res.status(400).json({ error: "Missing fields" })
  }
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("product_feedbacks").insert({
      product_id,
      user_id,
      feedback,
      rating,
    })
    if (error) throw error
    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: "Failed to submit feedback" })
  }
}
