import { createContext, useState, useEffect, useContext } from 'react';
import { getSession } from 'next-auth/react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      const session = await getSession();
      if (session) {
        try {
          const res = await fetch('/api/user');
          const data = await res.json();
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
      setLoading(false);
    }
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  return useContext(UserContext);
}
