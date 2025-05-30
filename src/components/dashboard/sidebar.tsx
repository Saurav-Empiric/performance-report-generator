"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

interface SidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, isLoggingOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button - Only visible on mobile */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop - Only visible when sidebar is open on mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - Fixed on all screens, transforms off-canvas on mobile when closed */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r shadow-sm flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Organization Portal</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link href="/organization/dashboard"
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${isActive("/dashboard") ? "bg-gray-100 font-medium" : ""
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/organization/reports"
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${isActive("/dashboard/reports") ? "bg-gray-100 font-medium" : ""
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                Reports
              </Link>
            </li>
            <li>
              <Link href="/organization/employees"
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${isActive("/dashboard/employees") ? "bg-gray-100 font-medium" : ""
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-5 w-5" />
                Employees
              </Link>
            </li>
            <li>
              <Link href="/organization/settings"
                className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 ${isActive("/dashboard/organization") ? "bg-gray-100 font-medium" : ""
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-5 w-5" />
                Organization Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <Button
            className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-md w-full justify-start"
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className={`${isLoggingOut ? 'animate-bounce' : 'animate-none'} h-5 w-5`} />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </>
  );
} 