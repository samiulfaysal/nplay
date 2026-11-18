import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { NetflyIcon } from '@/components/common/NetflyIcon';
import { verifyAdmin } from '@/lib/adminAuth';
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAdmin();

  if (!auth.isAdmin) {
    redirect('/auth?unauthorized=true');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Content Manager', href: '/admin/content', icon: Film },
    { label: 'API & Credentials', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#060709] text-gray-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0b0d14] border-r border-white/5 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Admin Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-3 group">
              <NetflyIcon className="w-10 h-10 shrink-0 group-hover:scale-105 transition-transform" size={64} />
              <div>
                <span className="font-black text-white tracking-wider text-lg leading-none block">
                  NET<span className="text-red-500">FLY</span>
                </span>
                <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase mt-0.5 block">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Icon className="w-4 h-4 text-red-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Back to Site footer */}
        <div className="space-y-3 pt-6 border-t border-white/5 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-black text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-gray-200 truncate">
                {auth.user?.username || 'Admin User'}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {auth.user?.email || 'admin'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>

            <AdminSignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
