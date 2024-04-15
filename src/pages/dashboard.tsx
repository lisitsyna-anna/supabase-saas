import { GetServerSideProps } from 'next';
import { createClientServerProps } from '@/utils/supabase/supabase-server-props';
import { useUser } from '@/context/userContext';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const { user, isLoadingUser } = useUser();
  const router = useRouter();

  const loadPortal = async () => {
    const { data }: AxiosResponse<{ url: string }> = await axios.get('api/portal');
    router.push(data.url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-3xl mb-6">Dashboard</h1>
      {!isLoadingUser && (
        <>
          <p className="mb-6">
            {user?.is_subscribed && user.interval
              ? `Subscribed: ${user.interval}`
              : 'Not subscribed'}
          </p>
          <button
            onClick={loadPortal}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Manage Subscription
          </button>
        </>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const supabase = createClientServerProps(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
      props: {},
    };
  }

  return { props: {} };
};

export default Dashboard;
