"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function OrderProductReview({ productId }: { productId: string }) {
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitFeedback = async () => {
    if (!productId || !feedbackText || !feedbackRating) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          feedback: feedbackText,
          rating: feedbackRating,
        }),
      })
      if (!res.ok) {
        let msg = "Could not submit feedback"
        try {
          const data = await res.json()
          if (data && data.error) msg = data.error
        } catch {}
        toast.error(msg)
        setSubmitting(false)
        return
      }
      setFeedbackText("")
      setFeedbackRating(null)
      setSubmitted(true)
      toast.success("Feedback submitted!")
    } catch (e) {
      toast.error("Could not submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return <div className="mt-4 text-green-600 text-sm">Thank you for your review!</div>
  }

  return (
    <div className="mt-4 border rounded bg-background p-4">
      <h3 className="font-semibold mb-2">Leave a Review</h3>
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map((star) => {
          const isActive = typeof feedbackRating === 'number' && star <= feedbackRating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setFeedbackRating(star)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              disabled={submitting}
              style={{
                color: isActive ? '#facc15' : '#d1d5db',
                background: 'none',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                padding: 0,
                fontSize: '2rem',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
            >
              ★
            </button>
          );
        })}
      </div>
      <Textarea
        value={feedbackText}
        onChange={e => setFeedbackText(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="mb-2"
        disabled={submitting}
      />
      <Button
        size="sm"
        onClick={submitFeedback}
        disabled={submitting || !feedbackText || !feedbackRating}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  )
}
