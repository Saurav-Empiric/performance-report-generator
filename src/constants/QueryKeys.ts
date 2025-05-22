// Query keys
const queryKeys = {
    employees: 'employees',
    employee: (id: string) => ['employee', id],
    reviews: 'reviews',
    reviewsByEmployee: (employeeId: string) => ['reviews', 'employee', employeeId],
    reviewsByReviewer: (reviewerId: string) => ['reviews', 'reviewer', reviewerId],
    review: (id: string) => ['review', id],
    reports: 'reports',
    reportsByEmployee: (employeeId: string) => ['reports', employeeId],
    reportByEmployeeAndMonth: (employeeId: string, month: string) => ['reports', employeeId, month],
    organization: 'organization',
    departments: 'departments',
};

export default queryKeys;