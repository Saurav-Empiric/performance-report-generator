# Employee Performance Feedback System

A Next.js application for managing employee performance feedback and reviews, built with MongoDB and TanStack Query.

## Features

- View employees and their details
- Provide performance feedback for employees
- View reviews given to employees
- Optimized data fetching with TanStack Query
- MongoDB database for data persistence

## Setup

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas or self-hosted)

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

3. Create a `.env.local` file in the root directory with your MongoDB connection string and Gemini API key:
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/performance-feedback?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

## Database Structure

The application uses MongoDB with the following collections:

### Employees Collection
```
{
  _id: ObjectId,
  name: String,
  role: String,
  email: String (optional),
  department: String (optional),
  hireDate: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection
```
{
  _id: ObjectId,
  content: String,
  timestamp: Date,
  targetEmployee: ObjectId (references Employee),
  reviewedBy: ObjectId (references Employee, optional),
  rating: Number (1-5, optional),
  category: String (enum: 'Performance', 'Behavior', 'Skills', 'General'),
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/:id` - Get a specific employee
- `PUT /api/employees/:id` - Update an employee
- `DELETE /api/employees/:id` - Delete an employee

### Reviews
- `GET /api/reviews` - Get all reviews (with optional query params for filtering)
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/:id` - Get a specific review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

## Technologies Used

- Next.js 15
- React 19
- MongoDB with Mongoose
- TanStack Query for data fetching
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
