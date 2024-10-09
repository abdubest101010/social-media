// /app/posts/[id]/page.jsx
'use client';
import UserProfile from '@/components/UserProfile';
import { useParams } from 'next/navigation';

export default function Page() {
  // Get the dynamic user ID from the URL (e.g., /posts/1 => id is 1)
  const { id } = useParams(); // Extracts "id" from the route params

  return (
    <div>
      {/* Pass the dynamic user ID to the reusable UserProfile component */}
      <UserProfile id={id} />
    </div>
  );
}
