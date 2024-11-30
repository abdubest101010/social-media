"use client";
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // Memoize fetchNotifications to ensure a stable reference
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notification?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        console.log(data);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('An error occurred while fetching notifications.');
    }
  }, [userId]);

  // Fetch notifications when status and userId are valid
  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchNotifications();
    }
  }, [status, userId, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notification/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('An error occurred while marking as read.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Notifications</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const linkHref = notif.postId
              ? `/posts/${notif.postId}`
              : `/message/${notif.senderId}`;

            return (
              <Link
                key={notif.id}
                href={linkHref}
                onClick={() => markAsRead(notif.id)}
                className={`flex items-center justify-between p-4 mb-2 rounded-lg cursor-pointer ${
                  notif.isRead ? 'bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <p className="text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200 ease-in-out">
                  {notif.content}
                </p>
                {!notif.isRead && (
                  <span className="text-blue-600 text-xs font-semibold">Unread</span>
                )}
              </Link>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
