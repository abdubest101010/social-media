import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserProfile({ id }) {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [fullScreenImage, setFullScreenImage] = useState(null); // State for full-screen image
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
        setFriendRequestStatus(result.alreadyBlocked ? 'blocked' : result.alreadySent ? 'sent' : 'not_sent');
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

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!userInfo) return <div>No user information available</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="mb-4">
          <p><strong>Username:</strong> {userInfo.username}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>First Name:</strong> {userInfo.firstName}</p>
          <p><strong>Last Name:</strong> {userInfo.lastName}</p>
          <p><strong>Living In:</strong> {userInfo.livingIn}</p>
          <p><strong>Went To:</strong> {userInfo.wentTo}</p>
          <p><strong>Works At:</strong> {userInfo.worksAt}</p>
          <p><strong>Bio:</strong> {userInfo.bio}</p>
          <p><strong>Followers:</strong> {userInfo._count.followers}</p> {/* Display followers count */}
          <p><strong>Following:</strong> {userInfo._count.following}</p> {/* Display following count */}
        </div>

        <div>
          {userId !== id.toString() && !isFriend && friendRequestStatus === 'not_sent' && (
            <button
              onClick={() => sendFriendRequest(id)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Send Friend Request
            </button>
          )}
          {friendRequestStatus === 'sent' && (
            <p className="text-green-500 mt-4">You have already sent a friend request to this user.</p>
          )}
          {isFriend && (
            <Link href={`/request/${id}`} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
              Message
            </Link>
          )}
        </div>
      </div>

      {/* User Stories Section */}
      {userInfo.stories?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Stories</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar" style={{ overflowY: 'hidden', height: '100px' }}>
            {userInfo.stories.map((story) => (
              <div key={story.id} className="relative w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200 p-2 shadow hover:scale-105 transition duration-300">
                <img
                  src={story.imageUrl}
                  alt={story.content}
                  className="w-full h-full object-cover rounded cursor-pointer"
                  onClick={() => setFullScreenImage(story.imageUrl)} // Set full-screen image on click
                />
                <p className="text-center text-sm mt-1 truncate">{story.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Posts Section */}
      {userInfo.posts?.length > 0 && (
        <div className="mt-8 hide-scrollbar">
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          <div className="space-y-4 overflow-hidden" style={{ overflowY: 'hidden', height: 'auto' }}>
            {userInfo.posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">{post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt="Post Image" className="mt-2 rounded-lg" />}
                <div className="mt-2 text-sm text-gray-500">
                  <span>{post.likeCount} Likes</span> •
                  <span> {post._count.comments} Comments</span>
                </div>
                
                {/* Show/Hide Comments Button */}
                {post._count.comments > 0 && (
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="text-blue-500 text-sm mt-2"
                  >
                    {showComments[post.id] ? 'Hide Comments' : 'Show Comments'}
                  </button>
                )}

                {/* Display Comments */}
                {showComments[post.id] && post.comments.length > 0 && (
                  <div className="mt-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="border-t border-gray-200 py-2">
                        <p className="text-sm">
                          <strong>{comment.user.username}</strong>: {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Image Modal */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <img
            src={fullScreenImage}
            alt="Full Screen"
            className="max-w-full max-h-full cursor-pointer"
            onClick={closeFullScreen}
          />
        </div>
      )}
    </div>
  );
}
