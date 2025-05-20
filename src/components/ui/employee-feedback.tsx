"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview, useReviewsByEmployee } from "@/hooks";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EmployeeFeedbackProps {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
}

export function EmployeeFeedback({
  employeeId,
  employeeName,
  employeeRole,
}: EmployeeFeedbackProps) {
  const [newPoint, setNewPoint] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch reviews for this employee using TanStack Query
  const {
    data: employeeReviews = [],
    isLoading,
    isError
  } = useReviewsByEmployee(employeeId);

  // Create review mutation
  const { mutate: submitReview, isPending: isSubmitting } = useCreateReview();

  const handleSubmitPoint = () => {
    if (!newPoint.trim() || isSubmitting) return;

    // Create a new review
    submitReview({
      content: newPoint,
      timestamp: new Date(),
      targetEmployee: employeeId,
      category: 'Performance' // Default category
    });

    // Clear the input
    setNewPoint("");
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Scroll to bottom when reviews change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [employeeReviews]);

  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://avatar.vercel.sh/${employeeId}`} />
          <AvatarFallback>{employeeName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">{employeeName}</h2>
          <p className="text-gray-600">{employeeRole}</p>
        </div>
      </div>

      {/* Reviews List */}
      <Card className="flex-1 mb-4 p-4 border overflow-auto">
        <h3 className="font-semibold mb-2 text-right">Performance Reviews</h3>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500" />
          </div>
        ) : isError ? (
          <p className="text-red-500 text-center py-2">
            Error loading reviews. Please try again.
          </p>
        ) : (
          <div className="flex flex-col-reverse space-y-3 space-y-reverse">
            {employeeReviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm mb-1">{review.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {formatDate(review.timestamp)}
                  </p>
                  {review.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {review.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {employeeReviews.length === 0 && (
              <p className="text-gray-500 text-center py-2">
                No reviews have been added yet
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Input Area */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Write a performance review..."
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            className="flex-1 min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={handleSubmitPoint}
            disabled={isSubmitting || !newPoint.trim()}
          >
            {isSubmitting ? (
              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
