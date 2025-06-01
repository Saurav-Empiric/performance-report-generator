import { Employee } from '@/types';

// Fetch all employees
export const fetchEmployees = async (): Promise<Employee[]> => {
    const response = await fetch('/api/employees');
    if (!response.ok) {
        throw new Error('Failed to fetch employees');
    }
    return response.json();
};

// Fetch assigned employees for authenticated employee
export const fetchAssignedEmployees = async (): Promise<{currentEmployee: Employee, assignedReviewees: Employee[]}> => {
    const response = await fetch('/api/employees/assigned');
    if (!response.ok) {
        throw new Error('Failed to fetch assigned employees');
    }
    return response.json();
};

// Fetch an employee by ID
export const fetchEmployeeById = async (id: string): Promise<Employee> => {
    const response = await fetch(`/api/employees/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch employee');
    }
    return response.json();
};

// Create a new employee
export const createEmployee = async (employee: Omit<Employee, '_id'>): Promise<Employee> => {
    const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
    });
    if (!response.ok) {
        throw new Error('Failed to create employee');
    }
    return response.json();
};

// Invite an employee
export const inviteEmployee = async (employeeData: { 
    email: string; 
    name: string; 
    role: string; 
    department_id?: string;
}): Promise<{ message: string }> => {
    const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite employee');
    }
    
    return response.json();
};

// Update an employee
export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<Employee> => {
    const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
    });
    if (!response.ok) {
        throw new Error('Failed to update employee');
    }
    return response.json();
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete employee');
    }
    return response.json();
};
