'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const FriendRequests = () => {
  const { data: session, status } = useSession();
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFriendRequests();
    }
  }, [status]);

  const fetchFriendRequests = async () => {
    const userId = session?.user?.id;
    try {
      const res = await fetch(`/api/friend-request/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok) {
        setFriendRequests(data.friendRequests);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const handleAccept = async (requestId) => {
    await handleRequestAction(requestId, "accept");
  };

  const handleReject = async (requestId) => {
    await handleRequestAction(requestId, "reject");
  };

  const handleRequestAction = async (requestId, action) => {
    const endpoint = action === "accept" ? "/api/friend-request/accept" : "/api/friend-request/reject";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        fetchFriendRequests(); // Refresh requests after action
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to view friend requests</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Friend Requests</h1>
      {friendRequests.length > 0 ? (
        <ul>
          {friendRequests.map((request) => (
            <li key={request.id} className="border p-4 mb-4">
              <p><strong>Sender:</strong> {request.sender.username}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending friend requests found.</p>
      )}
    </div>
  );
};

export default FriendRequests;
