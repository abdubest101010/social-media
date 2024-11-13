// src/app/friends/page.js
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FriendsList() {
  const { data: session, status } = useSession();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchFriends = async () => {
        try {
          const res = await fetch('/api/friends', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: session.user.id }), // Send userId in the body
          });
          if (res.ok) {
            const data = await res.json();
            setFriends(data);
          } else {
            console.error('Failed to fetch friends:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching friends:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchFriends();
    }
  }, [status]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
      {friends.length === 0 ? (
        <p>No friends found.</p>
      ) : (
        <ul className="space-y-4">
          {friends.map(friend => (
            <Link href={`/message/${friend.id}`}><li key={friend.id} className="flex items-center bg-white p-4 rounded shadow">
              <img src={friend.profilePicture} alt={friend.username} className="w-12 h-12 rounded-full mr-4" />
              <span className="text-lg">{friend.firstName} {friend.lastName}</span>
            </li></Link>
          ))}
        </ul>
      )}
    </div>
  );
}
