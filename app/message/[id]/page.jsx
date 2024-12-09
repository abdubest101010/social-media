"use client"
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const MessagePage = ({ params }) => {
  const { id: receiverId } = params;
  const numericReceiverId = parseInt(receiverId, 10);
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState(false);
  const [userInfo, setUserInfo] = useState("");
  const userId = session?.user?.id;
  const username = session?.user?.username;

  // Define fetchMessages first
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/message/conversation?userId=${userId}&friendId=${numericReceiverId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      } else {
        if (res.status === 403) setErrorMessage('You have been blocked by this user.');
        else throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('An error occurred while fetching messages.');
    } finally {
      setLoading(false);
    }
  }, [userId, numericReceiverId]);

  // Define checkBlockStatus next
  const checkBlockStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userId, blockedId: numericReceiverId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(data.isBlocked);
        setBlockedBy(data.blockedBy);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  }, [userId, numericReceiverId]);

  // Then use them in useEffect
  useEffect(() => {
    if (userId && numericReceiverId) {
      fetchMessages();
      checkBlockStatus();
    }
  }, [userId, numericReceiverId, fetchMessages, checkBlockStatus]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    // Temporarily add the message to the list as "sending"
    const tempMessage = {
      id: Date.now(), // Temporary ID until confirmed by the server
      content: newMessage,
      senderId: userId,
      isSending: true, // Temporary flag for styling
    };
  
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage(''); // Clear the input field immediately
  
    try {
      const res = await fetch('/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: numericReceiverId,
          content: newMessage,
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        // Replace the temporary message with the server-confirmed message
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, id: data.message.id, isSending: false }
              : msg
          )
        );
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
  
      // Remove the temporary message on error
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== tempMessage.id)
      );
  
      setErrorMessage(`An error occurred while sending the message: ${error.message}`);
    }
  };
  

  const blockUser = async () => {
    try {
      const response = await fetch('/api/user/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userId, blockedId: numericReceiverId }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('User blocked successfully!');
        setIsBlocked(true);
      } else {
        alert(result.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('An error occurred while blocking the user.');
    }
  };

  const unblockUser = async () => {
    try {
      const response = await fetch('/api/user/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: numericReceiverId }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('User unblocked successfully!');
        setIsBlocked(false);
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
    <div className="container mx-auto p-4 max-w-md border rounded-lg shadow-md bg-white">
  <h2 className="text-xl font-semibold text-center mb-4">Messenger</h2>

  {/* Block Status Messages */}
  {blockedBy ? (
    <p className="text-center text-red-500 mb-2">You are blocked by this user. You cannot send messages.</p>
  ) : (
    <div className="flex justify-center mb-2">
      {isBlocked ? (
        <button onClick={unblockUser} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Unblock User
        </button>
      ) : (
        <button onClick={blockUser} className="bg-red-500 text-white px-4 py-2 rounded">
          Block User
        </button>
      )}
    </div>
  )}

  {/* Messages */}
  <div className="messages-container mb-4 p-2 bg-gray-100 rounded-lg h-96 overflow-y-scroll">
  {messages.length > 0 ? (
    messages.map((message) => (
      <div
        key={message.id}
        className={`flex mb-2 ${
          message.senderId === userId ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`rounded-xl px-4 py-2 max-w-xs shadow ${
            message.senderId === userId
              ? message.isSending
                ? 'bg-blue-300 text-white opacity-70' // Style for sending message
                : 'bg-blue-500 text-white'
              : 'bg-gray-300 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500">No messages found.</p>
  )}
</div>



  {/* Error Message */}
  {errorMessage && <div className="text-red-500 mb-4 text-center">{errorMessage}</div>}

  {/* Send Message */}
  {!blockedBy && !isBlocked && (
    <div className="send-message-container flex items-center">
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        className="w-full border border-gray-300 rounded-l-lg p-2 resize-none"
      />
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
      >
        Send
      </button>
    </div>
  )}
</div>

  );
};

export default MessagePage;
