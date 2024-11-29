"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Time difference calculation function
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

const Messages = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  if (loading) return <p className="text-center text-gray-500">Loading messages...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
    <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Messages</h1>
    {conversations.length === 0 ? (
      <p className="text-center text-gray-500">No messages found</p>
    ) : (
      <div className="space-y-6">
        {conversations.map((conversation, index) => (
          <Link 
            key={index} 
            href={`/message/${conversation.userId}`} 
            className="block border rounded-lg p-4 shadow-md bg-white hover:bg-gray-100 transition duration-150 ease-in-out"
          >
            <div className="flex items-center gap-4">
             
              
              {/* Message Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{conversation.username}</h3>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                <p className="text-xs text-gray-400">{getTimeDifference(conversation.createdAt)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
  
  );
};

export default Messages;
