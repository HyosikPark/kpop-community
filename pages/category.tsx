import Head from 'next/head';
import React, { useCallback, useState } from 'react';
import { menu } from '../util/Menu';

export async function getStaticProps() {
  return {
    props: { menu },
  };
}

function Category({ menu }) {
  const [search, setSearch] = useState('');

  const findStar = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const category = useCallback(
    (list) => {
      const filtered = list.names.filter((x) =>
        x.toLowerCase().includes(search)
      );
      return filtered.sort().map((name, i) => (
        <a key={i} href={`/board/${name}?curPage=1`}>
          <li>{name}</li>
        </a>
      ));
    },
    [search]
  );

  return (
    <>
      <Head>
        <title>Categories - biaskpop Forum</title>
        <meta
          name='description'
          content='BTS BlackPink TWICE NCT SEVENTEEN EXO The Boyz GOT7 IZONE GI-DLE Oh My Girl SHINEE...'
        />
      </Head>
      <div className='category_container'>
        <div className='category_head'>
          <label htmlFor='search'>
            <input
              type='text'
              id='search'
              name='search'
              placeholder='Search...'
              value={search}
              onChange={findStar}
            />
          </label>
        </div>
        <section className='category'>
          {menu.map((list) => (
            <ul key={list.initial} className={list.initial}>
              <div
                className={`${list.initial.slice(0, 1)} category_title`}
              >{`${list.initial.slice(0, 1).toUpperCase()} `}</div>
              <div className='artist_list'>{category(list)}</div>
            </ul>
          ))}
        </section>
      </div>
    </>
  );
}

export default Category;
