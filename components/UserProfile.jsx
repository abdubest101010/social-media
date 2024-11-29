import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserProfile({ id }) {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [post, setPost] = useState(null);
  const userId = session?.user?.id?.toString();

  useEffect(() => {
    if (id) {
      fetchUserInfo(id);
      checkFriendRequestStatus(id);
      checkIfFriends(id);
    }
  }, [id]);

  const fetchUserInfo = async (id) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendRequestStatus = async (receiverId) => {
    try {
      const res = await fetch('/api/friend-request/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId.toString(),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setFriendRequestStatus(
          result.alreadyBlocked ? 'blocked' : result.alreadySent ? 'sent' : 'not_sent'
        );
      }
    } catch (error) {
      console.error('Error checking friend request status:', error);
    }
  };

  const checkIfFriends = async (otherUserId) => {
    try {
      const res = await fetch('/api/friend-request/check-friendship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          friendId: otherUserId.toString(),
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsFriend(result.isFriend);
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const res = await fetch('/api/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId.toString(),
        }),
      });
      if (res.ok) {
        setFriendRequestStatus('sent');
        alert('Friend request sent successfully.');
      } else {
        const result = await res.json();
        alert(result.error || 'Failed to send friend request.');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!userInfo) return <div>No user information available</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
      <img
          src={userInfo.profilePicture || '/default-avatar.png'}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
        />
        <h1 className="text-3xl font-bold text-center">
          {userInfo.firstName} {userInfo.lastName}
        </h1>
        <p className="text-lg text-gray-500 text-center mt-2">
          {userInfo.bio || 'No bio available'}
        </p>
        <div className="mt-4 flex gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{userInfo.followers.length}</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{userInfo.following.length}</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
        </div>

        {/* Friend Request/Message Section */}
        {userId !== id.toString() && (
          <>
            {isFriend ? (
              <Link
                href={`/message/${id}`}
                className="bg-green-500 text-white px-6 py-2 rounded mt-4 hover:bg-green-600"
              >
                Message
              </Link>
            ) : friendRequestStatus === 'sent' ? (
              <button
                disabled
                className="bg-gray-400 text-white px-6 py-2 rounded mt-4 cursor-not-allowed"
              >
                Friend Request Sent
              </button>
            ) : (
              <button
                onClick={() => sendFriendRequest(id)}
                className="bg-blue-500 text-white px-6 py-2 rounded mt-4 hover:bg-blue-600"
              >
                Send Friend Request
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
