import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/erp/Sidebar';
import Topbar from '../components/erp/Topbar';

export default function ErpLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-ice-mint/30">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
