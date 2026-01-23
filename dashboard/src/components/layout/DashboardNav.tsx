'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
  LayoutDashboard,
  History,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  Crown,
  LogOut,
  Bell,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sessions', label: 'Sessions', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: 'PRO' },
  { href: '/team', label: 'Team', icon: Users, badge: 'PRO' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface DashboardNavProps {
  userPlan?: 'free' | 'pro' | 'enterprise';
  userName?: string;
  userEmail?: string;
}

export function DashboardNav({
  userPlan = 'free',
  userName = 'Demo User',
  userEmail = 'demo@example.com',
}: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPro = userPlan === 'pro' || userPlan === 'enterprise';

  const getPlanBadge = () => {
    switch (userPlan) {
      case 'enterprise':
        return (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Enterprise
          </span>
        );
      case 'pro':
        return (
          <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
            Pro
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Free
          </span>
        );
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Control</h1>
              <p className="text-xs text-gray-500">DRS Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isProFeature = item.badge === 'PRO';
            const isLocked = isProFeature && !isPro;

            return (
              <Link
                key={item.href}
                href={isLocked ? '/pricing' : item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : isLocked
                    ? 'text-gray-400 hover:bg-gray-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      isLocked
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isLocked && <Crown className="w-4 h-4 text-gray-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner (for free users) */}
        {!isPro && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg p-4 text-white">
              <p className="font-medium mb-1">Upgrade to Pro</p>
              <p className="text-xs text-brand-100 mb-3">
                Unlock analytics, team features, and more
              </p>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-1 w-full px-3 py-2 bg-white text-brand-600 rounded-md text-sm font-medium hover:bg-brand-50 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                {getPlanBadge()}
              </div>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Control</span>
          </Link>

          <div className="flex items-center gap-2">
            {getPlanBadge()}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 py-4 bg-white border-t border-gray-100 shadow-lg">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isProFeature = item.badge === 'PRO';
              const isLocked = isProFeature && !isPro;

              return (
                <Link
                  key={item.href}
                  href={isLocked ? '/pricing' : item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : isLocked
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {!isPro && (
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-brand-500 text-white rounded-lg text-sm font-medium"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
}

export default DashboardNav;
