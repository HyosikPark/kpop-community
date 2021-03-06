import Link from 'next/link';
import { ALLPOSTS_SORTBY_LIKE } from '../../../util/gqlFragment';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import SearchPosts from '../../../components/SearchPosts';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faCommentDots,
  faFilm,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { menu, navMenu } from '../../../util/Menu';
import { BoardProps } from '../[id]';
import { NextWithApolloContext } from '../..';

function pageNums(postCount: number, curPage: number): number[] {
  if (!postCount) return [1];

  let arr = [];

  const calc1 = Math.ceil(curPage / 10);
  const restPage = postCount - 150 * (calc1 - 1);
  const calc2 = Math.ceil(restPage / 15);

  let initPage = 10 * calc1 - 9;
  const lastPage = calc2 >= 10 ? initPage + 9 : initPage + calc2 - 1;

  while (initPage <= lastPage) {
    arr.push(initPage);
    initPage++;
  }

  return arr;
}

function postDate(date: string) {
  const now = moment(new Date().toISOString());
  const postDate = moment(date);

  if (moment.duration(now.diff(postDate)).asDays() < 1) {
    return moment(date).format('hh:mm');
  }

  return moment(date).format('MM.DD');
}

SortByHotBoard.getInitialProps = async (ctx: NextWithApolloContext) => {
  try {
    const { curPage, id: star } = ctx.query;
    const existBoard = menu.filter(
      (a) => a.names.filter((e) => e == star).length
    ).length;

    if (!existBoard) {
      if (!navMenu.includes(star as string)) throw new Error('');
    }

    const result = await ctx.apolloClient.query({
      query: ALLPOSTS_SORTBY_LIKE,
      variables: { category: `${star}`, curPage: +curPage },
    });

    return {
      ...result.data.allPostsSortByLike,
      curPage: Number(curPage),
      star,
    };
  } catch (e) {
    ctx.res.writeHead(302, {
      Location: `/category`,
    });
    ctx.res.end();

    return {};
  }
};

function SortByHotBoard({ postInfo, postCount, curPage, star }: BoardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const lastPage = Math.ceil(postCount / 15);

  const countUnit = useCallback((count: number) => {
    if (count >= 1000) {
      return <span className='big_count'>{(count / 1000).toFixed(1)}k</span>;
    }

    return `${count}`;
  }, []);

  const titleUI = useCallback((content: string) => {
    return content.includes('<img src=');
  }, []);

  const videoUI = useCallback((content: string) => {
    return content.includes('<iframe');
  }, []);

  const mobileCheck = useCallback(() => {
    if (window.innerWidth <= 767) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 767) {
      setIsMobile(true);
    }

    window.addEventListener('resize', mobileCheck);

    return () => window.removeEventListener('resize', mobileCheck);
  }, []);

  return (
    <>
      <Head>
        <title>{star} K-POP Forum - biaskpop</title>
        <meta
          name='description'
          content={`This is the ${star} fan page. Feel free to share your writing without signing up.`}
        />
        <meta property='og:title' content={`${star} K-POP Forum - biaskpop`} />
        <meta
          property='og:description'
          content={`This is the ${star} fan page. Feel free to share your writing without signing up.`}
        />
        <meta
          property='og:image'
          content='https://kpop-app-image-storage.s3.us-east-2.amazonaws.com/biaskpop.png'
        />
      </Head>
      <div className='star_container'>
        <div className='board_container'>
          {star && <h2 className='category_info'>{`${star}`}</h2>}
          <div className='sort_by_container'>
            <a href={`/board/${star}?curPage=1`}>
              <button>Latest</button>
            </a>
            <a href={`/board/hot/${star}?curPage=1`}>
              <button style={{ background: '#485a92', color: 'white' }}>
                Hot
              </button>
            </a>
            <a href={`/board/views/${star}?curPage=1`}>
              <button>Views</button>
            </a>
          </div>
          <div className='board'>
            {isMobile ? (
              <div className='board_head'>
                <h2 className='content_head'>Content</h2>
              </div>
            ) : (
              <div className='board_head'>
                <h3 className='number_head'>Number</h3>
                <h3 className='title_head'>Title</h3>
                <h3 className='nickname_head'>Nickname</h3>
                <h3 className='date_head'>Date</h3>
                <h3 className='views_head'>Views</h3>
                <h3 className='hot_head'>Hot</h3>
              </div>
            )}
            <ul className='post'>
              {postInfo.map((e) => (
                <a key={e._id} href={`/board/${star}/${e.number}`}>
                  {isMobile ? (
                    <li className='mobile_list'>
                      <p className='title_post'>{e.title}</p>
                      <div className='content_info'>
                        <p className='nickname_post'>{e.nickname} |</p>
                        <p className='date_post'>{postDate(e.createdAt)} |</p>
                        <p className='views_post'>
                          views: {countUnit(e.views)} |
                        </p>
                        <p className='hot_post'>
                          hot: {countUnit(e.likeCount)} |
                        </p>
                        <p className='post_info'>
                          {titleUI(e.content) ? (
                            <FontAwesomeIcon color={'#079653'} icon={faImage} />
                          ) : null}{' '}
                          {videoUI(e.content) ? (
                            <FontAwesomeIcon color={'#1a1de2'} icon={faFilm} />
                          ) : null}{' '}
                          <FontAwesomeIcon
                            color={'#11bfeb'}
                            icon={faCommentDots}
                          />
                          <span className='comment_info'>
                            [{e.commentCount}]
                          </span>
                        </p>
                      </div>
                    </li>
                  ) : (
                    <li className='desktop_list'>
                      <p className='number_post'>{e.number}</p>
                      <p className='title_post'>
                        <span className='title'>{e.title} </span>
                        <span className='post_info'>
                          {titleUI(e.content) ? (
                            <FontAwesomeIcon color={'#079653'} icon={faImage} />
                          ) : null}{' '}
                          {videoUI(e.content) ? (
                            <FontAwesomeIcon color={'#1a1de2'} icon={faFilm} />
                          ) : null}{' '}
                          <FontAwesomeIcon
                            color={'#11bfeb'}
                            icon={faCommentDots}
                          />
                          <span className='comment_info'>
                            [{e.commentCount}]
                          </span>
                        </span>
                      </p>
                      <p className='nickname_post'>{e.nickname}</p>
                      <p className='date_post'>{postDate(e.createdAt)}</p>
                      <p className='views_post'>{countUnit(e.views)}</p>
                      <p className='hot_post'>{countUnit(e.likeCount)}</p>
                    </li>
                  )}
                </a>
              ))}
            </ul>
          </div>
          <div className='board_bottom'>
            <SearchPosts />
            {star == 'Notice' ? null : (
              <Link href={`/write/${star}`}>
                <button className='write_btn btn'>Write</button>
              </Link>
            )}
          </div>
          <div className='page_number_container'>
            {curPage <= 1 ? null : (
              <a href={`/board/hot/${star}?curPage=1`}>
                <li id='double_left' className='angle_double_left page_button'>
                  <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </li>
              </a>
            )}
            {curPage <= 10 ? null : (
              <a
                href={
                  curPage - 10 > 1
                    ? `/board/hot/${star}?curPage=${curPage - 10}`
                    : `/board/hot/${star}?curPage=1`
                }
              >
                <li id='left' className='angle_left page_button'>
                  <FontAwesomeIcon icon={faAngleLeft} />
                </li>
              </a>
            )}

            {pageNums(postCount, curPage).map((e) => (
              <a key={e} href={`/board/hot/${star}?curPage=${e}`}>
                <li className={`${e}page page_button`}>{e}</li>
              </a>
            ))}
            {curPage >= Math.floor((lastPage - 1) / 10) * 10 + 1 ? null : (
              <a
                href={
                  curPage + 10 > lastPage
                    ? `/board/hot/${star}?curPage=${lastPage}`
                    : `/board/hot/${star}?curPage=${curPage + 10}`
                }
              >
                <li id='right' className='angle_right page_button'>
                  <FontAwesomeIcon icon={faAngleRight} />
                </li>
              </a>
            )}

            {lastPage == curPage || postCount == 0 ? null : (
              <a href={`/board/hot/${star}?curPage=${lastPage}`}>
                <li
                  id='double_right'
                  className='angle_double_right page_button'
                >
                  <FontAwesomeIcon icon={faAngleDoubleRight} />
                </li>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SortByHotBoard;
