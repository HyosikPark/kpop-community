import Link from 'next/link';
import {
  SEARCH_BY_CONTENT,
  SEARCH_BY_NICKNAME,
  SEARCH_BY_TITLE,
  SEARCH_BY_TITLE_AND_CONTENT,
} from '../../../components/gqlFragment';
import moment from 'moment';
import { useCallback } from 'react';
import Head from 'next/head';
import SearchPosts from '../../../components/SearchPosts';

function pageNums(postCount: number, curPage: number) {
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

function postDate(date) {
  const now = moment(new Date().toISOString());
  const postDate = moment(date);
  if (moment.duration(now.diff(postDate)).asDays() < 1)
    return moment(date).fromNow();
  else return moment(date).format('YYYY-MM-DD');
}

SearchBoard.getInitialProps = async (ctx) => {
  try {
    const { curPage, id: star, option, keyword } = ctx.query;
    let result;
    if (option == 'title') {
      result = await ctx.apolloClient
        .query({
          query: SEARCH_BY_TITLE,
          variables: { category: `${star}`, curPage: +curPage, value: keyword },
        })
        .then((e) => e.data.searchByTitle);
    } else if (option == 'content') {
      result = await ctx.apolloClient
        .query({
          query: SEARCH_BY_CONTENT,
          variables: { category: `${star}`, curPage: +curPage, value: keyword },
        })
        .then((e) => e.data.searchByContent);
    } else if (option == 'title_content') {
      result = await ctx.apolloClient
        .query({
          query: SEARCH_BY_TITLE_AND_CONTENT,
          variables: { category: `${star}`, curPage: +curPage, value: keyword },
        })
        .then((e) => e.data.searchByTitleAndContent);
    } else if (option == 'nickname') {
      result = await ctx.apolloClient
        .query({
          query: SEARCH_BY_NICKNAME,
          variables: { category: `${star}`, curPage: +curPage, value: keyword },
        })
        .then((e) => e.data.searchByNickname);
    }
    return {
      ...result,
      curPage: Number(curPage),
      star,
      option,
      keyword,
    };
  } catch (e) {
    console.log(e);
    ctx.res.writeHead(302, {
      Location: `/category`,
    });
    ctx.res.end();
    return {};
  }
};

function SearchBoard({ postInfo, postCount, curPage, star, option, keyword }) {
  const lastPage = Math.ceil(postCount / 15);

  const countUnit = useCallback((count) => {
    if (count >= 1000) {
      return <span className='big_count'>{(count / 1000).toFixed(1)}k</span>;
    } else return `${count}`;
  }, []);

  const titleUI = useCallback((content) => {
    return content.includes('<img src=');
  }, []);

  return (
    <>
      <Head>
        <script
          src='https://kit.fontawesome.com/e14cfa2f4b.js'
          crossOrigin='anonymous'
        ></script>
      </Head>
      <div className='star_container'>
        <div className='board_container'>
          {star && <h2 className='category_info'>{`${star}`}</h2>}
          <div className='sort_by_container'>
            <a href={`/board/${star}?curPage=1`}>
              <button>Latest</button>
            </a>
            <a href={`/board/hot/${star}?curPage=1`}>
              <button>Hot</button>
            </a>
            <a href={`/board/views/${star}?curPage=1`}>
              <button>Views</button>
            </a>
          </div>
          <div className='board'>
            <div className='board_head'>
              <h3 className='number_head'>Number</h3>
              <h3 className='title_head'>Title</h3>
              <h3 className='nickname_head'>Nickname</h3>
              <h3 className='date_head'>Date</h3>
              <h3 className='views_head'>Views</h3>
              <h3 className='hot_head'>Hot</h3>
            </div>
            <ul className='post'>
              {postInfo.map((e) => (
                <a key={e._id} href={`/board/${star}/${e.number}`}>
                  <li>
                    <p className='number_post'>{e.number}</p>
                    <p className='title_post'>
                      <span className='title_info'>{e.title} </span>
                      {titleUI(e.content) ? (
                        <i
                          style={{ color: '#079653' }}
                          className='fas fa-image'
                        ></i>
                      ) : null}{' '}
                      <span className='comment_info'>
                        <i
                          style={{ color: '#11bfeb' }}
                          className='fas fa-comment-dots'
                        ></i>
                        [{e.commentCount}]
                      </span>
                    </p>
                    <p className='nickname_post'>{e.nickname}</p>
                    <p className='date_post'>{postDate(e.createdAt)}</p>
                    <p className='views_post'>{countUnit(e.views)}</p>
                    <p className='hot_post'>{countUnit(e.likeCount)}</p>
                  </li>
                </a>
              ))}
            </ul>
          </div>
          <div className='board_bottom'>
            <SearchPosts />
            <Link href={`/write/${star}`}>
              <button className='write_btn btn'>Write</button>
            </Link>
          </div>
          <div className='page_number_container'>
            {curPage <= 1 ? null : (
              <a
                href={`/board/search/${star}?curPage=1&option=${option}&keyword=${keyword}`}
              >
                <li id='double_left' className='angle_double_left page_button'>
                  <i aria-hidden className='fas fa-angle-double-left'></i>
                </li>
              </a>
            )}
            {curPage <= 10 ? null : (
              <a
                href={
                  curPage - 10 > 1
                    ? `/board/search/${star}?curPage=${
                        curPage - 10
                      }&option=${option}&keyword=${keyword}`
                    : `/board/search/${star}?curPage=1&option=${option}&keyword=${keyword}`
                }
              >
                <li id='left' className='angle_left page_button'>
                  <i aria-hidden className='fas fa-angle-left'></i>
                </li>
              </a>
            )}

            {pageNums(postCount, curPage).map((e) => (
              <a
                key={e}
                href={`/board/search/${star}?curPage=${e}&option=${option}&keyword=${keyword}`}
              >
                <li id={e} className={`${e}page page_button`}>
                  {e}
                </li>
              </a>
            ))}
            {curPage >= Math.floor((lastPage - 1) / 10) * 10 + 1 ? null : (
              <a
                href={
                  curPage + 10 > lastPage
                    ? `/board/search/${star}?curPage=${lastPage}&option=${option}&keyword=${keyword}`
                    : `/board/search/${star}?curPage=${
                        curPage + 10
                      }&option=${option}&keyword=${keyword}`
                }
              >
                <li id='right' className='angle_right page_button'>
                  <i aria-hidden className='fas fa-angle-right'></i>
                </li>
              </a>
            )}

            {lastPage == curPage || postCount == 0 ? null : (
              <a
                href={`/board/search/${star}?curPage=${lastPage}&option=${option}&keyword=${keyword}`}
              >
                <li
                  id='double_right'
                  className='angle_double_right page_button'
                >
                  <i aria-hidden className='fas fa-angle-double-right'></i>
                </li>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchBoard;