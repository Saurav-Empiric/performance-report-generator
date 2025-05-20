"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Search, User, Mail, Building, Loader2 } from "lucide-react";
import { useCreateEmployee, useDeleteEmployee, useEmployees } from "@/hooks";
import { Employee } from "@/types";
import { toast } from "sonner";

export default function EmployeesPage() {
  const { 
    data: employees = [], 
    isLoading, 
    error 
  } = useEmployees();
  
  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });
  
  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
      employee.role.toLowerCase().includes(searchLower) ||
      (employee.department && employee.department.toLowerCase().includes(searchLower))
    );
  });
  
  const handleAddEmployee = () => {
    // Basic validation
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role || !newEmployee.department) {
      toast("Please fill in all fields");
      return;
    }
    
    // Check for email format
    if (!isValidEmail(newEmployee.email)) {
      toast("Please enter a valid email address");
      return;
    }
    
    // Add new employee via mutation
    createEmployee({
      name: newEmployee.name,
      email: newEmployee.email,
      role: newEmployee.role,
      department: newEmployee.department
    }, {
      onSuccess: () => {
        // Reset form
        setNewEmployee({
          name: "",
          email: "",
          role: "",
          department: "",
        });
      },
      onError: (error) => {
        toast(`Failed to add employee: ${error.message}`);
      }
    });
  };
  
  const handleRemoveEmployee = (id: string) => {
    if (confirm("Are you sure you want to remove this employee?")) {
      deleteEmployee(id, {
        onSuccess: () => {
          toast("Employee deleted successfully");
        },
        onError: (error) => {
          toast.error(`Failed to delete employee: ${error.message}`);
        }
      });
    }
  };
  
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">There was a problem fetching the employee data.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Employees</h1>
        <div className="text-sm text-gray-500">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            `Total: ${employees.length} employees`
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Employee Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
            <CardDescription>Enter the details to add a new employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  className="pl-8"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  disabled={isCreating}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@company.com" 
                  className="pl-8"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  disabled={isCreating}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                placeholder="Software Engineer" 
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="department" 
                  placeholder="Engineering" 
                  className="pl-8"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  disabled={isCreating}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddEmployee} 
              className="w-full gap-2"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Employee
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Employee List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search employees..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-500">Loading employees...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div 
                      key={employee._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${employee._id}`} />
                          <AvatarFallback>{employee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                              {employee.role}
                            </span>
                            {employee.department && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {employee.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveEmployee(employee._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <p className="text-gray-500">No employees found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 