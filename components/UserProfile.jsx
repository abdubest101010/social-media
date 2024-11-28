import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function UserProfile({ id }) {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [post, setPost]=useState(null)
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
      const postsWithShowLikes = data.posts.map((post) => ({
        ...post,
        showLikes: false, // Initialize `showLikes` to false
        showComments:false,
        showShares:false
      }));
      setUserInfo(data);
      setPost(postsWithShowLikes)
      console.log(data)
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
  const getTimeDifference = (createdAt) => {
    const currentTime = new Date();
    const postTime = new Date(createdAt);
    const timeDiff = Math.floor((currentTime - postTime) / 1000);

    if (timeDiff < 60) {
      return `${timeDiff} seconds ago`;
    } else if (timeDiff < 3600) {
      return `${Math.floor(timeDiff / 60)} minutes ago`;
    } else if (timeDiff < 86400) {
      return `${Math.floor(timeDiff / 3600)} hours ago`;
    } else {
      return `${Math.floor(timeDiff / 86400)} days ago`;
    }
  };
 
  const handleCommentToggle = (postId) => {
    setPost((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const handleLikesToggle = (postId) => {
    setPost((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showLikes: !post.showLikes } : post
      )
    );
  };
  const handleSharesToggle = (postId) => {
    setPost((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showShares: !post.showShares } : post
      )
    );
  };
  
  if (loading) return <div>Loading...</div>;
  if (!userInfo) return <div>No user information available</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Profile Info Section */}
      <div className="flex flex-col items-center">
        {/* Profile Picture */}
        <div className="relative mb-4">
          <img
            src={userInfo.profilePicture || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
        </div>
        
        {/* User Info */}
        <h1 className="text-3xl font-bold text-center">{userInfo.firstName} {userInfo.lastName}</h1>
        <p className="text-lg text-gray-500 text-center mt-2">{userInfo.bio || 'No bio available'}</p>
        <p className="text-md text-center mt-2">{userInfo.livingIn}, {userInfo.wentTo}, {userInfo.worksAt}</p>

        {/* Followers & Following */}
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
        {userId !== id.toString() && !isFriend && friendRequestStatus === 'not_sent' && (
          <button
            onClick={() => sendFriendRequest(id)}
            className="bg-blue-500 text-white px-6 py-2 rounded mt-4 hover:bg-blue-600"
          >
            Send Friend Request
          </button>
        )}
        
        {friendRequestStatus === 'sent' && (
          <Link
            href={`/messages/${id}`}  // Assuming this is the message page route
            className="bg-green-500 text-white px-6 py-2 rounded mt-4 hover:bg-green-600"
          >
            Message
          </Link>
        )}
        
        {isFriend && (
          <Link
            href={`/messages/${id}`}
            className="bg-green-500 text-white px-6 py-2 rounded mt-4 hover:bg-green-600"
          >
            Message
          </Link>
        )}

        {/* If the user is the same as the logged-in user, don't show buttons */}
        {userId === id.toString() && (
          ""
        )}
      </div>

      {/* User Posts Section */}
      {/* User Posts Section */}
      {userInfo.posts?.length > 0 && (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold mb-6 text-center">Posts</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {userInfo.posts.map((post) => (
        <div
          key={post.id}
          className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Post Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">{getTimeDifference(post.createdAt)}</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-800 mb-2">{post.content}</h2>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post Image"
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
            )}
             <div className="mt-2 text-sm text-gray-500">
              <button onClick={() => handleLikesToggle(post.id)}>{post.likes.length} Likes</button> •
              <button onClick={() => handleCommentToggle (post.id)}>{post.comments.length} Comments</button> •
              <button onClick={() => handleSharesToggle(post.id)}>{post.shares.length} Shares</button>
            </div>
          </div>

          {/* Toggle Buttons */}
          
          

          {/* Display Comments */}
                    {/* Toggle Buttons */}
                    {post.showComments && post.comments.length > 0 && (
            <div className="p-4 bg-gray-100 rounded-lg mt-2">
              <h3 className="text-sm font-semibold mb-2">Comments:</h3>
              {post.comments.map((comment, index) => (
                <p key={index} className="text-gray-700 text-sm">{comment.content}</p>
              ))}
            </div>
          )}
           {post.showLikes && post.likes.length > 0 && (
      <div className="bg-gray-100 p-3 rounded-lg mt-4">
        <h3 className="text-sm font-semibold mb-2">Liked by:</h3>
        {post.likes.map((like) => (
          <Link href={`/${like.user.id}`} key={like.user.id}>
            <p className="text-gray-700 text-sm hover:underline">
              {like.user.username}
            </p>
          </Link>
        ))}
      </div>
    )}

          {/* Display Shares */}
          {post.showShares && post.shares?.length > 0 && (
            <div className="p-4 bg-gray-100 rounded-lg mt-2">
              <h3 className="text-sm font-semibold mb-2">Shared by:</h3>
              {post.shares.map((share, index) => (
                <p key={index} className="text-gray-700 text-sm" >
                  User ID: {share.userId}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}


    </div>
  );
}
