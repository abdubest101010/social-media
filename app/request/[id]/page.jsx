'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const MessagePage = ({ params }) => {
  const { id: receiverId } = params; // Get the receiver's ID from the URL
  const numericReceiverId = parseInt(receiverId, 10); // Convert receiverId to an integer
  const { data: session } = useSession(); // Session from Next Auth
  const [messages, setMessages] = useState([]); // Store messages
  const [newMessage, setNewMessage] = useState(''); // Store new message input
  const [loading, setLoading] = useState(true); // Loading state
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages
  const [isBlocked, setIsBlocked] = useState(false); // Track if the user is blocked
  const [blockedBy, setBlockedBy] = useState(false); // Track if the user is blocked by the other user
  const [userInfo, setUserInfo] = useState(""); // To hold the username of the other user
  const userId = session?.user?.id; // Logged in user's ID
  const username = session?.user?.username; // Logged in user's username

  // Fetch the messages and block status when the component mounts
  useEffect(() => {
    if (userId && numericReceiverId) {
      fetchMessages();
      checkBlockStatus();
      UserProfile();
    }
  }, [userId, numericReceiverId]);

  // Function to fetch messages between the user and the receiver
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/message/conversation?userId=${userId}&friendId=${numericReceiverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 403) { // Assuming 403 indicates the user is blocked
          setErrorMessage('You have been blocked by this user.');
        } else {
          throw new Error('Failed to fetch messages');
        }
      } else {
        const data = await res.json();
        setMessages(data.messages); // Set the fetched messages
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('An error occurred while fetching messages.');
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the user is blocked
  const checkBlockStatus = async () => {
    try {
      const res = await fetch('/api/user/check-blocked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockerId: userId,
          blockedId: numericReceiverId
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(data.isBlocked);
        setBlockedBy(data.blockedBy);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (blockedBy) {
      setErrorMessage('You cannot send messages to this user as you are blocked.');
      return;
    }

    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: numericReceiverId,
          content: newMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add the new message to the conversation
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.message.id,
          content: data.message.content,
          sender: { username: username || 'You' }, // Show the sender's username (or 'You' if it's the logged-in user)
        },
      ]);

      setNewMessage(''); // Clear the input after sending
    } catch (error) {
      console.error('Error sending message:', error.message);
      setErrorMessage(`An error occurred while sending the message: ${error.message}`); // Set a detailed error message
    }
  };

  // Function to block a user
  const blockUser = async () => {
    try {
      const response = await fetch('/api/user/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockerId: userId, blockedId: numericReceiverId }), // Include both blockerId and blockedId
      });

      const result = await response.json();

      if (response.ok) {
        alert('User blocked successfully!');
        setIsBlocked(true); // Update block status to reflect the change
      } else {
        alert(result.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('An error occurred while blocking the user.');
    }
  };

  const UserProfile = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: numericReceiverId }), // Include both blockerId and blockedId
      });

      const result = await response.json();

      if (response.ok) {
        setUserInfo(result.username); // Update user info
      } else {
        alert(result.error || 'Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('An error occurred while fetching the user.');
    }
  };

  // Function to unblock a user
  const unblockUser = async () => {
    try {
      const response = await fetch('/api/user/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockedId: numericReceiverId }), // Send only the blockedId
      });

      const result = await response.json();

      if (response.ok) {
        alert('User unblocked successfully!');
        setIsBlocked(false); // Update block status to reflect the change
      } else {
        alert(result.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('An error occurred while unblocking the user.');
    }
  };

  if (loading) return <div>Loading conversation...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold">Conversation</h2>

      {/* Conditional rendering based on block status */}
      {blockedBy ? (
        <>
          <p>You are blocked by {userInfo}. You cannot send messages.</p>
          <button onClick={blockUser} className="bg-red-500 text-white px-4 py-2 rounded mb-4">
            Block User
          </button>
        </>
      ) : (
        isBlocked ? (
          <>
            <p>You block {userInfo}. You cannot receive messages.</p>
            <button onClick={unblockUser} className="bg-yellow-500 text-white px-4 py-2 rounded mb-4">
              Unblock User
            </button>
          </>
        ) : (
          <>
            <button onClick={blockUser} className="bg-red-500 text-white px-4 py-2 rounded mb-4">
              Block User
            </button>
          </>
        )
      )}

      {/* Display error message if exists */}
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      <div className="messages-container mb-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.senderId === userId ? 'sent' : 'received'}`}>
              <p><strong>{message.sender.username}:</strong> {message.content}</p>
            </div>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </div>

      {/* Display message input only if not blocked by the other user */}
      {!blockedBy && !isBlocked && (
        <div className="send-message-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full border p-2"
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send Message
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
