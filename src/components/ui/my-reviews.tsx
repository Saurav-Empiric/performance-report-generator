"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  content: string;
  timestamp: Date;
  targetEmployee: {
    id: string;
    name: string;
    role: string;
  };
}

interface MyReviewsProps {
  reviews: Review[];
}

export function MyReviews({ reviews }: MyReviewsProps) {
  // If no reviews provided, use empty array as fallback
  const userReviews = reviews || [];

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
      <p className="text-gray-600 mb-6">
        Reviews you have given to other employees
      </p>

      <div className="space-y-6">
        {userReviews.length > 0 ? (
          userReviews.map((review) => (
            <Card key={review.id} className="border">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${review.targetEmployee.id}`} />
                  <AvatarFallback>{review.targetEmployee.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{review.targetEmployee.name}</CardTitle>
                  <p className="text-sm text-gray-600">{review.targetEmployee.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm mb-1">{review.content}</p>
                  <p className="text-xs text-gray-500">
                    {review.timestamp.toLocaleString()}
                  </p>
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