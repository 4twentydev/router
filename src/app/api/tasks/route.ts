import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { tasks, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { SessionData, sessionOptions } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const showCompleted = searchParams.get('showCompleted') === 'true';

    let taskList;

    if (session.role === 'admin') {
      // Admin sees all tasks
      const conditions = showCompleted ? undefined : eq(tasks.isCompleted, false);
      taskList = await db
        .select({
          id: tasks.id,
          taskType: tasks.taskType,
          taskData: tasks.taskData,
          isCompleted: tasks.isCompleted,
          completedAt: tasks.completedAt,
          createdAt: tasks.createdAt,
          assignedTo: tasks.assignedTo,
          assignedToName: users.name,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .where(conditions)
        .orderBy(desc(tasks.createdAt));
    } else {
      // Employee sees only their tasks
      const conditions = showCompleted
        ? eq(tasks.assignedTo, session.userId)
        : and(eq(tasks.assignedTo, session.userId), eq(tasks.isCompleted, false));

      taskList = await db
        .select({
          id: tasks.id,
          taskType: tasks.taskType,
          taskData: tasks.taskData,
          isCompleted: tasks.isCompleted,
          completedAt: tasks.completedAt,
          createdAt: tasks.createdAt,
          assignedTo: tasks.assignedTo,
          assignedToName: users.name,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .where(conditions)
        .orderBy(desc(tasks.createdAt));
    }

    return NextResponse.json({ tasks: taskList });
  } catch (error) {
    console.error('Get tasks error:', error);
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

    if (!session.isLoggedIn || !session.userId || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskType, assignedTo, taskData } = await request.json();

    if (!taskType || !assignedTo || !taskData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newTask = await db
      .insert(tasks)
      .values({
        taskType,
        assignedTo,
        createdBy: session.userId,
        taskData,
      })
      .returning();

    return NextResponse.json({ task: newTask[0] }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
