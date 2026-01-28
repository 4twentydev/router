import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData, sessionOptions, defaultSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    session.userId = defaultSession.userId;
    session.userName = defaultSession.userName;
    session.role = defaultSession.role;
    session.isLoggedIn = false;

    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
