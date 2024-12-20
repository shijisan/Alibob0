'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/admin'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');

    if (isAdminPath) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  return (
    <button
      className="px-4 py-2 font-medium text-blue-500 hover:text-blue-400"
      onClick={handleLogout}
    >
      Log Out
    </button>
  );
}
