"use client";

import { useState, useEffect } from "react";
import { useReviews, useAssignedEmployees } from "@/hooks";
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
  // We don't need to set current user ID manually anymore - it comes from auth
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Use the new assigned employees hook for authenticated employee view
  const {
    data: assignedData,
    isLoading: assignedLoading,
    isError: assignedError,
    refetch: refetchAssigned
  } = useAssignedEmployees();

  // Extract current employee and assigned reviewees from the response
  const currentEmployee = assignedData?.currentEmployee;
  const employees = assignedData?.assignedReviewees || [];

  // Set current user ID from the authenticated employee data
  useEffect(() => {
    if (currentEmployee && !currentUserId) {
      setCurrentUserId(currentEmployee._id);
    }
  }, [currentEmployee, currentUserId]);

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
    refetchAssigned();
    refetchReviews();
    setErrorDialogOpen(false);
  };

  // Show error dialog if any fetch fails
  const hasError = assignedError || reviewsError;
  if (hasError && !errorDialogOpen) {
    setErrorDialogOpen(true);
  }

  // loading state
  const isLoading = assignedLoading || reviewsLoading;

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
              {/* No longer need user selection dropdown as we're using auth */}
              {currentEmployee && (
                <div className="text-sm font-medium">
                  Welcome, {currentEmployee.name}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  refetchAssigned();
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
              currentUserId={currentUserId}
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
                  currentUserId={currentUserId}
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
