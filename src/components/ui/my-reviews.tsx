"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Employee {
  _id: string;
  name: string;
  role: string;
  department?: string;
}

interface Review {
  _id: string;
  content: string;
  timestamp: Date;
  targetEmployee: Employee;
  reviewedBy?: Employee;
  rating?: number;
  category?: string;
}

interface MyReviewsProps {
  reviews: Review[];
}

export function MyReviews({ reviews }: MyReviewsProps) {
  // If no reviews provided, use empty array as fallback
  const userReviews = reviews || [];

  // Format the date to be displayed in a readable format
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

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
      <p className="text-gray-600 mb-6">
        Reviews you have given to other employees
      </p>

      <div className="space-y-6">
        {userReviews.length > 0 ? (
          userReviews.map((review) => (
            <Card key={review._id} className="border">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${review.targetEmployee._id}`} />
                  <AvatarFallback>{review.targetEmployee.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{review.targetEmployee.name}</CardTitle>
                  <p className="text-sm text-gray-600">{review.targetEmployee.role}</p>
                  {review.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {review.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm mb-1">{review.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {formatDate(review.timestamp)}
                    </p>
                    {review.rating && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600 mr-1">Rating:</span>
                        <span className="text-xs font-medium">{review.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500">You haven't given any reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 