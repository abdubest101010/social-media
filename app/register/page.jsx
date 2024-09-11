"use client";
import { useRef, useState } from "react";
import AxiosBase from "@/components/axiosBase"
import Link from "next/link";
import { useRouter } from "next/navigation";

const Register = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const usernameRef = useRef();
  const router =useRouter()
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handler(e) {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const username = usernameRef.current.value;

    try {
      const response = await AxiosBase.post("/register", {
        email,
        password,
        username,
      });

      // Check if response status is in the success range
      if (response.status >= 200 && response.status < 300) {
        setSuccess("Registration successful!");
        
        setError(null);
        router.push('/login') // Clear any previous errors
      } else {
        setError("Failed to register.");
        setSuccess(null); // Clear any previous success messages
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred during registration.");
      setSuccess(null); // Clear any previous success messages
    }
  }

  return (
    <>
      <h1>Register</h1>
      <form onSubmit={handler}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Enter username"
          ref={usernameRef}
          required
        />

        <label htmlFor="email">Email</label>
        <input type="email" placeholder="Enter email" ref={emailRef} required />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          ref={passwordRef}
          required
        />

        <button type="submit">Register</button>
      </form>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <p>If you have alreday account <Link href={'/login'}>Login</Link></p>
      </div>
    </>
  );
};

export default Register;
