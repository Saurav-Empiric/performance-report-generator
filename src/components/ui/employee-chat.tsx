"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Feedback {
  id: string;
  type: "good" | "bad";
  content: string;
  timestamp: Date;
  from: string;
  accepted: boolean;
}

interface EmployeeChatProps {
  employeeId: string;
  employeeName: string;
  onFeedbackUpdate: (feedback: Feedback[]) => void;
}

export function EmployeeChat({ employeeId, employeeName, onFeedbackUpdate }: EmployeeChatProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"good" | "bad">("good");

  useEffect(() => {
    onFeedbackUpdate(feedback);
  }, [feedback, onFeedbackUpdate]);

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim()) return;

    const newFeedbackItem: Feedback = {
      id: Date.now().toString(),
      type: feedbackType,
      content: newFeedback,
      timestamp: new Date(),
      from: "Current User", // Replace with actual user
      accepted: false,
    };

    setFeedback([...feedback, newFeedbackItem]);
    setNewFeedback("");
  };

  const handleAcceptFeedback = (feedbackId: string) => {
    setFeedback(
      feedback.map((item) =>
        item.id === feedbackId ? { ...item, accepted: true } : item
      )
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 p-4 border-b">
        <Avatar>
          <AvatarImage src={`https://avatar.vercel.sh/${employeeId}`} />
          <AvatarFallback>{employeeName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{employeeName}</h2>
          <p className="text-sm text-muted-foreground">Performance Feedback</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {feedback.map((item) => (
          <Card
            key={item.id}
            className={`p-4 max-w-[80%] ${
              item.type === "good" ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.from}</p>
                <p className="mt-1">{item.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {item.timestamp.toLocaleString()}
                </p>
              </div>
              {!item.accepted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAcceptFeedback(item.id)}
                >
                  Accept
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          <Button
            variant={feedbackType === "good" ? "default" : "outline"}
            onClick={() => setFeedbackType("good")}
            className="flex-1"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Good Point
          </Button>
          <Button
            variant={feedbackType === "bad" ? "default" : "outline"}
            onClick={() => setFeedbackType("bad")}
            className="flex-1"
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Bad Point
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your feedback..."
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSubmitFeedback}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 