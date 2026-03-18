"use client"

import { useEffect, useState } from "react"
import { fetchProductFeedbacks } from "@/lib/queries"

interface ProductFeedbackListProps {
  productId: string
}

export default function ProductFeedbackList({ productId }: ProductFeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchProductFeedbacks(productId, 1, 3).then(res => {
      if (mounted) {
        setFeedbacks(res.feedbacks)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [productId])

  if (loading) return <div className="text-sm text-muted-foreground">Loading feedback...</div>
  if (!feedbacks.length) return <div className="text-sm text-muted-foreground">No feedback yet.</div>

  return (
    <div className="space-y-4 mt-4">
      <div className="font-semibold text-base mb-2">Customer Feedback</div>
      {feedbacks.map(fb => (
        <div key={fb.id} className="border rounded p-3 bg-background">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{fb.user_id.slice(0, 8)}</span>
            <span className="text-yellow-500 text-lg">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
              ))}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ""}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{fb.feedback}</div>
        </div>
      ))}
    </div>
  )
}
