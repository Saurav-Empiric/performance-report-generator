import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Users, Star, TrendingUp, Flag, Activity } from "lucide-react";

// Mock data for the dashboard
const topPerformers = [
  { id: "1", name: "John Doe", role: "Software Engineer", rating: 9.2, department: "Engineering" },
  { id: "2", name: "Jane Smith", role: "Product Manager", rating: 8.9, department: "Product" },
  { id: "3", name: "Michael Brown", role: "UI/UX Designer", rating: 8.7, department: "Design" },
];

const departmentStats = [
  { name: "Engineering", averageRating: 7.8, employees: 12 },
  { name: "Product", averageRating: 8.1, employees: 8 },
  { name: "Design", averageRating: 8.5, employees: 6 },
  { name: "Marketing", averageRating: 7.5, employees: 5 },
];

const stats = {
  totalEmployees: 31,
  averageRating: 7.9,
  totalReviews: 124,
  pendingReviews: 15,
};

export default function Dashboard() {
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
      
      {/* Charts and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest rated employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((employee) => (
                <div key={employee.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
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
            </div>
          </CardContent>
        </Card>
      </div>
      
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
          <div className="space-y-4">
            {topPerformers.map((employee, i) => (
              <div key={i} className="flex gap-3 items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{employee.name} received a new review</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Rated {employee.rating}/10 by a colleague in {employee.department}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(Date.now() - 1000 * 60 * 60 * (i + 1) * 2).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 