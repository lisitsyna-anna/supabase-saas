import { ReactNode, createContext, useState, useEffect, Context, useContext } from 'react';
import { useRouter } from 'next/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { Database, CombinedUserType } from '@/types';
import { createClientComponent } from '@/utils/supabase/supabase-component';

type UserContextType = {
  user: CombinedUserType | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoadingUser: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoadingUser: true,
});

const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<CombinedUserType | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const supabase = createClientComponent();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const {
          data: { user: sessionUser },
          error: sessionUserError,
        } = await supabase.auth.getUser();

        if (sessionUserError) {
          throw new Error(`Error getting userSession: ${sessionUserError.message}`);
        }

        if (!sessionUser) {
          console.log('There is no such user');
          return;
        }

        const {
          data: profile,
          error: profileError,
        }: PostgrestSingleResponse<Database['public']['Tables']['profile']['Row']> = await supabase
          .from('profile')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          throw new Error(`Error getting profile: ${profileError.message}`);
        }

        if (!profile) {
          console.log('There is no such profile');
          return;
        }

        setUser({ ...sessionUser, ...profile } as CombinedUserType);
        setIsLoadingUser(false);
      } catch (error) {
        console.error('Error in the getUserProfile: ', error);
      }
    };

    getUserProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      getUserProfile();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async () => {
    try {
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/api/auth/callback',
        },
      });
      console.log('data login', data);
    } catch (error) {
      console.error('Error in the login: ', error);
    }
  };

  const logout = async () => {
    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw new Error(logoutError.message);
      }

      router.push('/');
      setUser(null);
    } catch (error) {
      console.error('Error in the logout: ', error);
    }
  };

  const exposed = {
    user,
    login,
    logout,
    isLoadingUser,
  };

  return <UserContext.Provider value={exposed}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

export default UserContextProvider;
