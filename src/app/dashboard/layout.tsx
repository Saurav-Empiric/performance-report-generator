"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, LayoutDashboard, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Organization Portal</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" 
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${
                  isActive("/dashboard") ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/reports" 
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${
                  isActive("/dashboard/reports") ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                Reports
              </Link>
            </li>
            <li>
              <Link href="/dashboard/employees" 
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${
                  isActive("/dashboard/employees") ? "bg-gray-100 font-medium" : ""
                }`}
              >
                <Users className="h-5 w-5" />
                Employees
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-md">
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 