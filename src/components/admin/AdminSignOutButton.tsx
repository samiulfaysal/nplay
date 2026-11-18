'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      router.push('/auth');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
      title="Sign out of Administrator Console"
    >
      <LogOut className="w-3 h-3" />
      <span>Sign Out</span>
    </button>
  );
}
