"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  Plus, 
  Trash2, 
  Settings, 
  User, 
  Loader2, 
  Save, 
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Organization } from "@/types";
import { 
  useAddDepartment,
  useCheckDepartmentInUse,
  useDeleteDepartment,
  useOrganization,
  useUpdateOrganization
} from "@/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import queryKeys from "@/constants/QueryKeys";

// Default organization data for new installations
const DEFAULT_ORG_DATA: Organization = {
  name: "My Organization",
  email: "contact@organization.com",
  phone: "",
  address: "",
  logoUrl: "",
  departments: []
};

export default function OrganizationPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState(tabParam === "departments" ? "departments" : "profile");
  const [newDepartment, setNewDepartment] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [departmentInUseError, setDepartmentInUseError] = useState<string | null>(null);
  
  // Queries and Mutations
  const { 
    data: organization = DEFAULT_ORG_DATA, 
    isLoading, 
    error: fetchError 
  } = useOrganization();

  const { mutate: updateOrganization, isPending: isUpdating } = useUpdateOrganization({
    onSuccess: () => {
      toast.success("Organization profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update organization profile");
      console.error(error);
    }
  });

  const { mutate: addDepartment, isPending: isAddingDepartment } = useAddDepartment({
    onSuccess: () => {
      toast.success("Department added successfully");
      setNewDepartment("");
    },
    onError: (error) => {
      toast.error("Failed to add department");
      console.error(error);
    }
  });

  const { mutate: deleteDepartment, isPending: isDeletingDepartment } = useDeleteDepartment({
    onSuccess: () => {
      toast.success("Department removed successfully");
      setDepartmentToDelete(null);
      setDepartmentInUseError(null);
    },
    onError: (error) => {
      toast.error("Failed to remove department");
      setDepartmentInUseError("Could not delete department. It may be in use by employees.");
      console.error(error);
    }
  });

  // Fetch department usage info when a department is selected for deletion
  const { data: departmentUsage, refetch: checkDepartmentUsage, isLoading: isCheckingUsage } = 
    useCheckDepartmentInUse(departmentToDelete || '', {
      enabled: !!departmentToDelete,
    });
    
  // Check if department is in use when usage data changes
  useEffect(() => {
    if (departmentUsage) {
      if (departmentUsage.inUse) {
        setDepartmentInUseError("This department cannot be deleted as it is already assigned to employee.");
      } else {
        setDepartmentInUseError(null);
      }
    }
  }, [departmentUsage]);

  // When a new department is selected for deletion
  useEffect(() => {
    if (departmentToDelete) {
      // Force a refetch of the department usage data
      checkDepartmentUsage();
    }
  }, [departmentToDelete, checkDepartmentUsage]);
  
  // Local state for form edits
  const [formData, setFormData] = useState<Organization>(DEFAULT_ORG_DATA);
  
  // Update local form data when org data is loaded
  useEffect(() => {
    if (organization) {
      setFormData(organization);
    }
  }, [organization]);
  
  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam === "departments") {
      setActiveTab("departments");
    } else if (tabParam === "profile") {
      setActiveTab("profile");
    }
  }, [tabParam]);

  // Handle adding a department with immediate UI update
  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast("Please enter a department name");
      return;
    }
    
    if (organization.departments.includes(newDepartment.trim())) {
      toast("This department already exists");
      return;
    }
    
    // Before the API call, manually update the UI for immediate feedback
    const departmentToAdd = newDepartment.trim();
    if (organization) {
      const updatedDepartments = [...organization.departments, departmentToAdd];
      
      // Update the cache for immediate UI change
      queryClient.setQueryData([queryKeys.organization], {
        ...organization,
        departments: updatedDepartments
      });
    }
    
    // Clear input for better UX
    setNewDepartment("");
    
    // Call the mutation
    addDepartment(departmentToAdd, {
      onError: (error) => {
        console.error("Failed to add department:", error);
        // Revert to server data on error
        queryClient.invalidateQueries({
          queryKey: [queryKeys.organization]
        });
        toast.error("Failed to add department");
      }
    });
  };
  
  // Handle removing a department
  const handleRemoveDepartment = (department: string) => {
    setDepartmentToDelete(department);
    setDepartmentInUseError(null);
  };
  
  // Confirm department deletion
  const confirmDeleteDepartment = () => {
    if (departmentToDelete) {
      // Check if department is in use
      if (departmentUsage?.inUse) {
        setDepartmentInUseError("This department cannot be deleted as it is already assigned to employee.");
        return;
      }
      
      // Delete the department
      deleteDepartment(departmentToDelete, {
        onSuccess: () => {
          // Ensure UI is updated by manually updating the local organization data
          if (organization) {
            const updatedDepartments = organization.departments.filter(
              dept => dept !== departmentToDelete
            );
            
            // Manually update the cache with the updated department list
            queryClient.setQueryData([queryKeys.organization], {
              ...organization,
              departments: updatedDepartments
            });
            
            // Also force a refetch to ensure everything is in sync
            queryClient.invalidateQueries({
              queryKey: [queryKeys.organization]
            });
          }
          
          // Close the dialog and show success message
          setDepartmentToDelete(null);
          toast.success("Department removed successfully");
        },
        onError: (error) => {
          console.error("Failed to delete department:", error);
          setDepartmentInUseError("Failed to delete department. It may be in use or there was a server error.");
        }
      });
    }
  };
  
  // Handle organization profile update
  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Organization name and email are required");
      return;
    }
    
    updateOrganization({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      logoUrl: formData.logoUrl
    });
  };

  // Error state
  const error = fetchError ? "Failed to load organization data. Please try again later." : null;

  // Show error if data failed to load
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-center text-gray-600 max-w-md mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const isSaving = isUpdating || isAddingDepartment || isDeletingDepartment;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-500">Loading organization settings...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="w-full md:w-auto h-auto p-0 bg-transparent gap-4">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-2 data-[state=active]:text-primary data-[state=active]:font-semibold"
              >
                <User className="h-4 w-4 mr-2" />
                Organization Profile
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-2 data-[state=active]:text-primary data-[state=active]:font-semibold"
              >
                <Building className="h-4 w-4 mr-2" />
                Departments
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Organization Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Update your organization's information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name*</Label>
                    <Input
                      id="org-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Organization Name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Contact Email*</Label>
                    <Input
                      id="org-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@organization.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-phone">Phone Number</Label>
                    <Input
                      id="org-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="org-address">Address</Label>
                    <Input
                      id="org-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Business Ave, Suite 100, San Francisco, CA 94107"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="org-logo">Organization Logo URL</Label>
                    <Input
                      id="org-logo"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6 mt-4">
                <Button
                  onClick={handleUpdateProfile}
                  className="gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Add Department</CardTitle>
                  <CardDescription>
                    Create a new department for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-department">Department Name</Label>
                      <Input
                        id="new-department"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        placeholder="Enter department name"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleAddDepartment}
                    className="w-full gap-2"
                    disabled={isSaving}
                  >
                    {isAddingDepartment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Department
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Manage Departments</CardTitle>
                  <CardDescription>
                    View and manage your organization's departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    {organization.departments && organization.departments.length > 0 ? (
                      <div className="divide-y">
                        {organization.departments.map((department, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Building className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{department}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveDepartment(department)}
                              disabled={isDeletingDepartment}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Building className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No departments yet</p>
                        <p className="text-sm">Add your first department to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Departments are used when adding employees to your organization
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Department Delete Confirmation Dialog */}
      <AlertDialog open={!!departmentToDelete} onOpenChange={(open) => !open && setDepartmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department <strong>{departmentToDelete}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isCheckingUsage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Checking if department can be deleted...</span>
            </div>
          )}
          
          {departmentInUseError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3 text-red-800 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>{departmentInUseError}</div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDepartment}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDepartment}
              disabled={isDeletingDepartment || isCheckingUsage || !!departmentInUseError}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeletingDepartment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Department"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 