import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from '../ui/toaster';

export const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
        <Toaster />
      </div>
    </div>
  );
};
