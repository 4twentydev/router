import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { SessionData, sessionOptions } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // If employee, verify they own this task
    if (session.role === 'employee') {
      const task = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.assignedTo, session.userId)))
        .limit(1);

      if (task.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
    }

    const updatedTask = await db
      .update(tasks)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: updatedTask[0] });
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
