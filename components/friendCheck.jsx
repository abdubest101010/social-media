import { useState, useEffect } from 'react';

export default function CheckFriendRequest({ senderId, receiverId }) {
  const [requestExists, setRequestExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRequest = async () => {
      try {
        const res = await fetch(`/api/friend-request/check?senderId=${senderId}&receiverId=${receiverId}`);
        if (res.ok) {
          const data = await res.json();
          setRequestExists(data.exists);
        }
      } catch (error) {
        console.error('Error checking friend request:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRequest();
  }, [senderId, receiverId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {requestExists ? (
        <p>Friend request already sent.</p>
      ) : (
        <p>No friend request found.</p>
      )}
    </div>
  );
}
