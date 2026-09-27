import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import User from '../../../lib/models/User';

export async function POST(req) {
  try {
    const { username, goal } = await req.json();

    if (!username || !goal) {
      return NextResponse.json(
        { success: false, message: 'Username and goal are required' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed', error: dbErr.message },
        { status: 500 }
      );
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please sign up or log in.' },
        { status: 404 }
      );
    }

    user.goal = goal;
    user.goals.push({ thought: goal, createdAt: new Date() });
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Goal updated successfully in database!',
        user: {
          id: user._id,
          username: user.username,
          goal: user.goal,
          goals: user.goals,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating goal' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username query parameter is required' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed', error: dbErr.message },
        { status: 500 }
      );
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          goal: user.goal,
          goals: user.goals,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching user roadmap' },
      { status: 500 }
    );
  }
}
