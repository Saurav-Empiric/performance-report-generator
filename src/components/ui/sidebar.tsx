"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User } from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  role: string;
  department?: string;
}

interface SidebarProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onViewMyReviews: () => void;
  selectedEmployeeId?: string;
}

export function Sidebar({
  employees,
  onSelectEmployee,
  onViewMyReviews,
  selectedEmployeeId
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="font-semibold text-lg mb-4">Team Members</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* My Reviews Button */}
      <div className="p-2 border-b flex-shrink-0">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 hover:bg-gray-100"
          onClick={onViewMyReviews}
        >
          <User className="h-4 w-4" />
          <span>My Reviews</span>
        </Button>
      </div>

      {/* Employees List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <button
                  key={employee._id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${selectedEmployeeId === employee._id
                      ? "bg-gray-100 font-medium"
                      : "hover:bg-gray-50"
                    }`}
                  onClick={() => onSelectEmployee(employee)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${employee._id}`} />
                    <AvatarFallback>{employee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs text-gray-500">{employee.role}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center">
                <p className="text-gray-500">No employees found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
