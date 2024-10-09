export default function RejectFriendRequest({ senderId, receiverId }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const rejectRequest = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/friend-request/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId, receiverId }),
        });
  
        const data = await res.json();
        if (res.ok) {
          setStatus('Friend request rejected!');
        } else {
          setStatus(data.error);
        }
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        setStatus('Error rejecting request.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div>
        <button onClick={rejectRequest} disabled={loading}>
          {loading ? 'Rejecting...' : 'Reject Request'}
        </button>
        {status && <p>{status}</p>}
      </div>
    );
  }
  