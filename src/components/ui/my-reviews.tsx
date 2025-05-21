"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

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
  targetEmployee: Employee | string;
  reviewedBy?: Employee | string;
  rating?: number;
  category?: string;
}

interface MyReviewsProps {
  reviews: Review[];
}

export function MyReviews({ reviews }: MyReviewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const userReviews = reviews || [];

  const getEmployeeName = (employee: any): string => {
    if (!employee) return "Unknown";
    if (typeof employee === "string") return "Employee " + employee.substring(0, 5);
    return employee.name || "Unnamed";
  };

  const getEmployeeRole = (employee: any): string => {
    if (!employee) return "";
    if (typeof employee === "string") return "Employee";
    return employee.role || "";
  };

  const getEmployeeId = (employee: any): string => {
    if (!employee) return "unknown";
    if (typeof employee === "string") return employee;
    return employee._id || "unknown";
  };

  const getEmployeeDepartment = (employee: any): string | undefined => {
    if (!employee || typeof employee === "string") return undefined;
    return employee.department;
  };

  const filteredReviews = userReviews.filter((review) => {
    const matchesSearch =
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getEmployeeName(review.targetEmployee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.category && review.category.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && review.category === activeTab;
  });

  const categories = Array.from(
    new Set(userReviews.map(review => review.category).filter(Boolean))
  ) as string[];

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

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Card className="border shadow-none flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-xl">My Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                {categories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category} value={category} className="flex-1">
                    {category}
                  </TabsTrigger>
                ))}
                {categories.length > 3 && (
                  <TabsTrigger value="more" className="flex-1">More</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          {/* Reviews List with ScrollArea */}
          <div className="flex-1 flex flex-col min-h-0">
            {userReviews.length > 0 ? (
              <>
                {filteredReviews.length > 0 ? (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-4 pr-4">
                      {filteredReviews.map((review) => (
                        <Card key={review._id} className="border hover:shadow-md transition-shadow">
                          <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://avatar.vercel.sh/${getEmployeeId(review.targetEmployee)}`} />
                              <AvatarFallback>{getEmployeeName(review.targetEmployee)[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle className="text-lg">{getEmployeeName(review.targetEmployee)}</CardTitle>
                                {review.category && (
                                  <Badge
                                    className={`${getCategoryColor(review.category)} mt-1 sm:mt-0`}
                                    variant="outline"
                                  >
                                    {review.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-1 sm:gap-2">
                                <p>{getEmployeeRole(review.targetEmployee)}</p>
                                {getEmployeeDepartment(review.targetEmployee) && (
                                  <>
                                    <span className="hidden sm:inline">•</span>
                                    <p>{getEmployeeDepartment(review.targetEmployee)}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-lg p-3 bg-gray-50">
                              <p className="text-sm">{review.content}</p>
                              <div className="flex justify-between items-center mt-3">
                                <p className="text-xs text-gray-500">
                                  {formatDate(review.timestamp)}
                                </p>
                                {review.rating && (
                                  <div className="flex items-center">
                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                      Rating: {review.rating}/5
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">No reviews found matching your search</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <p className="text-gray-500">You haven't given any reviews yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Select an employee from the sidebar to provide your first review
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
