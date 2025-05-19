"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Feedback {
  id: string;
  type: "good" | "bad";
  content: string;
  timestamp: Date;
  from: string;
  accepted: boolean;
}

interface PerformanceReportProps {
  employeeId: string;
  employeeName: string;
  feedback: Feedback[];
}

export function PerformanceReport({
  employeeId,
  employeeName,
  feedback,
}: PerformanceReportProps) {
  const acceptedFeedback = feedback.filter((f) => f.accepted);
  const goodPoints = acceptedFeedback.filter((f) => f.type === "good");
  const badPoints = acceptedFeedback.filter((f) => f.type === "bad");

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://avatar.vercel.sh/${employeeId}`} />
          <AvatarFallback>{employeeName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{employeeName}</h1>
          <p className="text-muted-foreground">Performance Report</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Good Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goodPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 rounded-lg bg-green-50 border border-green-100"
                >
                  <p className="text-sm font-medium text-green-800">
                    {point.from}
                  </p>
                  <p className="mt-1 text-green-900">{point.content}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {point.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
              {goodPoints.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No good points yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {badPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-4 rounded-lg bg-red-50 border border-red-100"
                >
                  <p className="text-sm font-medium text-red-800">
                    {point.from}
                  </p>
                  <p className="mt-1 text-red-900">{point.content}</p>
                  <p className="text-xs text-red-600 mt-2">
                    {point.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
              {badPoints.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No areas for improvement yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium">Total Feedback</p>
              <p className="text-2xl font-bold">{acceptedFeedback.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-sm font-medium text-green-800">Good Points</p>
              <p className="text-2xl font-bold text-green-900">
                {goodPoints.length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50">
              <p className="text-sm font-medium text-red-800">
                Areas for Improvement
              </p>
              <p className="text-2xl font-bold text-red-900">
                {badPoints.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 