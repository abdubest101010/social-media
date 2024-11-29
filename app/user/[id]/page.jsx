'use client';
import AllPosts from '@/components/AllPosts';
import UserProfile from '@/components/UserProfile';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams(); // Access params directly
  const { id } = params; // Extract "id" from the route params

  return (
    <div>
      {/* Pass the dynamic user ID to the reusable UserProfile component */}
      <UserProfile id={id}/>
      <div >
            
            <AllPosts effectiveUserId={id} />
          </div>
     
    </div>
  );
}
