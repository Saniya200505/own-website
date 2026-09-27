import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import User from '../../../../lib/models/User';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
    } catch (dbErr) {
      console.error('MongoDB connection error:', dbErr);
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed. Please ensure your MongoDB password is set in .env / .env.local file.',
          error: dbErr.message,
        },
        { status: 500 }
      );
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this username/email. Please sign up first.' },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during login' },
      { status: 500 }
    );
  }
}
