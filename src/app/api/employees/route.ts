import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Employee from '@/lib/models/employee';

// GET all employees
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const employees = await Employee.find({}).select('_id name role department').sort({ name: 1 });
    
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST to create a new employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: 'Name and role are required fields' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const newEmployee = new Employee(body);
    await newEmployee.save();
    
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
} 