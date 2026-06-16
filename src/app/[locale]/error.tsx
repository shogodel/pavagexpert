"use client";

import { useEffect } from "react";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-stone-300">500</h1>
        <p className="text-xl text-stone-600">Something went wrong</p>
        <button onClick={reset} className="text-emerald-600 hover:text-emerald-700 underline cursor-pointer">
          Try again
        </button>
      </div>
    </div>
  );
}
