"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeedbackPoint {
  id: string;
  content: string;
  timestamp: Date;
  from: string;
}

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
  const [feedback, setFeedback] = useState<FeedbackPoint[]>([]);
  const [newPoint, setNewPoint] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmitPoint = () => {
    if (!newPoint.trim()) return;

    const newPointItem: FeedbackPoint = {
      id: Date.now().toString(),
      content: newPoint,
      timestamp: new Date(),
      from: "Current User",
    };

    setFeedback((prev) => [...prev, newPointItem]);
    setNewPoint("");
  };

  // Scroll to bottom when feedback changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedback]);

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

      {/* Messages List */}
      <Card className="flex-1 mb-4 p-4 border overflow-auto">
        <h3 className="font-semibold mb-2 text-right">Points</h3>
        <div className="flex flex-col-reverse space-y-3 space-y-reverse">
          {feedback.map((point) => (
            <div key={point.id} className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm mb-1">{point.content}</p>
              <p className="text-xs text-gray-500">
                {point.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-gray-500 text-center py-2">
              No points have been added yet
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Input Area */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="User will write and enters the performance points here..."
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            className="flex-1 min-h-[100px] resize-none"
          />
          <Button size="icon" className="h-10 w-10 rounded-full" onClick={handleSubmitPoint}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
