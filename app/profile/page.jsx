'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login page if there is no session
  if (status === 'loading') {
    return <p className="text-center">Loading...</p>; // You can replace this with a spinner or a skeleton UI
  }

  if (!session) {
    router.push('/login');
    return null; // Prevent further rendering if redirecting
  }

  const firstNameValue = session.user?.username || session.user?.name;
  const email = session.user.email || "";
  const lastName = session.user.lastName || "";
  const livingIn = session.user.livingIn || "";
  const wentTo = session.user.wentTo || "";
  const worksAt = session.user.worksAt || "";
  const picture = session.user.profilePicture || "";
  const firstName = firstNameValue.split(' ')[0]; 
  console.log(session,firstName, lastName, livingIn, worksAt, wentTo)
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hello, <span className="text-blue-600">{firstName}</span></h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        {lastName && <p className="text-lg">Last Name: <span className="font-semibold">{lastName}</span></p>}
        {livingIn && <p className="text-lg">Living in: <span className="font-semibold">{livingIn}</span></p>}
        {wentTo && <p className="text-lg">Went to: <span className="font-semibold">{wentTo}</span></p>}
        {worksAt && <p className="text-lg">Works at: <span className="font-semibold">{worksAt}</span></p>}
        {picture && <div className="mt-4"><img src={picture} alt="Profile Picture" className="rounded-full w-24 h-24" /></div>}
        <p className="text-lg mt-2">Email: <span className="font-semibold">{email}</span></p>
      </div>
      
      <div className="flex justify-between">
        <Link href="/profile/edit">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Edit Profile
          </button>
        </Link>
        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Sign Out
        </button>
      </div>
    </main>
  );
}
