import { Inter } from 'next/font/google';
import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import { PostgrestResponse } from '@supabase/supabase-js';
import { createClientStaticProps } from '@/utils/supabase/supabase-static-props';

const inter = Inter({ subsets: ['latin'] });

const Home = ({ lessons }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <main className={`min-h-screen p-24 ${inter.className}`}>
    <ul className="w-full max-w-3xl mx-auto my-16 px-2 flex flex-col gap-1">
      {lessons?.map(lesson => (
        <li key={lesson.id}>
          <Link
            href={`/${lesson.id}`}
            className="p-8 h-40 rounded shadow text-xl flex cursor-pointer hover:border-cyan-950 hover:border-2"
          >
            {lesson.title}
          </Link>
        </li>
      ))}
    </ul>
  </main>
);

export const getStaticProps: GetStaticProps<{
  lessons: Database['public']['Tables']['lesson']['Row'][] | null;
}> = async () => {
  const supabase = createClientStaticProps();

  const { data: lessons }: PostgrestResponse<Database['public']['Tables']['lesson']['Row']> =
    await supabase.from('lesson').select('*');

  return { props: { lessons } };
};

export default Home;
