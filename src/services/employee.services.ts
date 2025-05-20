import { Employee } from '@/types';

// Fetch all employees
export const fetchEmployees = async (): Promise<Employee[]> => {
    const response = await fetch('/api/employees');
    if (!response.ok) {
        throw new Error('Failed to fetch employees');
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
