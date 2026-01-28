import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SessionData, sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.pin, pin))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    if (!user[0].isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    session.userId = user[0].id;
    session.userName = user[0].name;
    session.role = user[0].role as 'admin' | 'employee';
    session.isLoggedIn = true;

    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        name: user[0].name,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
