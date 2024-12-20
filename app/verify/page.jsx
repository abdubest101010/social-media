'use client'; // Ensure this is a client component

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const VerifyContent = () => {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams(); // Ensure this is within Suspense
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const code = searchParams.get('code'); // Extract the code from the URL
      console.log('Code received:', code);

      if (!code) {
        setError('Invalid verification link. Code is missing.');
        return;
      }

      try {
        const response = await fetch(`/api/verify?code=${code}`);
        const result = await response.json();

        console.log('API response:', result);

        if (response.status === 200) {
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setError(result.message || 'Failed to verify email.');
        }
      } catch (err) {
        console.error('Error during verification fetch:', err);
        setError('Something went wrong. Please try again.');
      }
    };

    verifyUser();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default function Verify() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
