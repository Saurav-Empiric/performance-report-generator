"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReview, useReviewsByEmployee } from "@/hooks";
import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmployeeFeedbackProps {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeDepartment?: string;
}

export function EmployeeFeedback({
  employeeId,
  employeeName,
  employeeRole,
  employeeDepartment
}: EmployeeFeedbackProps) {
  const [newReview, setNewReview] = useState("");
  const [category, setCategory] = useState("Performance");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch reviews for this employee using TanStack Query
  const {
    data: employeeReviews = [],
    isLoading,
    isError,
    refetch
  } = useReviewsByEmployee(employeeId);

  // Create review mutation
  const { mutate: submitReview, isPending: isSubmitting } = useCreateReview({
    onSuccess: () => {
      refetch();
    }
  });

  const handleSubmitReview = () => {
    if (!newReview.trim() || isSubmitting) return;

    // Create a new review
    submitReview({
      content: newReview,
      timestamp: new Date(),
      targetEmployee: employeeId,
      category: category
    });

    // Clear the input
    setNewReview("");
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

  // Categories for feedback
  const categories = [
    "Performance",
    "Leadership",
    "Teamwork",
    "Communication",
    "Technical Skills",
    "Attitude"
  ];

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Performance": "bg-blue-100 text-blue-800",
      "Leadership": "bg-purple-100 text-purple-800",
      "Teamwork": "bg-green-100 text-green-800",
      "Communication": "bg-yellow-100 text-yellow-800",
      "Technical Skills": "bg-indigo-100 text-indigo-800",
      "Attitude": "bg-pink-100 text-pink-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Scroll to bottom when reviews change or when a new review is added
  useEffect(() => {
    if (!isLoading && !isError) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [employeeReviews, isLoading, isError]);

  return (
    <div className="flex flex-col h-full w-full max-h-full overflow-hidden">
      {/* Employee Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://avatar.vercel.sh/${employeeId}`} />
            <AvatarFallback>{employeeName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{employeeName}</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">{employeeRole}</p>
              {employeeDepartment && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-sm text-gray-500">{employeeDepartment}</p>
                </>
              )}
            </div>
          </div>
          <Badge className="ml-auto">
            {employeeReviews.length} {employeeReviews.length === 1 ? 'review' : 'reviews'}
          </Badge>
        </div>
      </div>

      {/* Reviews List - Scrollable middle section */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-red-500" />
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading reviews</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div ref={messagesEndRef} />
            {employeeReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews have been added yet</p>
                <p className="text-sm text-gray-400 mt-2">Provide first feedback</p>
              </div>
            ) : (
              // Display reviews in reverse chronological order (newest at bottom)
              [...employeeReviews]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((review) => (
                  <div
                    key={review._id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm mb-2">{review.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(review.timestamp)}
                      </p>
                      {review.category && (
                        <Badge
                          className={getCategoryColor(review.category)}
                          variant="outline"
                        >
                          {review.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex items-center gap-2 border-t bg-white p-4">
        <div className="flex-1">
          <Textarea
            id="review"
            placeholder="Write your feedback here..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="min-h-[80px] max-h-[120px] resize-none"
            disabled={isSubmitting}
          />
        </div>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={handleSubmitReview}
          disabled={isSubmitting || !newReview.trim()}
        >
          {isSubmitting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}