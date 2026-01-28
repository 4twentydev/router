'use client';

import { useState } from 'react';

interface Employee {
  id: number;
  name: string;
  isActive: boolean;
}

interface PalletBuilderFormProps {
  employees: Employee[];
  onTaskCreated: () => void;
  onError: (message: string) => void;
}

export function PalletBuilderForm({
  employees,
  onTaskCreated,
  onError,
}: PalletBuilderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    assignedTo: '',
    jobNumber: '',
    palletNumber: '',
    palletWidth: '',
    palletLength: '',
    material: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assignedTo) {
      onError('Please select an employee');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'pallet_builder',
          assignedTo: parseInt(formData.assignedTo),
          taskData: {
            jobNumber: formData.jobNumber,
            palletNumber: formData.palletNumber,
            palletWidth: formData.palletWidth,
            palletLength: formData.palletLength,
            material: formData.material,
          },
        }),
      });

      if (response.ok) {
        setFormData({
          assignedTo: '',
          jobNumber: '',
          palletNumber: '',
          palletWidth: '',
          palletLength: '',
          material: '',
        });
        onTaskCreated();
      } else {
        const error = await response.json();
        onError(error.error || 'Failed to create task');
      }
    } catch {
      onError('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-subtle">
          Assign To
        </label>
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong focus:border-[color:var(--accent-secondary)] focus:outline-none"
          required
        >
          <option value="">Select employee...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-subtle p-4">
        <h3 className="mb-4 text-sm font-semibold text-subtle">
          Pallet Builder Details
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Job Number
            </label>
            <input
              type="text"
              name="jobNumber"
              value={formData.jobNumber}
              onChange={handleChange}
              placeholder="e.g., JOB-2024-001"
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Pallet Number
            </label>
            <input
              type="text"
              name="palletNumber"
              value={formData.palletNumber}
              onChange={handleChange}
              placeholder="e.g., P-001"
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Pallet Width
            </label>
            <input
              type="text"
              name="palletWidth"
              value={formData.palletWidth}
              onChange={handleChange}
              placeholder="e.g., 48 inches"
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Pallet Length
            </label>
            <input
              type="text"
              name="palletLength"
              value={formData.palletLength}
              onChange={handleChange}
              placeholder="e.g., 40 inches"
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-subtle">
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="e.g., Pine, Oak, Composite"
              className="w-full rounded-2xl border border-subtle bg-transparent px-4 py-3 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary rounded-full px-6 py-3 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-60"
      >
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
