"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SidebarProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onViewMyReviews: () => void;
}

interface Employee {
  _id: string;
  name: string;
  role: string;
  department?: string;
}

export function Sidebar({ employees, onSelectEmployee, onViewMyReviews }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);

  // Update filtered employees when employees prop changes
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleSearch = () => {
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  return (
    <div className="w-full h-full border-r p-4 flex flex-col">
      <div className="flex gap-2 mb-4 items-center">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value === "") {
              setFilteredEmployees(employees);
            } else {
              handleSearch();
            }
          }}
          className="flex-1 border-gray-300"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>

      <Card className="mb-4 p-4 border cursor-default">
        <h2 className="font-semibold mb-2">Employees</h2>
        <div className="max-h-60 overflow-y-auto">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div
                key={employee._id}
                className="py-2 px-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => onSelectEmployee(employee)}
              >
                {employee.name}
                {employee.department && (
                  <span className="text-xs text-gray-500 block">
                    {employee.department}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No employees found</div>
          )}
        </div>
      </Card>

      <Card
        className="mb-4 p-4 border cursor-pointer hover:bg-gray-50"
        onClick={onViewMyReviews}
      >
        <h2 className="font-semibold">
          My Reviews
        </h2>
      </Card>

      <div className="mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start font-semibold" 
          onClick={() => console.log("Logout clicked")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 