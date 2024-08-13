// Page.tsx
"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
    const searchParams = useSearchParams();
  const slug: string = searchParams.get('slug') || '';
  return (
    <Suspense fallback={<div>Loading...</div>}>
       <>
      {slug && <h1>{slug}</h1>}
    </>
    </Suspense>
  );
}

