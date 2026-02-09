import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';
import Tooltip from './tool-tip';
import { onEntryChange } from '../contentstack-sdk';
import { getHeaderRes } from '../helper';
import Skeleton from 'react-loading-skeleton';
import { HeaderProps, Entry, NavLinks } from "../typescript/layout";
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ header, entries }: {header: HeaderProps, entries: Entry}) {

  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [getHeader, setHeader] = useState(header);

  function buildNavigation(ent: Entry, hd: HeaderProps) {
    let newHeader={...hd};
    if (ent.length!== newHeader.navigation_menu.length) {
          ent.forEach((entry) => {
            const hFound = newHeader?.navigation_menu.find(
              (navLink: NavLinks) => navLink.label === entry.title
            );
            if (!hFound) {
              newHeader.navigation_menu?.push({
                label: entry.title,
                page_reference: [
                  { title: entry.title, url: entry.url, $: entry.$ },
                ],
                $:{}
              });
            }
          });
    }
    return newHeader
  }

  async function fetchData() {
    try {
      if (header && entries) {
      const headerRes = await getHeaderRes();
      const newHeader = buildNavigation(entries,headerRes)
      setHeader(newHeader);
    }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (header && entries) {
      onEntryChange(() => fetchData());
    }
  }, [header]);
  const headerData = getHeader ? getHeader : undefined;
  
  return (
    <header className='header'>
      <div className='note-div'>
        {headerData?.notification_bar.show_announcement ? (
          typeof headerData.notification_bar.announcement_text === 'string' && (
            <div {...headerData.notification_bar.$?.announcement_text as {}}>
              {parse(headerData.notification_bar.announcement_text)}
            </div>
          )
        ) : (
          <Skeleton />
        )}
      </div>
      <div className='max-width header-div'>
        <div className='wrapper-logo'>
          {headerData ? (
            (<Link href='/' className='logo-tag' title='Contentstack'>

              <img
                className='logo'
                src={headerData.logo.url}
                alt={headerData.title}
                title={headerData.title}
                {...headerData.logo.$?.url as {}}
              />

            </Link>)
          ) : (
            <Skeleton width={150} />
          )}
        </div>
        <input className='menu-btn' type='checkbox' id='menu-btn' />
        <label className='menu-icon' htmlFor='menu-btn'>
          <span className='navicon' />
        </label>
        <nav className='menu'>
          <ul className='nav-ul header-ul'>
            {headerData ? (
              headerData.navigation_menu.map((list) => {
                const className =
                  router.asPath === list.page_reference[0].url ? 'active' : '';
                return (
                  <li
                    key={list.label}
                    className='nav-li'
                    {...list.page_reference[0].$?.url as {}}
                  >
                    <Link href={list.page_reference[0].url} className={className}>
                      {list.label}
                    </Link>
                  </li>
                );
              })
            ) : (
              <Skeleton width={300} />
            )}
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Tooltip content={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} direction='top' dynamic={false} delay={200} status={0}>
            <button
              onClick={toggleTheme}
              className='theme-toggle'
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          </Tooltip>

          <div className='json-preview'>
            <Tooltip content='JSON Preview' direction='top' dynamic={false} delay={200} status={0}>
              <span data-bs-toggle='modal' data-bs-target='#staticBackdrop'>
                <img src='/json.svg' alt='JSON Preview icon' />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}