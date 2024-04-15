import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';

const Logout = () => {
  const { logout } = useUser();

  useEffect(() => {
    logout();
  }, [logout]);

  return <p>Loghing out</p>;
};

export default Logout;
