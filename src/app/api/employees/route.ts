import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { SessionData, sessionOptions } from '@/lib/session';

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await db
      .select({
        id: users.id,
        name: users.name,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(eq(users.role, 'employee'), eq(users.isActive, true)));

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, pin } = await request.json();

    if (!name || !pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Name and 4-digit PIN are required' },
        { status: 400 }
      );
    }

    // Check if PIN already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.pin, pin))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'PIN already in use' },
        { status: 400 }
      );
    }

    const newEmployee = await db
      .insert(users)
      .values({
        name,
        pin,
        role: 'employee',
      })
      .returning();

    return NextResponse.json(
      {
        employee: {
          id: newEmployee[0].id,
          name: newEmployee[0].name,
          isActive: newEmployee[0].isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
