import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import UserContextProvider from '@/context/userContext';
import NavBar from '@/components/NavBar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <NavBar />
      <Component {...pageProps} />
    </UserContextProvider>
  );
}
