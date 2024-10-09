import { useState } from 'react';

function FriendRequestActions({ senderId, receiverId, requestId }) {
  const [responseMessage, setResponseMessage] = useState('');

  // Send friend request
  async function sendRequest() {
    const response = await fetch('/api/friend-request/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId }),
    });
    const result = await response.json();
    setResponseMessage(result.message || result.error);
  }

  // Accept friend request
  async function acceptRequest() {
    const response = await fetch('/api/friend-request/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    const result = await response.json();
    setResponseMessage(result.message || result.error);
  }

  // Reject friend request
  async function rejectRequest() {
    const response = await fetch('/api/friend-request/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    const result = await response.json();
    setResponseMessage(result.message || result.error);
  }

  return (
    <div>
      <button onClick={sendRequest}>Send Friend Request</button>
      <button onClick={acceptRequest}>Accept Friend Request</button>
      <button onClick={rejectRequest}>Reject Friend Request</button>
      <p>{responseMessage}</p>
    </div>
  );
}

export default FriendRequestActions;
