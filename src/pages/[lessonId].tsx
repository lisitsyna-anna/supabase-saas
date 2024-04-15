import { useEffect, useState } from 'react';
import type { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from 'next';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { Database, Tables } from '@/types';
import { createClientStaticProps } from '@/utils/supabase/supabase-static-props';
import { createClientComponent } from '@/utils/supabase/supabase-component';
import { ParsedUrlQuery } from 'querystring';
import ReactPlayer from 'react-player';

interface LessonDetailsParams extends ParsedUrlQuery {
  lessonId: string;
}

const LessonDetails = ({ lesson }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const supabase = createClientComponent();

  useEffect(() => {
    const getPremiumContent = async () => {
      if (!lesson) {
        return;
      }
      try {
        const {
          data: premiumContent,
          error: premiumContentError,
        }: PostgrestSingleResponse<{ video_url: string }> = await supabase
          .from('premium_content')
          .select('video_url')
          .eq('id', lesson.id)
          .single();

        if (premiumContentError) {
          throw new Error(premiumContentError.message);
        }

        if (!premiumContent) {
          console.log("This lesson doesn't have premium content");
          return;
        }
        setVideoURL(premiumContent.video_url);
      } catch (error) {
        console.error(`Error in getting premium content: ${error}`);
      }
    };

    getPremiumContent();
  }, [lesson, supabase]);

  return (
    <div className="w-full max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-3xl mb-6">{lesson?.title}</h1>
      <p className="mb-8">{lesson?.description}</p>
      {videoURL && <ReactPlayer url={videoURL} width="100%" />}
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const supabase = createClientStaticProps();

  const {
    data: lessons,
    error: lessonsError,
  }: PostgrestResponse<Database['public']['Tables']['lesson']['Row']> = await supabase
    .from('lesson')
    .select('id');

  if (!lessons || lessonsError) {
    return {
      paths: [],
      fallback: false,
    };
  }

  const paths =
    lessons.map(({ id }) => ({
      params: {
        lessonId: id.toString(),
      },
    })) || [];

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  {
    lesson: Tables<'lesson'> | null;
  },
  LessonDetailsParams
> = async context => {
  const supabase = createClientStaticProps();
  const lessonId = context.params?.lessonId as string;

  const { data: lesson }: PostgrestSingleResponse<Tables<'lesson'>> = await supabase
    .from('lesson')
    .select('*')
    .eq('id', lessonId)
    .single();

  return {
    props: {
      lesson,
    },
  };
};

export default LessonDetails;
