"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Use startTransition to avoid React warning
          startTransition(() => {
            router.push("/dashboard");
          });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 font-sans">
      <main className="flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 animate-fadeIn">
          Good day
        </h1>
        <p className="text-lg text-gray-700 mb-8 animate-fadeIn delay-150">
          Please hold while the server redirects.
        </p>
        <p className="text-md text-gray-600 animate-fadeIn delay-300">
          Redirecting in{" "}
          <span className="font-semibold text-blue-600">{countdown}</span>{" "}
          seconds...
        </p>
      </main>
    </div>
  );
}
