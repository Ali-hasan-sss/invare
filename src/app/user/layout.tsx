"use client";

import React from "react";
import Sidebar from "@/components/user/Sidebar";
import BottomNav from "@/components/user/BottomNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
