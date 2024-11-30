import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function FriendsList() {
  const { data: session, status } = useSession();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
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
  }, [status, session?.user?.id]); // Add session.user.id as a dependency

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
      {friends.length === 0 ? (
        <p>No friends found.</p>
      ) : (
        <ul className="space-y-4">
        {friends.map(friend => (
  <Link key={friend.id} href={`/message/${friend.id}`}>
    <li className="flex items-center p-4 rounded shadow">
      {friend.profilePicture ? (
        <Image 
          src={friend.profilePicture} 
          alt={friend.username} 
          width={35} 
          height={35} 
          className="w-12 h-12 rounded-full mr-4" 
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> // Placeholder if no image
      )}
      <span className="text-lg">{friend.firstName} {friend.lastName}</span>
    </li>
  </Link>
))}

        </ul>
      )}
    </div>
  );
}
