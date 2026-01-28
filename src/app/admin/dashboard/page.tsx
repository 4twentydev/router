'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toast } from '@/components/toast';
import { PalletBuilderForm } from '@/components/pallet-builder-form';
import { TaskCard } from '@/components/task-card';

interface Employee {
  id: number;
  name: string;
  isActive: boolean;
}

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

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePin, setNewEmployeePin] = useState('');
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
        if (data.user.role !== 'admin') {
          router.push('/tasks');
          return;
        }
        setUser(data.user);

        // Fetch employees
        const empResponse = await fetch('/api/employees');
        if (empResponse.ok) {
          const empData = await empResponse.json();
          setEmployees(empData.employees);
        }

        // Fetch tasks
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
    fetchTasks();
  }, [showCompleted, fetchTasks]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEmployeeName, pin: newEmployeePin }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees([...employees, data.employee]);
        setNewEmployeeName('');
        setNewEmployeePin('');
        setShowAddEmployee(false);
        showToast('Employee Added', `${data.employee.name} has been added.`, 'success');
      } else {
        const error = await response.json();
        showToast('Error', error.error || 'Failed to add employee', 'error');
      }
    } catch {
      showToast('Error', 'Connection error', 'error');
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    showToast('Task Created', 'Task has been assigned successfully.', 'success');
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8 lg:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-secondary">
              ES
            </p>
            <h1 className="text-lg font-semibold text-strong">Router Admin</h1>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="hidden text-sm text-muted md:block">Welcome, {user?.name}</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-full border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong lg:px-4 lg:py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] xl:gap-8">
            {/* Left Column - Task Creation */}
            <section className="flex flex-col gap-5 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm lg:rounded-3xl lg:p-6"
              >
                <h2 className="mb-5 text-xl font-semibold text-strong lg:mb-6 lg:text-2xl">
                  Create Task
                </h2>
                <PalletBuilderForm
                  employees={employees}
                  onTaskCreated={handleTaskCreated}
                  onError={(msg) => showToast('Error', msg, 'error')}
                />
              </motion.div>

              {/* Employee Management */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm lg:rounded-3xl lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-strong lg:text-lg">
                    Employees
                  </h2>
                  <button
                    onClick={() => setShowAddEmployee(!showAddEmployee)}
                    className="rounded-full border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong lg:px-4 lg:py-2"
                  >
                    {showAddEmployee ? 'Cancel' : 'Add Employee'}
                  </button>
                </div>

                <AnimatePresence>
                  {showAddEmployee && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddEmployee}
                      className="mb-4 flex flex-col gap-3 overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="Employee name"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        className="w-full rounded-xl border border-subtle bg-transparent px-4 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:py-3"
                        required
                      />
                      <input
                        type="text"
                        placeholder="4-digit PIN"
                        maxLength={4}
                        value={newEmployeePin}
                        onChange={(e) =>
                          setNewEmployeePin(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full rounded-xl border border-subtle bg-transparent px-4 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:py-3"
                        required
                      />
                      <button
                        type="submit"
                        className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-95 lg:px-6 lg:py-3"
                      >
                        Add Employee
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2">
                  {employees.map((emp) => (
                    <span
                      key={emp.id}
                      className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      {emp.name}
                    </span>
                  ))}
                  {employees.length === 0 && (
                    <p className="text-sm text-muted">No employees yet</p>
                  )}
                </div>
              </motion.div>
            </section>

            {/* Right Column - Task List */}
            <aside className="flex flex-col gap-5 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="rounded-2xl border border-subtle bg-surface p-5 shadow-sm lg:rounded-3xl lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-strong lg:text-lg">
                    Task List
                  </h2>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="rounded-full border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition-all hover:border-strong hover:text-strong lg:px-4 lg:py-2"
                  >
                    {showCompleted ? 'Hide Done' : 'Show Done'}
                  </button>
                </div>

                <div className="mb-4 flex gap-4 text-sm">
                  <span className="text-muted">
                    Pending:{' '}
                    <span className="font-semibold text-strong">
                      {pendingTasks.length}
                    </span>
                  </span>
                  <span className="text-muted">
                    Done:{' '}
                    <span className="font-semibold text-emerald-500">
                      {completedTasks.length}
                    </span>
                  </span>
                </div>

                <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto lg:max-h-[500px]">
                  {tasks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted">
                      No tasks yet
                    </p>
                  ) : (
                    tasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <TaskCard task={task} showAssignee />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </aside>
          </div>
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
