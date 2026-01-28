'use client';

import { useState } from 'react';

interface Task {
  id: number;
  taskType: string;
  taskData: Record<string, unknown>;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  assignedTo: number;
  assignedToName?: string;
}

interface TaskCardProps {
  task: Task;
  showAssignee?: boolean;
  onComplete?: () => void;
}

export function TaskCard({ task, showAssignee, onComplete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
      });

      if (response.ok && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTaskTitle = () => {
    if (task.taskType === 'pallet_builder') {
      const data = task.taskData as {
        jobNumber?: string;
        palletNumber?: string;
      };
      return `Pallet: ${data.palletNumber || 'N/A'} - Job: ${data.jobNumber || 'N/A'}`;
    }
    return task.taskType;
  };

  const renderTaskDetails = () => {
    if (task.taskType === 'pallet_builder') {
      const data = task.taskData as {
        jobNumber?: string;
        palletNumber?: string;
        palletWidth?: string;
        palletLength?: string;
        material?: string;
      };

      return (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted">Job: </span>
            <span className="text-strong">{data.jobNumber}</span>
          </div>
          <div>
            <span className="text-muted">Pallet: </span>
            <span className="text-strong">{data.palletNumber}</span>
          </div>
          <div>
            <span className="text-muted">Width: </span>
            <span className="text-strong">{data.palletWidth}</span>
          </div>
          <div>
            <span className="text-muted">Length: </span>
            <span className="text-strong">{data.palletLength}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted">Material: </span>
            <span className="text-strong">{data.material}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        task.isCompleted
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-subtle bg-surface-muted'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {task.isCompleted ? (
              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Completed
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Pending
              </span>
            )}
            <span className="text-xs text-muted">{formatDate(task.createdAt)}</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-strong">
            {getTaskTitle()}
          </h3>
          {showAssignee && task.assignedToName && (
            <p className="mt-1 text-xs text-muted">
              Assigned to: {task.assignedToName}
            </p>
          )}
          {renderTaskDetails()}
        </div>

        {!task.isCompleted && onComplete && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="rounded-full border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500 hover:text-white disabled:opacity-60"
          >
            {isCompleting ? '...' : 'Complete'}
          </button>
        )}

        {task.isCompleted && task.completedAt && (
          <span className="text-xs text-emerald-500">
            {formatDate(task.completedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
