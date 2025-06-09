"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BadgeCheck, Users, Star, TrendingUp, Flag, Activity, Trophy, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useBestEmployees, useGenerateMissingReports } from "@/hooks/reports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { toast } from "sonner";

// Mock data for the dashboard stats
const stats = {
  totalEmployees: 31,
  averageRating: 7.9,
  totalReviews: 124,
  pendingReviews: 15,
};

export default function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { 
    data: bestEmployeesData, 
    isLoading: isLoadingBestEmployees, 
    error: bestEmployeesError,
    refetch: refetchBestEmployees
  } = useBestEmployees();
  
  const generateMissingReportsMutation = useGenerateMissingReports({
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data.success) {
        toast.success("Reports generated successfully", {
          description: `Generated ${data.generatedReports.length} reports for the employee.`,
        });
        refetchBestEmployees();
      } else {
        toast.error("Some reports failed to generate", {
          description: `Generated ${data.generatedReports.length} reports, but ${data.failedMonths.length} failed.`,
        });
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error("Failed to generate reports", {
        description: error.message,
      });
    }
  });

  // Get all missing reports from all employees
  const getAllMissingReports = () => {
    if (!bestEmployeesData?.bestEmployees || bestEmployeesData.bestEmployees.length === 0) return [];
    
    const allMissing = [];
    
    for (const employee of bestEmployeesData.bestEmployees) {
      if (employee.missingMonths.length > 0) {
        allMissing.push({
          employeeId: employee.employee.id,
          employeeName: employee.employee.name,
          months: employee.missingMonths
        });
      }
    }
    
    return allMissing;
  };
  
  const missingReports = getAllMissingReports();
  const hasMissingReports = missingReports.length > 0;
  
  const handleGenerateAllMissingReports = () => {
    if (missingReports.length === 0) return;
    
    setIsGenerating(true);
    
    // Process each employee's missing reports sequentially
    const processNextEmployee = (index = 0) => {
      if (index >= missingReports.length) {
        setIsGenerating(false);
        refetchBestEmployees();
        toast.success("All missing reports generated successfully");
        return;
      }
      
      const { employeeId, employeeName, months } = missingReports[index];
      
      toast.info(`Generating reports for ${employeeName}...`, {
        duration: 2000,
      });
      
      generateMissingReportsMutation.mutate(
        { employeeId, months },
        {
          onSuccess: () => {
            // Process next employee
            processNextEmployee(index + 1);
          },
          onError: (error) => {
            toast.error(`Failed to generate reports for ${employeeName}`, {
              description: error.message,
            });
            // Continue with next employee despite error
            processNextEmployee(index + 1);
          }
        }
      );
    };
    
    processNextEmployee();
  };

  // Get only the top employee (best employee)
  const topEmployee = bestEmployeesData?.bestEmployees?.[0];

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-3xl font-bold">{stats.averageRating}<span className="text-sm font-normal">/10</span></p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-3xl font-bold">{stats.totalReviews}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <BadgeCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reviews</p>
              <p className="text-3xl font-bold">{stats.pendingReviews}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <Flag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Missing Reports Section */}
      {hasMissingReports ? (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle>Missing Performance Reports</CardTitle>
              </div>
              <Button 
                variant="default" 
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isGenerating}
                onClick={handleGenerateAllMissingReports}
              >
                {isGenerating ? "Generating..." : "Generate All Missing Reports"}
              </Button>
            </div>
            <CardDescription>
              All reports must be generated to determine the best employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-amber-800">Missing Reports Found</AlertTitle>
              <AlertDescription className="text-amber-700">
                There {missingReports.length === 1 ? 'is' : 'are'} {missingReports.length} {missingReports.length === 1 ? 'employee' : 'employees'} with missing reports for the past three completed months.
                Generate all missing reports to see who is the best performing employee in your organization.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-3">
              {missingReports.map((employee, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${employee.employeeId}`} />
                    <AvatarFallback>{employee.employeeName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{employee.employeeName}</p>
                    <p className="text-sm text-gray-600">
                      Missing reports: {employee.months.map(m => formatMonth(m)).join(', ')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {employee.months.length} {employee.months.length === 1 ? 'report' : 'reports'} missing
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Best Employee Card - Only shown when there are no missing reports */
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Best Performing Employee
                </CardTitle>
                <CardDescription>
                  Based on past three completed months performance ratings
                  {bestEmployeesData?.months && (
                    <span className="block text-xs mt-1">
                      Months considered: {bestEmployeesData.months.map(m => formatMonth(m)).join(', ')}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchBestEmployees()}
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bestEmployeesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load best employee data. Please try again.
                </AlertDescription>
              </Alert>
            ) : isLoadingBestEmployees ? (
              <div className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-20 rounded-full" />
              </div>
            ) : topEmployee ? (
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-yellow-500 shadow-lg">
                    <AvatarImage src={`https://avatar.vercel.sh/${topEmployee.employee.id}`} />
                    <AvatarFallback>{topEmployee.employee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    1
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold">{topEmployee.employee.name}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-600 mt-1">
                    <span>{topEmployee.employee.role}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{topEmployee.employee.department}</span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">Top Performer</Badge>
                    <Badge variant="outline" className="border-yellow-300">
                      {topEmployee.reportsCount}/3 months rated
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center h-20 w-20 bg-yellow-100 text-yellow-800 rounded-full">
                    <div className="text-center">
                      <Star className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xl font-bold">{topEmployee.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Average Rating</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No employee data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Activity and Recent Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest performance reviews and updates</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          {!hasMissingReports && bestEmployeesData?.bestEmployees && bestEmployeesData.bestEmployees.length > 0 ? (
            <div className="space-y-4">
              {bestEmployeesData.bestEmployees.slice(0, 3).map((item, i) => (
                <div key={i} className="flex gap-3 items-start border-b pb-4 last:border-0 last:pb-0">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{item.employee.name} received a new review</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Rated {item.avgRating.toFixed(1)}/10 in {item.employee.department}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(Date.now() - 1000 * 60 * 60 * (i + 1) * 2).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {hasMissingReports 
                  ? "Generate all missing reports to see recent activity" 
                  : "No recent activity available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 