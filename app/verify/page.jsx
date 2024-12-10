'use client'; // Ensure this component runs on the client side

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Verify() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams(); // Used to access query parameters
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      const code = searchParams?.get('code'); // Safely fetch query parameter

      if (!code) {
        setError('Invalid verification link. Code is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify?code=${code}`);
        const result = await response.json();

        if (response.ok) {
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => {
            router.push('/login'); // Redirect after successful verification
          }, 3000);
        } else {
          setError(result.message || 'Verification failed. Please try again.');
        }
      } catch (err) {
        console.error('Error verifying user:', err);
        setError('An error occurred during verification. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">Email Verification</h1>
        {loading && (
          <p className="text-blue-500 text-center">Verifying your email...</p>
        )}
        {message && <p className="text-green-500 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}
