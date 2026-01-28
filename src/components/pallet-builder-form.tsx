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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
          Assign To
        </label>
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
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

      <div className="rounded-xl border border-subtle p-3 lg:rounded-2xl lg:p-4">
        <h3 className="mb-3 text-sm font-semibold text-subtle lg:mb-4">
          Pallet Builder Details
        </h3>

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
              Job Number
            </label>
            <input
              type="text"
              name="jobNumber"
              value={formData.jobNumber}
              onChange={handleChange}
              placeholder="e.g., JOB-2024-001"
              className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
              Pallet Number
            </label>
            <input
              type="text"
              name="palletNumber"
              value={formData.palletNumber}
              onChange={handleChange}
              placeholder="e.g., P-001"
              className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
              Width
            </label>
            <input
              type="text"
              name="palletWidth"
              value={formData.palletWidth}
              onChange={handleChange}
              placeholder="e.g., 48 in"
              className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
              Length
            </label>
            <input
              type="text"
              name="palletLength"
              value={formData.palletLength}
              onChange={handleChange}
              placeholder="e.g., 40 in"
              className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-subtle lg:mb-2">
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              placeholder="e.g., Pine, Oak, Composite"
              className="w-full rounded-xl border border-subtle bg-transparent px-3 py-2.5 text-sm text-strong placeholder-muted focus:border-[color:var(--accent-secondary)] focus:outline-none lg:rounded-2xl lg:px-4 lg:py-3"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-60 lg:px-6 lg:py-3"
      >
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
