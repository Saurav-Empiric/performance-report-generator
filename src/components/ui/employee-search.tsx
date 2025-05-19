"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface EmployeeSearchProps {
  onSelectEmployee: (employee: Employee) => void;
}

// Mock data - replace with actual API call
const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", role: "Software Engineer", department: "Engineering" },
  { id: "2", name: "Jane Smith", role: "Product Manager", department: "Product" },
  { id: "3", name: "Mike Johnson", role: "Designer", department: "Design" },
];

export function EmployeeSearch({ onSelectEmployee }: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);

  const handleSearch = () => {
    const results = mockEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search employees by name, role, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="space-y-4">
        {searchResults.map((employee) => (
          <Card
            key={employee.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onSelectEmployee(employee)}
          >
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
              <CardDescription>
                {employee.role} • {employee.department}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 