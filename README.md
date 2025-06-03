# Employee Performance Feedback System

A Next.js application for managing employee performance feedback and reviews, built with Supabase and TanStack Query.

## Features

- View employees and their details
- Provide performance feedback for employees
- View reviews given to employees
- Generate AI-powered performance reports
- Organization authentication and management
- Optimized data fetching with TanStack Query
- Supabase database for data persistence

## Setup

### Prerequisites

- Node.js 18+
- Supabase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-performace-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials and Gemini API key:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

## Database Structure

The application uses Supabase with the following tables:

### Organization Table
```sql
create table public.organization (
  id uuid not null default gen_random_uuid (),
  name character varying not null,
  email character varying not null,
  phone character varying null,
  address character varying null,
  user_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint organization_pkey primary key (id),
  constraint organization_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);
```

### Employees Table
```sql
create table public.employees (
  id uuid not null default gen_random_uuid (),
  name character varying not null,
  role character varying not null,
  email character varying not null,
  department_id uuid null,
  organization_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint employees_pkey primary key (id),
  constraint employees_organization_id_fkey foreign key (organization_id) references organization (id) on delete cascade,
  constraint employees_department_id_fkey foreign key (department_id) references departments (id) on delete set null
);
```

### Reviews Table
```sql
create table public.reviews (
  id uuid not null default gen_random_uuid (),
  content text not null,
  target_employee_id uuid not null,
  reviewed_by_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint reviews_pkey primary key (id),
  constraint reviews_target_employee_id_fkey foreign key (target_employee_id) references employees (id) on delete cascade,
  constraint reviews_reviewed_by_id_fkey foreign key (reviewed_by_id) references employees (id) on delete cascade
);
```

### Reports Table
```sql
create table public.reports (
  id uuid not null default gen_random_uuid (),
  employee_id uuid not null,
  month character varying(7) not null,
  ranking integer not null,
  improvements text[] null default '{}'::text[],
  qualities text[] null default '{}'::text[],
  summary text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint reports_pkey primary key (id),
  constraint unique_employee_month unique (employee_id, month),
  constraint reports_employee_id_fkey foreign key (employee_id) references employees (id) on delete cascade,
  constraint reports_month_check check (((month)::text ~ '^\d{4}-(0[1-9]|1[0-2])$'::text)),
  constraint reports_ranking_check check (
    (
      (ranking >= 0)
      and (ranking <= 10)
    )
  )
);
```

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Sign up user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/user` - Get current user

### Organization
- `GET /api/organization` - Get organization details
- `POST /api/organization/save` - Save organization details
- `PUT /api/organization` - Update organization settings

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/:id` - Get a specific employee
- `DELETE /api/employees/:id` - Delete an employee
- `GET /api/employees/assigned` - Get assigned employees for reviewer
- `POST /api/employees/invite` - Invite new employee

### Reviews
- `GET /api/reviews` - Get all reviews (with optional query params for filtering)
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/:id` - Get a specific review
- `GET /api/reviews/my` - Get reviews written by current user

### Reports
- `GET /api/reports` - Get reports for an employee
- `POST /api/reports/generate` - Generate a new report (or return existing one)

## Technologies Used

- Next.js 15
- React 19
- Supabase (Database, Authentication, Real-time)
- TanStack Query for data fetching
- Google Gemini AI for report generation
- TypeScript
- Tailwind CSS

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
