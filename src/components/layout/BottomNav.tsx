import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wallet,
  BarChart3,
  Settings,
} from 'lucide-react';

/* ============================================
   Bottom Navigation (Phone / Tablet)
   ============================================ */

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/money', icon: Wallet, label: 'Money' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav
      className="
        lg:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[var(--bg-card)] border-t border-[var(--border-default)]
        glass
        safe-area-bottom
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl
               min-w-[56px] transition-all duration-200
               ${isActive
                 ? 'text-primary-600 dark:text-primary-400'
                 : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
               }
              `
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary-500" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
