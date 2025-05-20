import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Review from '@/lib/models/review';
import mongoose from 'mongoose';

// GET all reviews with optional query params
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetEmployee = searchParams.get('targetEmployee');
    const reviewedBy = searchParams.get('reviewedBy');
    
    const query: any = {};
    
    if (targetEmployee && mongoose.Types.ObjectId.isValid(targetEmployee)) {
      query.targetEmployee = targetEmployee;
    }
    
    if (reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)) {
      query.reviewedBy = reviewedBy;
    }
    
    await connectToDatabase();
    const reviews = await Review.find(query)
      .populate('targetEmployee', 'name role')
      .populate('reviewedBy', 'name role')
      .sort({ timestamp: -1 });
    
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST to create a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.content || !body.targetEmployee) {
      return NextResponse.json(
        { error: 'Content and targetEmployee are required fields' },
        { status: 400 }
      );
    }
    
    // Validate targetEmployee ID format
    if (!mongoose.Types.ObjectId.isValid(body.targetEmployee)) {
      return NextResponse.json(
        { error: 'Invalid targetEmployee ID format' },
        { status: 400 }
      );
    }
    
    // Validate reviewedBy ID format if present
    if (body.reviewedBy && !mongoose.Types.ObjectId.isValid(body.reviewedBy)) {
      return NextResponse.json(
        { error: 'Invalid reviewedBy ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const newReview = new Review(body);
    await newReview.save();
    
    // Populate employee fields for response
    const populatedReview = await Review.findById(newReview._id)
      .populate('targetEmployee', 'name role')
      .populate('reviewedBy', 'name role');
    
    return NextResponse.json(populatedReview, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 