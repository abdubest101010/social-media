'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FriendsList from './ShareFriend';
import { AiFillLike, AiOutlineComment, AiOutlineLike, AiOutlineShareAlt } from 'react-icons/ai';

export default function PostsPage({effectiveUserId, id}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [showFriendsList, setShowFriendsList] = useState(null);
  const [showLikes, setShowLikes] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const method = effectiveUserId || id ? 'POST' : 'GET';
        const url = id ? '/api/posts/singlePost' : '/api/posts/getPost';
  
        const body =
          id && effectiveUserId
            ? { id, effectiveUserId } // If both `id` and `effectiveUserId` are provided
            : id
            ? { id } // If only `id` is provided
            : { effectiveUserId }; // If only `effectiveUserId` is provided
  
        const options =
          method === 'POST'
            ? {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              }
            : {};
  
        const res = await fetch(url, options);
  
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status}`);
        }
  
        const data = await res.json();
  
        // Process posts (sorting, mapping, etc.)
        const sortedPosts = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
  
        const postsWithStatus = sortedPosts.map((post) => ({
          ...post,
          hasLiked: post.likes?.some((like) => like.userId === effectiveUserId),
          likeCount: post.likes?.length || 0,
          shareCount: post.shares.length || 0,
          comments: post.comments || [],
          newComment: '',
          showComments: false,
          showLikes: false,
        }));
  
        setPosts(postsWithStatus);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
  
    // Trigger the function if authenticated
    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, effectiveUserId, id]); // Include `id` in the dependency array
  
  

  const handleLike = async (postId, hasLiked) => {
    try {
      const url = '/api/likes';
      const method = hasLiked ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      });

      if (res.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likeCount: post.likeCount + (hasLiked ? -1 : 1), hasLiked: !hasLiked }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const handleShare = (postId) => {
    setShowFriendsList((prevState) => (prevState === postId ? null : postId));
  };

  const handleCommentToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const handleLikesToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showLikes: !post.showLikes } : post
      )
    );
  };

  const handleNewComment = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, newComment } : post
      )
    );
  };

  const submitComment = async (postId, newComment) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId, content: newComment }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, updatedPost],
                  newComment: '',
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
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
  
  const handleSharesToggle = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showShares: !post.showShares } : post
      )
    );
  };
  if (loading) return <div className="text-center">Loading...</div>;

  return<div className="container  mx-auto px-2  sm:px-4 py-4 " >
  
  {posts.length === 0 ? (
    <p className="text-gray-500 text-center">No posts available</p>
  ) : (
    <div className="space-y-6">
  {posts.map((post) => (
    <div
      key={post.id}
      className="rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow max-w-2xl mx-auto"
    >
      {/* Post Header */}
      <div className="flex justify-between items-center mb-3">
        <Link
          href={`/user/${post.user.id}`}
          className="text-blue-500 hover:underline font-semibold text-sm"
        >
          {post.user.username}
        </Link>
        <p className="text-blue-800 text-xs">
          {getTimeDifference(post.createdAt)}
        </p>
      </div>

      {/* Post Content */}
      <Link href={`/posts/${post.id}`} className="block mb-4">
        {post.imageUrl && (
          <div className="relative w-full mx-auto mb-4">
            <Image
              src={post.imageUrl}
              alt="Post image"
              
              width={1200} // You can adjust this based on your layout
              height={800} // Adjust the height to maintain proper aspect ratio
              className="object-cover w-full h-auto rounded-lg"
            />
          </div>
        )}
        <h2 className="text-lg font-medium text-gray-800 mb-2">{post.content}</h2>
      </Link>

      {/* Interaction Buttons */}
      <div className="flex justify-between items-center text-gray-600 border-t pt-4 w-full">
        {/* Like Button */}
        <div className="flex items-center space-x-2 w-1/3 justify-center">
          <button
            onClick={() => handleLike(post.id, post.hasLiked)}
            className={`text-xl ${post.hasLiked ? 'text-red-500' : 'text-gray-400'} hover:scale-110`}
          >
            {post.hasLiked ? <AiFillLike color="blue" size={25} /> : <AiOutlineLike size={25} color="blue" />}
          </button>
          {post.likeCount > 0 ? (
            <button
              onClick={() => handleLikesToggle(post.id)}
              className="text-sm text-blue-900 hover:underline"
            >
              {post.likeCount} Likes
            </button>
          ) : (
            <p className="text-sm">Like</p>
          )}
        </div>

        {/* Comment Button */}
        {post.comments.length === 0 ? (
          <button
            onClick={() => handleCommentToggle(post.id)}
            className="cursor-pointer hover:scale-110 flex gap-4 text-blue-900 text-sm"
          >
            <AiOutlineComment size={20} color="blue" /> Comment
          </button>
        ) : (
          <p
            className="cursor-pointer flex gap-4 text-blue-900 text-sm"
            onClick={() => handleCommentToggle(post.id)}
          >
            <AiOutlineComment size={20} color="blue" /> {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
          </p>
        )}

        {/* Share Button */}
        <div className="flex items-center space-x-2 w-1/3 justify-center mt-2 sm:mt-0">
          <button
            onClick={() => handleShare(post.id)}
            className="text-xl text-gray-400 hover:text-green-500 hover:scale-110"
          >
            <AiOutlineShareAlt size={25} color="blue" />
          </button>
          {post.shareCount > 0 ? (
            <button
              onClick={() => handleSharesToggle(post.id)}
              className="text-sm text-blue-800 hover:underline"
            >
              {post.shares?.length} Shares
            </button>
          ) : (
            <p className="text-sm">Share</p>
          )}
        </div>
      </div>

      {/* Additional Details */}
      {showFriendsList === post.id && <FriendsList postId={post.id} />}
      {post.showLikes && (
        <div className="bg-gray-100 p-3 rounded-lg mt-4">
          <h3 className="text-sm font-semibold mb-2">Liked by:</h3>
          {post.likes.map((like) => (
            <Link href={`/${like.user.id}`} key={like.user.id}>
              <p className="text-gray-700 text-sm hover:underline">{like.user.username}</p>
            </Link>
          ))}
        </div>
      )}
      {post.showComments && (
        <div className="mt-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start mt-2">
              <Link
                href={`/${comment.user.id}`}
                className="text-blue-500 hover:underline font-semibold mr-2"
              >
                {comment.user.username}
              </Link>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          ))}
          <div className="mt-4">
            <input
              type="text"
              value={post.newComment}
              onChange={(e) => handleNewComment(post.id, e.target.value)}
              placeholder="Add a comment"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => submitComment(post.id, post.newComment)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Comment
            </button>
          </div>
        </div>
      )}
      {post.showShares && post.shares.length > 0 && (
        <div className="bg-gray-100 p-3 rounded-lg mt-4">
          <h3 className="text-sm font-semibold mb-2">Shared by:</h3>
          {post.shares.map((share, index) => (
            <Link key={index} href={`/${share.user.id}`} passHref>
              <p className="text-gray-700 text-sm hover:underline">{share.user.username}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  ))}
</div>

  


  )}
</div>

}
