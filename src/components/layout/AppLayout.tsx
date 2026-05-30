import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import FloatingActionButton from './FloatingActionButton';
import { ToastContainer } from '@/components/ui/Toast';

/* ============================================
   AppLayout — Responsive Shell
   ============================================ */

export default function AppLayout() {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-app)]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main 
        className="flex-1 min-w-0 overflow-y-auto overscroll-y-contain" 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto pb-28 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Mobile FAB */}
      <FloatingActionButton />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
