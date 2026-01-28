'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toast } from '@/components/toast';
import { TaskCard } from '@/components/task-card';

interface Task {
  id: number;
  taskType: string;
  taskData: Record<string, unknown>;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  assignedTo: number;
  assignedToName: string;
}

interface ToastState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export default function EmployeeTasksPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });
  const router = useRouter();

  const showToast = (title: string, message: string, type: 'success' | 'error') => {
    setToast({ show: true, title, message, type });
  };

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?showCompleted=${showCompleted}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [showCompleted]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/');
          return;
        }
        const data = await response.json();
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
          return;
        }
        setUser(data.user);
        await fetchTasks();
      } catch {
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, fetchTasks]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [showCompleted, user, fetchTasks]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleTaskComplete = () => {
    fetchTasks();
    showToast('Task Completed', 'Great job! Task marked as complete.', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="border-b border-subtle bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
              ES
            </p>
            <h1 className="text-lg font-semibold text-strong">Router</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">Hello, {user?.name}</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-full border border-subtle px-4 py-2 text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-subtle bg-surface p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-strong">My Tasks</h2>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="rounded-full border border-subtle px-4 py-2 text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong"
              >
                {showCompleted ? 'Hide Completed' : 'Show Completed'}
              </button>
            </div>

            <div className="mb-6 flex gap-4 text-sm">
              <span className="text-muted">
                Pending:{' '}
                <span className="font-semibold text-strong">
                  {pendingTasks.length}
                </span>
              </span>
              <span className="text-muted">
                Completed:{' '}
                <span className="font-semibold text-emerald-500">
                  {completedTasks.length}
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {tasks.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mb-4 text-4xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mx-auto h-16 w-16 text-muted"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-strong">
                    All caught up!
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    No tasks assigned to you right now.
                  </p>
                </div>
              ) : (
                tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <TaskCard task={task} onComplete={handleTaskComplete} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </main>

      <AnimatePresence>
        {toast.show && (
          <Toast
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
