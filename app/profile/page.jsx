'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        console.log(data)
        setUser(data);
        
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user ? user.firstName : 'Guest'}!</h1>
      <h2><Link href={'/profile/edit'}>Edit</Link></h2>
      {user && (
        <div>
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt="Profile"
            style={{ width: '100px', height: '100px' }}
          />
          <p>First Name: {user.firstName || ''}</p>
          <p>Last Name: {user.lastName || ''}</p>
          <p>Bio: {user.bio || ''}</p>
          <p>Lives in: {user.livingIn || ''}</p>
          <p>Works at: {user.worksAt || ''}</p>
          <p>Went to: {user.wentTo || ""}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
