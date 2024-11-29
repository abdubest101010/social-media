"use client";
import { useRef, useState } from "react";
import AxiosBase from "@/components/axiosBase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import { signIn } from "next-auth/react";

const Register = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const usernameRef = useRef();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);  // Add state for loading
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const username = usernameRef.current.value;

    setLoading(true);  // Set loading to true when form is submitted

    try {
     
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email,password,username),
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess("Registration successful!");
        setError(null);
        router.push("/login");
      } else {
        setError("Failed to register.");
        setSuccess(null);
      }
    } catch (error) {
      console.error(error);
      let message = error?.response?.data?.message || "Registration failed.";
      setError(message);
      setSuccess(null);
    } finally {
      setLoading(false);  // Reset loading state when the request is completed
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

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 space-y-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {error && <p className="text-red-500 mb-4">{String(error)}</p>}
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
          <input
            id="username"
            type="text"
            ref={usernameRef}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter username"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            id="email"
            type="email"
            ref={emailRef}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter email"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            id="password"
            type="password"
            ref={passwordRef}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter password"
            required
          />
        </div>
        
        <button
          type="submit"
          className={`w-full text-white py-2 rounded mb-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Register'}
        </button>
        <p className="text-center text-gray-600">or</p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={`w-full text-white py-2 rounded mt-2 ${loadingGoogle ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500'}`}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? <ClipLoader color="#ffffff" size={20} /> : 'Sign up with Google'}
          </button>
      </form>

      <div className="mt-4">
        <p>
          If you already have an account,{" "}
          <Link href="/login" className="text-blue-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
