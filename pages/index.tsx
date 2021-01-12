import { faHotjar } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import { HOTPOSTS, HOTPOSTSMUTATION } from '../components/gqlFragment';
import moment from 'moment';
import {
  faCommentDots,
  faEye,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client';
import Head from 'next/head';

Home.getInitialProps = async (ctx) => {
  const result = await ctx.apolloClient.query({
    query: HOTPOSTS,
  });
  return result.data;
};

export default function Home({ hotPosts }) {
  const reFetchNum = useRef(0);
  const [posts, setPosts] = useState(hotPosts);
  const target = useRef(null);

  const [fetching, setFetching] = useState(true);

  const [fetchMore] = useMutation(HOTPOSTSMUTATION, {
    onCompleted({ hotPosts }) {
      if (!hotPosts.length) return setFetching(false);
      setPosts(posts.concat(hotPosts));
    },
  });

  const haveImg = useCallback((content) => {
    const regEx = new RegExp(`https://kpop-app-image[^">]+`);
    const imgPath = content.match(regEx);
    if (imgPath) return <img src={imgPath} />;
    else return <img src='/no-img.png' />;
  }, []);

  const postCount = useCallback((count) => {
    if (count >= 1000) {
      return <span className='big_count'>{(count / 1000).toFixed(1)}k</span>;
    } else return `${count}`;
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(handleIntersection, { threshold: 0 });

    if (fetching && target.current) {
      io.observe(target.current);
    }

    return () => io && io.disconnect();
  }, [posts, fetching]);

  const handleIntersection = ([entry]) => {
    if (entry.isIntersecting) {
      reFetchNum.current++;
      fetchMore({ variables: { number: reFetchNum.current } });
    }
  };
  return (
    <>
      <Head>
        <title>biaskpop | K-POP Forum</title>
        <meta
          name='description'
          content='K-POP forum for K-pop fans around the world! Post freely without signing up for membership. BTS, BlackPink, EXO, NCT, SEVENTEEN, TWICE... '
        />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <meta
          name='google-site-verification'
          content='ntTeC9gGZQikjYJC695zknszT4Y0idIMv896Qaqa2Ps'
        />
        <meta name='robots' content='index,follow' />
        <meta
          property='og:image'
          content='https://kpop-app-image-storage.s3.us-east-2.amazonaws.com/biaskpop.png'
        />
        <meta name='msvalidate.01' content='FF33EEABEE4049B79C7EF5EAFFB03E72' />
      </Head>
      <div className='home_container'>
        <div className='posts_container'>
          <div className='sort_by'>
            <div className='sort_by_hot'>
              <div className='hot_posts'>HOT</div>
            </div>
          </div>
          <div className='posts_list'>
            {posts.map((post, i) => (
              <a key={post._id} href={`/board/${post.category}/${post.number}`}>
                <div
                  className='post'
                  ref={posts.length - 1 == i ? target : null}
                >
                  {haveImg(post.content)}
                  <div className='post_main'>
                    <h3 className='title'>{post.title}</h3>
                    <div className='user_info'>
                      <p className='user_nickname'>
                        by <span className='nickname'>{post.nickname}</span>
                      </p>
                      <p className='created_at'>
                        {moment(post.createdAt).format('YYYY.MM.DD')}
                      </p>
                    </div>
                  </div>
                  <div className='post_bottom'>
                    <p className='category_info'>#{post.category}</p>
                    <div className='post_count'>
                      <p className='view_info'>
                        <FontAwesomeIcon
                          className='fontawesome_icon'
                          icon={faEye}
                        />{' '}
                        {postCount(post.views)}
                      </p>
                      <p className='comment_info'>
                        <FontAwesomeIcon
                          className='fontawesome_icon'
                          icon={faCommentDots}
                        />{' '}
                        {postCount(post.commentCount)}
                      </p>
                      <p className='like_info'>
                        <FontAwesomeIcon
                          className='fontawesome_icon'
                          icon={faHeart}
                        />{' '}
                        {postCount(post.likeCount)}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
