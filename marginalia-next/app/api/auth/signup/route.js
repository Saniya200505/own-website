import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import User from '../../../../lib/models/User';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(req) {
  try {
    const { username, password, goal } = await req.json();

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
          message: 'Database connection failed. Please ensure your MongoDB password is correctly set in .env / .env.local file.',
          error: dbErr.message,
        },
        { status: 500 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists. Please log in instead.' },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      username: cleanUsername,
      password: password,
      goal: goal || '',
      goals: goal ? [{ thought: goal, createdAt: new Date() }] : [],
    });

    // Send sweet welcome email if user provided an email address
    if (cleanUsername.includes('@')) {
      sendWelcomeEmail(cleanUsername, cleanUsername.split('@')[0], goal).catch(err => {
        console.error('Welcome email dispatch error:', err);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully and goal saved!',
        user: {
          id: newUser._id,
          username: newUser.username,
          goal: newUser.goal,
          goals: newUser.goals,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during signup' },
      { status: 500 }
    );
  }
}
