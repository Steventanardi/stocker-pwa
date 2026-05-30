import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wallet,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

/* ============================================
   Sidebar (Desktop / Laptop)
   ============================================ */

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/money', icon: Wallet, label: 'Money Planner' },
  { to: '/budget', icon: PiggyBank, label: 'Budget' },
  { to: '/savings', icon: Target, label: 'Savings Goals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        hidden lg:flex flex-col
        h-screen sticky top-0
        bg-[var(--bg-sidebar)] border-r border-[var(--border-default)]
        transition-all duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-[var(--border-default)]">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gradient truncate">
            Stocker
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150 group
               ${isActive
                 ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 shadow-xs'
                 : 'text-[var(--text-secondary)] hover:bg-surface-100 hover:text-[var(--text-primary)] dark:hover:bg-surface-800'
               }
               ${collapsed ? 'justify-center' : ''}
              `
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[var(--border-default)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
            text-sm text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800
            transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
