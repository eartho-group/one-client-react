import React from 'react';
import Link from 'next/link';
import { useEarthoOne } from '@eartho/one-client-react';
import { useRouter } from 'next/router';
import { Loading } from './Loading';

export function Nav() {
  const {
    isConnected,
    isLoading,
    user,
    connectWithPopup,
    logout,
  } = useEarthoOne();
  const { pathname } = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <span className="navbar-brand">@eartho/one-client-react</span>
      <div className="collapse navbar-collapse">
        <div className="navbar-nav">
          <Link href="/">
            <a
              className={`nav-item nav-link${pathname === '/' ? ' active' : ''
                }`}
            >
              Home
            </a>
          </Link>
          <Link href="/users">
            <a
              className={`nav-item nav-link${pathname === '/users' ? ' active' : ''
                }`}
            >
              Users
            </a>
          </Link>
        </div>
      </div>

      {isConnected ? (
        <div>
          <span id="hello">Hello, {user.name}!</span>{' '}
          <button
            className="btn btn-outline-secondary"
            id="logout"
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            logout
          </button>
        </div>
      ) : (
        <button
          className="btn btn-outline-success"
          id="login"
          onClick={() => connectWithPopup({ access_id: "2drlTkv19Alfvu9pEPTP" })}
        >
          login
        </button>
      )}
    </nav>
  );
}
