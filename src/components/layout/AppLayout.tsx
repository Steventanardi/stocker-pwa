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
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto pb-24 lg:pb-8">
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
