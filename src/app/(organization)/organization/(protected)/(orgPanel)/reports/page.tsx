"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeReports, useEmployees, useGenerateReport } from "@/hooks";
import { Employee } from "@/types";
import { CalendarIcon, Filter, Loader2, Search, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Generate formatted months for the last 12 months
const getMonthOptions = () => {
  const options = [];
  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const formatted = `${year}-${month}`;

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const label = `${monthNames[date.getMonth()]} ${year}`;

    options.push({ value: formatted, label });
  }

  return options;
};

const monthOptions = getMonthOptions();

export default function ReportsPage() {
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  // State for selected employee
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch reports for the selected employee
  const {
    data: employeeReports = [],
    isLoading: reportsLoading
  } = useEmployeeReports(
    selectedEmployee?._id || '',
    {
      enabled: !!selectedEmployee
    }
  );

  // Generate report mutation
  const {
    mutate: generateReport,
    isPending: isGenerating
  } = useGenerateReport({
    onSuccess: () => {
      toast.success(`Report generated for ${selectedEmployee?.name}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Handle generate report
  const handleGenerateReport = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    generateReport({
      employeeId: selectedEmployee._id,
      month: selectedMonth
    });
  };

  // Find the report for the selected month
  const selectedMonthReport = employeeReports.find(report => report.month === selectedMonth);

  // Filter employees based on search query and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" ||
      (employee.department === departmentFilter);
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filtering
  const departments = [...new Set(employees
    .filter(e => e.department)
    .map(e => e.department))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Employee Performance Reports</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={employeesLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
                disabled={employeesLoading}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept as string}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two column layout: employee list and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card className="lg:col-span-1 h-[700px] overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              {employeesLoading
                ? "Loading employees..."
                : `${filteredEmployees.length} employees found`}
            </CardDescription>
          </CardHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {employeesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${selectedEmployee?._id === employee._id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-gray-100 border border-transparent"
                      }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${employee._id}`} />
                      <AvatarFallback>{employee.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{employee.name}</p>
                      <p className="text-sm text-gray-500 truncate">{employee.role}</p>
                    </div>

                    {employeeReports.some(r => r.employeeId === employee._id) && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3" />
                        Reports
                      </div>
                    )}
                  </div>
                ))}

                {filteredEmployees.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No employees found
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Employee Reports */}
        <Card className="lg:col-span-2 h-[700px] overflow-hidden flex flex-col">
          {!selectedEmployee ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an employee to view reports
            </div>
          ) : reportsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedMonthReport ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedEmployee._id}`} />
                    <AvatarFallback>{selectedEmployee.name[0]}</AvatarFallback>
                  </Avatar>

                  <div>
                    <CardTitle className="text-xl">{selectedEmployee.name}</CardTitle>
                    <CardDescription>
                      {selectedEmployee.role} {selectedEmployee.department ? `• ${selectedEmployee.department}` : ''}
                    </CardDescription>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-2xl font-bold text-yellow-600">{selectedMonthReport.ranking}</div>
                    <div className="text-sm text-gray-500">/ 10</div>
                  </div>
                </div>
              </CardHeader>

              <div className="flex-1 overflow-y-auto p-4">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Detailed Report</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedMonthReport.qualities.map((quality, i) => (
                              <li key={i} className="text-sm">
                                {quality}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedMonthReport.improvements.map((area, i) => (
                              <li key={i} className="text-sm">
                                {area}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Performance Summary</CardTitle>
                        <CardDescription>
                          Generated report for {monthOptions.find(m => m.value === selectedMonthReport.month)?.label}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg bg-gray-50">
                            <p className="text-sm">
                              {selectedMonthReport.summary}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <h3 className="text-lg font-medium mb-2">No Report Available</h3>
              <p className="text-gray-500 text-center mb-6">
                No performance report is available for {selectedEmployee.name} for {" "}
                {monthOptions.find(m => m.value === selectedMonth)?.label}.
              </p>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 