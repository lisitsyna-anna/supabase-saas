import { useEffect } from 'react';
import { useUser } from '@/context/userContext';

const Login = () => {
  const { login } = useUser();

  useEffect(() => {
    login();
  }, [login]);

  return <div>Loggin in</div>;
};

export default Login;
