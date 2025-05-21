"use client";

import { useState } from "react";
import { useEmployees, useReviews } from "@/hooks";
import { Sidebar } from "@/components/ui/sidebar";
import { EmployeeFeedback } from "@/components/ui/employee-feedback";
import { MyReviews } from "@/components/ui/my-reviews";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";
import { Employee } from "@/types";

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMyReviews, setViewMyReviews] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // TanStack Query hooks for data fetching
  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
    refetch: refetchEmployees
  } = useEmployees();

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews
  } = useReviews();

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMyReviews(false);
  };

  const handleViewMyReviews = () => {
    setViewMyReviews(true);
    setSelectedEmployee(null);
  };

  const handleRetry = () => {
    refetchEmployees();
    refetchReviews();
    setErrorDialogOpen(false);
  };

  // Show error dialog if any fetch fails
  const hasError = employeesError || reviewsError;
  if (hasError && !errorDialogOpen) {
    setErrorDialogOpen(true);
  }

  // loading state
  const isLoading = employeesLoading || reviewsLoading;

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b z-10 flex-shrink-0">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-700">
              Employee Performance Feedback
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  refetchEmployees();
                  refetchReviews();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <div className="md:col-span-3 lg:col-span-3 bg-white rounded-lg shadow h-full overflow-hidden">
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 md:h-12 w-6 md:w-12 border-t-2 border-b-2 border-red-500" />
              </div>
            )}
            <Sidebar
              employees={employees}
              onSelectEmployee={handleSelectEmployee}
              onViewMyReviews={handleViewMyReviews}
              selectedEmployeeId={selectedEmployee?._id}
            />
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9 lg:col-span-9 bg-white rounded-lg shadow h-full overflow-hidden">
            {!selectedEmployee && !viewMyReviews ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 max-w-md">
                  <h2 className="text-2xl font-semibold mb-4">Welcome to the Performance Feedback System</h2>
                  <p className="text-gray-600 mb-6">
                    This platform allows you to provide constructive feedback to team members
                    and track your own feedback history.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => handleViewMyReviews()}>
                      View My Reviews
                    </Button>
                    <Button variant="outline" onClick={() => employees.length > 0 && handleSelectEmployee(employees[0])}>
                      Start Giving Feedback
                    </Button>
                  </div>
                </div>
              </div>
            ) : viewMyReviews ? (
              <MyReviews reviews={reviews as any} />
            ) : (
              selectedEmployee && (
                <EmployeeFeedback
                  employeeId={selectedEmployee._id}
                  employeeName={selectedEmployee.name}
                  employeeRole={selectedEmployee.role}
                  employeeDepartment={selectedEmployee.department}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was a problem loading data from the server. Please check your connection and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetry}>Try Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
