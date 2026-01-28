'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn) {
            if (data.user.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/tasks');
            }
          }
        }
      } catch {
        // Not logged in, stay on login page
      }
    };
    checkSession();
  }, [router]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        handleLogin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (fullPin: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/tasks');
      }
    } catch {
      setError('Connection error. Please try again.');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

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
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm rounded-3xl border border-subtle bg-surface p-8 shadow-sm"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-strong">Enter PIN</h2>
            <p className="mt-2 text-sm text-muted">
              Enter your 4-digit PIN to continue
            </p>
          </div>

          <div className="mb-6 flex justify-center gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="h-14 w-14 rounded-2xl border border-subtle bg-transparent text-center text-2xl font-semibold text-strong focus:border-[color:var(--accent-secondary)] focus:outline-none disabled:opacity-60"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-center text-sm text-rose-500"
            >
              {error}
            </motion.p>
          )}

          {isLoading && (
            <p className="text-center text-sm text-muted">Verifying...</p>
          )}
        </motion.section>
      </main>
    </div>
  );
}
