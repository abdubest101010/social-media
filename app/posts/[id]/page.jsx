"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";
import { AiOutlineLike, AiOutlineShareAlt } from "react-icons/ai";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(null); // For share confirmation

  // Toggles for likes, comments, and shares
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShares, setShowShares] = useState(false);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
    for (let interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/getPost/${id}`);
          if (!response.ok) {
            throw new Error("Post not found");
          }
          const data = await response.json();
          setPost(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });

      if (response.ok) {
        const updatedPost = await response.json(); // Assuming API returns the updated post
        setPost(updatedPost);
        setShareSuccess("Post shared successfully!");
        setTimeout(() => setShareSuccess(null), 3000);
      } else {
        throw new Error("Failed to share post");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return<div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-gray-800">{post.content}</h2>
    {post.imageUrl && (
      <img src={post.imageUrl} alt="Post image" className="w-full h-auto mt-4 rounded-xl shadow-md" />
    )}
    <div className="flex items-center text-gray-500 text-sm mt-3">
      <span>Posted by {post.user?.username} • {timeAgo(post.createdAt)}</span>
    </div>
  </div>

  {/* Social Interaction Row (Likes, Comments, Shares) */}
  <div className="flex space-x-6 mt-6">
    {/* Likes Toggle with Icon (First Button) */}
    <button
      onClick={() => setShowLikes((prev) => !prev)}
      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 transition duration-300"
    >
      {post.likes.length > 0 && (
        <>
          <AiOutlineLike className="text-xl" />
          <span>{showLikes ? "Hide Likes" : `Likes (${post.likes.length})`}</span>
        </>
      )}
    </button>

    {/* Comments Toggle with Icon (Second Button) */}
    <button
      onClick={() => setShowComments((prev) => !prev)}
      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 transition duration-300"
    >
      {post.comments.length > 0 && (
        <>
          <FiMessageCircle className="text-xl" />
          <span>{showComments ? "Hide Comments" : `Comments (${post.comments.length})`}</span>
        </>
      )}
    </button>

    {/* Shares Toggle with Icon (Third Button) */}
    <button
      onClick={() => setShowShares((prev) => !prev)}
      className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 transition duration-300"
    >
      {post.shares.length > 0 && (
        <>
          <AiOutlineShareAlt className="text-xl" />
          <span>{showShares ? "Hide Shares" : `Shares (${post.shares.length})`}</span>
        </>
      )}
    </button>
  </div>

  {/* Show Shares Section */}
  {showShares && post.shares.length > 0 && (
    <div className="mt-4">
      {post.shares.map((share, index) => (
        <p key={index} className="text-gray-700 text-sm">Shared by: <strong>{share.user.username}</strong></p>
      ))}
    </div>
  )}
  {showShares && post.shares.length === 0 && <p className="text-gray-500 text-sm">No shares yet.</p>}

  {/* Show Likes Section */}
  {showLikes && post.likes.length > 0 && (
    <div className="mt-4">
      {post.likes.map((like, index) => (
        <p key={index} className="text-gray-700 text-sm">Liked by: <strong>{like.user.username}</strong></p>
      ))}
    </div>
  )}
  {showLikes && post.likes.length === 0 && <p className="text-gray-500 text-sm">No likes yet.</p>}

  {/* Show Comments Section */}
  {showComments && post.comments.length > 0 && (
    <div className="mt-4 space-y-3">
      {post.comments.map((comment) => (
        <div key={comment.id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
          <p className="text-gray-800">{comment.content}</p>
          <p className="text-gray-500 text-xs mt-2">
            Commented by <strong>{comment.user?.username}</strong> • {timeAgo(comment.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )}
  {showComments && post.comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
</div>
};

export default PostPage;
