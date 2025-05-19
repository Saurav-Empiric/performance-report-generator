"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { EmployeeFeedback } from "@/components/ui/employee-feedback";
import { MyReviews } from "@/components/ui/my-reviews";

// Mock data for employees
const mockEmployees = [
  { id: "1", name: "John Doe", role: "Software Engineer" },
  { id: "2", name: "Jane Smith", role: "Product Manager" },
  { id: "3", name: "Michael Brown", role: "UI/UX Designer" },
  { id: "4", name: "Sarah Johnson", role: "Data Analyst" },
  { id: "5", name: "Robert Wilson", role: "Marketing Specialist" },
];

// Mock data for reviews
const mockReviews = [
  {
    id: "101",
    content: "Great team player and always delivers on time.",
    timestamp: new Date(2023, 10, 15),
    targetEmployee: { id: "1", name: "John Doe", role: "Software Engineer" },
  },
  {
    id: "102",
    content: "Excellent communication skills and project management.",
    timestamp: new Date(2023, 11, 20),
    targetEmployee: { id: "2", name: "Jane Smith", role: "Product Manager" },
  },
];

interface Employee {
  id: string;
  name: string;
  role: string;
}

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMyReviews, setViewMyReviews] = useState(false);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMyReviews(false);
  };

  const handleViewMyReviews = () => {
    setViewMyReviews(true);
    setSelectedEmployee(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-4">
        <h1 className="text-2xl text-red-700 font-bold text-center mb-6">
          Employee Performance Feedback System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-lg overflow-hidden">
          {/* Sidebar - 1/4 of the width */}
          <div className="md:col-span-1 border-r min-h-[80vh]">
            <Sidebar
              employees={mockEmployees}
              onSelectEmployee={handleSelectEmployee}
              onViewMyReviews={handleViewMyReviews}
            />
          </div>
          
          {/* Main content - 3/4 of the width */}
          <div className="md:col-span-2 lg:col-span-3 min-h-[80vh]">
            {!selectedEmployee && !viewMyReviews ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <h2 className="text-xl font-semibold mb-2">Welcome to the Performance Feedback System</h2>
                  <p className="text-gray-600">
                    Select an employee from the list to provide feedback or view your reviews.
                  </p>
                </div>
              </div>
            ) : viewMyReviews ? (
              <MyReviews reviews={mockReviews} />
            ) : (
              selectedEmployee && (
                <EmployeeFeedback
                  employeeId={selectedEmployee.id}
                  employeeName={selectedEmployee.name}
                  employeeRole={selectedEmployee.role}
                />
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
