"use client";

import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          جارٍ تحميل الصفحة...
        </p>
      </div>
    </div>
  );
}
