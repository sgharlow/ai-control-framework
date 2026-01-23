'use client';

import { DashboardNav } from './DashboardNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userPlan?: 'free' | 'pro' | 'enterprise';
  userName?: string;
  userEmail?: string;
}

export function DashboardLayout({
  children,
  userPlan = 'pro',
  userName = 'Demo User',
  userEmail = 'demo@example.com',
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        userPlan={userPlan}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main content area */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
