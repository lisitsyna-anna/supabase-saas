import { GetServerSideProps } from 'next';
import { createClientServerProps } from '@/utils/supabase/supabase-server-props';
import { useUser } from '@/context/userContext';

const Dashboard = () => {
  const { user, isLoadingUser } = useUser();

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-3xl mb-6">Dashboard</h1>
      {!isLoadingUser && (
        <p className="mb-6">
          {user?.is_subscribed ? `Subscribed: ${user.interval}` : 'Not subscribed'}
        </p>
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
