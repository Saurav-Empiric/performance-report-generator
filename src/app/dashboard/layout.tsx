import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar component */}
      <DashboardSidebar />
      
      {/* Main content - with left padding for desktop to account for fixed sidebar */}
      <div className="pt-16 lg:pl-64 min-h-screen transition-all duration-300 ease-in-out">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 