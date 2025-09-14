'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
    } finally {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return null; // or a spinner
  }

  return <>{children}</>;
}
