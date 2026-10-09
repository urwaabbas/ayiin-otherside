"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Dedicated AYIIN Admin Navbar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
