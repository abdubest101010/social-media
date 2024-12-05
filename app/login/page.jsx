'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import ClipLoader from 'react-spinners/ClipLoader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setError("");
  
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
  
      setLoadingLogin(false);
  
      if (result?.ok) {
        router.replace("/"); // Redirect on successful login
      } else {
        setError(result?.error || "Invalid email or password");
      }
    } catch (error) {
      setLoadingLogin(false);
      setError("An error occurred. Please try again.");
    }
  };
  

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const result = await signIn('google', {
      callbackUrl: '/'  // Redirect to homepage after successful Google login
    });
    if (result?.ok) {
      router.push('/');  // You can also manually redirect using the router here
    }
    setLoadingGoogle(false);
  };
  

  const handlePasswordAction = async (e) => {
    e.preventDefault();
    setLoadingForgot(true);
    setMessage('');

    const url = '/api/forget-password';
    const body = JSON.stringify({ email: forgotEmail });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await response.json();
      setLoadingForgot(false);

      if (response.ok) {
        setMessage('Password reset email sent. Please check your inbox and spam folder.');
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setLoadingForgot(false);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4 sm:px-0 space-y-4">
      {isForgotPassword ? (
        <form onSubmit={handlePasswordAction} className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          <div className="mb-4">
            <label htmlFor="forgotEmail" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              id="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white py-2 rounded mb-2 ${loadingForgot ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
            disabled={loadingForgot}
          >
            {loadingForgot ? <ClipLoader color="#ffffff" size={20} /> : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="w-full text-blue-500 mt-2"
          >
            Back to Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded pr-10"
                placeholder="Enter your password"
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full text-white py-2 rounded mb-2 ${loadingLogin ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
            disabled={loadingLogin}
          >
            {loadingLogin ? <ClipLoader color="#ffffff" size={20} /> : 'Login'}
          </button>
          <p className="text-center text-gray-600">or</p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={`w-full text-white py-2 rounded mt-2 ${loadingGoogle ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500'}`}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? <ClipLoader color="#ffffff" size={20} /> : 'Sign in with Google'}
          </button>
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-blue-500"
            >
              Forgot Password?
            </button>
            <Link href="/register" className="text-blue-500">
              Register
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
