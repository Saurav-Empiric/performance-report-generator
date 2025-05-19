"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Search, Filter, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for employees
const employees = [
  {
    id: "1",
    name: "John Doe",
    role: "Software Engineer",
    department: "Engineering",
    rating: 9.2,
    reviewCount: 14,
    reviewDistribution: [0, 0, 0, 0, 0, 0, 1, 3, 5, 5],
    performanceHistory: [8.4, 8.7, 9.0, 9.2],
    strengths: ["Problem solving", "Technical expertise", "Team collaboration"],
    areasForImprovement: ["Documentation", "Time management"]
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Product Manager",
    department: "Product",
    rating: 8.9,
    reviewCount: 12,
    reviewDistribution: [0, 0, 0, 0, 0, 0, 1, 3, 6, 2],
    performanceHistory: [8.0, 8.4, 8.7, 8.9],
    strengths: ["Communication", "Leadership", "Stakeholder management"],
    areasForImprovement: ["Technical knowledge", "Delegation"]
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "UI/UX Designer",
    department: "Design",
    rating: 8.7,
    reviewCount: 10,
    reviewDistribution: [0, 0, 0, 0, 0, 0, 2, 1, 5, 2],
    performanceHistory: [8.1, 8.3, 8.5, 8.7],
    strengths: ["Creativity", "User-centric thinking", "Visual communication"],
    areasForImprovement: ["Presenting to stakeholders", "Project timelines"]
  },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);

  // Filter employees based on search query and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Employee Performance Reports</h1>

        <Button variant="outline" className="flex items-center gap-2 self-end">
          <Download className="h-4 w-4" />
          Export Reports
        </Button>
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
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
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
              {filteredEmployees.length} employees found
            </CardDescription>
          </CardHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${selectedEmployee.id === employee.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-gray-100 border border-transparent"
                    }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${employee.id}`} />
                    <AvatarFallback>{employee.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{employee.name}</p>
                    <p className="text-sm text-gray-500 truncate">{employee.role}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="h-3 w-3" />
                    {employee.rating}
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Employee Details */}
        <Card className="lg:col-span-2 h-[700px] overflow-hidden flex flex-col">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={`https://avatar.vercel.sh/${selectedEmployee.id}`} />
                <AvatarFallback>{selectedEmployee.name[0]}</AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-xl">{selectedEmployee.name}</CardTitle>
                <CardDescription>{selectedEmployee.role} • {selectedEmployee.department}</CardDescription>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="text-2xl font-bold text-yellow-600">{selectedEmployee.rating}</div>
                <div className="text-sm text-gray-500">/ 10</div>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">Performance History</TabsTrigger>
                <TabsTrigger value="details">Detailed Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Rating Distribution</CardTitle>
                      <CardDescription>Based on {selectedEmployee.reviewCount} reviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedEmployee.reviewDistribution.map((count, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-6 text-sm text-right">{i + 1}</div>
                            <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{
                                  width: `${count > 0 ? (count / Math.max(...selectedEmployee.reviewDistribution)) * 100 : 0}%`
                                }}
                              />
                            </div>
                            <div className="w-6 text-sm">{count}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEmployee.strengths.map((strength) => (
                          <li key={strength} className="text-sm">
                            {strength}
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
                        {selectedEmployee.areasForImprovement.map((area) => (
                          <li key={area} className="text-sm">
                            {area}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance History</CardTitle>
                    <CardDescription>Quarterly ratings (out of 10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <div className="h-full w-full flex items-end justify-around p-4">
                        {selectedEmployee.performanceHistory.map((rating, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 w-full">
                            <div className="w-full max-w-[60px] bg-blue-500 rounded-t-md relative"
                              style={{
                                height: `${(rating / 10) * 100}%`,
                                backgroundColor: rating > 8 ? '#10B981' :
                                  rating > 7 ? '#3B82F6' :
                                    rating > 6 ? '#F59E0B' : '#EF4444'
                              }}
                            >
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap">
                                {rating}
                              </div>
                            </div>
                            <div className="text-xs mt-2">Q{i + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detailed Feedback</CardTitle>
                    <CardDescription>Anonymous feedback from colleagues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm italic">"Always delivers high-quality code and is very helpful when team members have questions."</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">From Engineering Department</div>
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm italic">"Great team player who always steps up when needed. Communication could be more proactive at times."</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">From Product Department</div>
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <div className="h-3 w-3 text-gray-300">
                              <Star className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm italic">"Extremely knowledgeable and always willing to help. A truly valuable team member."</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">From Design Department</div>
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
} 