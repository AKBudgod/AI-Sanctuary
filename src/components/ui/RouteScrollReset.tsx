'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // When the pathname changes, instantly reset scroll to top
    // This fixes issues where Next.js smooth scroll or layout shifts
    // can cause the page to stay at the bottom or jump.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as any // Use 'instant' to prevent any smooth scroll conflicts
    });
  }, [pathname]);

  return null;
}
