"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { EmployeeFeedback } from "@/components/ui/employee-feedback";
import { MyReviews } from "@/components/ui/my-reviews";
import { useEmployees, useReviews } from "@/hooks";
import { Employee, Review } from "@/types";

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMyReviews, setViewMyReviews] = useState(false);

  // TanStack Query hooks for data fetching
  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError
  } = useEmployees();

  const {
    data: reviews = [],
    isLoading: reviewsLoading
  } = useReviews();

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMyReviews(false);
  };

  const handleViewMyReviews = () => {
    setViewMyReviews(true);
    setSelectedEmployee(null);
  };

  // Determine loading and error states
  const isLoading = employeesLoading;
  const error = employeesError ? 'Error loading employees data. Please try again later.' : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-4">
        <h1 className="text-2xl text-red-700 font-bold text-center mb-6">
          Employee Performance Feedback System
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-lg overflow-hidden">
          {/* Sidebar*/}
          <div className="md:col-span-1 border-r min-h-[80vh]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 md:h-12 w-6 md:w-12 border-t-2 border-b-2 border-red-500" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <Sidebar
                employees={employees}
                onSelectEmployee={handleSelectEmployee}
                onViewMyReviews={handleViewMyReviews}
              />
            )}
          </div>

          {/* Main content*/}
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
              reviewsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 md:h-12 w-6 md:w-12 border-t-2 border-b-2 border-red-500" />
                </div>
              ) : (
                <MyReviews reviews={reviews} />
              )
            ) : (
              selectedEmployee && (
                <EmployeeFeedback
                  employeeId={selectedEmployee._id}
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
