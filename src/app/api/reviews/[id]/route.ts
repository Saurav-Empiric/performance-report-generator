import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Review from '@/lib/models/review';
import mongoose from 'mongoose';

// Helper to check if the ID is valid
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET a specific review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const review = await Review.findById(id)
      .populate('targetEmployee', 'name role')
      .populate('reviewedBy', 'name role');
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT to update a review
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Validate employee IDs if they are being updated
    if (body.targetEmployee && !isValidObjectId(body.targetEmployee)) {
      return NextResponse.json(
        { error: 'Invalid targetEmployee ID format' },
        { status: 400 }
      );
    }
    
    if (body.reviewedBy && !isValidObjectId(body.reviewedBy)) {
      return NextResponse.json(
        { error: 'Invalid reviewedBy ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('targetEmployee', 'name role')
      .populate('reviewedBy', 'name role');
    
    if (!updatedReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const deletedReview = await Review.findByIdAndDelete(id);
    
    if (!deletedReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 