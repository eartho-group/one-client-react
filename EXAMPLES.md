# Examples

1. [Protecting a route in a `react-router-dom v6` app](#1-protecting-a-route-in-a-react-router-dom-app)
2. [Protecting a route in a Gatsby app](#2-protecting-a-route-in-a-gatsby-app)
3. [Protecting a route in a Next.js app (in SPA mode)](#3-protecting-a-route-in-a-nextjs-app-in-spa-mode)
4. [Create a `useApi` hook for accessing protected APIs with an access token.](#4-create-a-useapi-hook-for-accessing-protected-apis-with-an-access-token)

## 1. Protecting a route in a `react-router-dom v6` app

We need to access the `useNavigate` hook so we can use `navigate` in `onRedirectCallback` to return us to our `returnUrl`.

In order to access `useNavigate` when defining our `EarthoOneProvider` we must nest it in `BrowserRouter` and use the navigate method from the hook in our `onRedirectCallback` config.

We can then use the `withAuthenticationRequired` HOC (Higher Order Component) to create a `ProtectedRoute` component that redirects anonymous users to the login page, before returning them to the protected route:

```jsx
import React from 'react';
import { Route, BrowserRouter, Routes, useNavigate } from 'react-router-dom';
import { EarthoOneProvider, withAuthenticationRequired } from '@eartho/one-client-react';
import Profile from './Profile';

const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, args);
  return <Component />;
};

const EarthoOneProviderWithRedirectCallback = ({ children, ...props }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };
  return (
    <EarthoOneProvider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </EarthoOneProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <EarthoOneProviderWithRedirectCallback
        
        clientId="YOUR_EARTHO_CLIENT_ID"
        redirectUri={window.location.origin}
      >
        <Routes>
          <Route path="/" exact />
          <Route
            path="/profile"
            element={<ProtectedRoute component={Profile} />}
          />
        </Routes>
      </EarthoOneProviderWithRedirectCallback>
    </BrowserRouter>
  );
}
```

See [react-router example app](./examples/cra-react-router)

## 2. Protecting a route in a Gatsby app

Wrap the root element in your `EarthoOneProvider` to configure the SDK and setup the context for the `useEarthoOne` hook.

The `onRedirectCallback` will use `gatsby`'s `navigate` function to return the user to the protected route after the login:

```jsx
// gatsby-browser.js
import React from 'react';
import { EarthoOneProvider } from '@eartho/one-client-react';
import { navigate } from 'gatsby';

const onRedirectCallback = (appState) => {
  // Use Gatsby's navigate method to replace the url
  navigate(appState?.returnTo || '/', { replace: true });
};

export const wrapRootElement = ({ element }) => {
  return (
    <EarthoOneProvider
      clientId="YOUR_EARTHO_CLIENT_ID"
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {element}
    </EarthoOneProvider>
  );
};
```

Create a page that you want to be protected, e.g. a profile page, and wrap it in the `withAuthenticationRequired` HOC:

```jsx
// src/pages/profile.js
import React from 'react';
import { useEarthoOne, withAuthenticationRequired } from '@eartho/one-client-react';

const Profile = () => {
  const { user } = useEarthoOne();
  return (
    <ul>
      <li>Name: {user.nickname}</li>
      <li>E-mail: {user.email}</li>
    </ul>
  );
};

// Wrap the component in the withAuthenticationRequired handler
export default withAuthenticationRequired(Profile);
```

See [Gatsby example app](./examples/gatsby-app)

## 3. Protecting a route in a Next.js app (in SPA mode)

Wrap the root element in your `EarthoOneProvider` to configure the SDK and setup the context for the `useEarthoOne` hook.

The `onRedirectCallback` will use `next`'s `Router.replace` function to return the user to the protected route after the login:

```jsx
// pages/_app.js
import React from 'react';
import App from 'next/app';
import Router from 'next/router';
import { EarthoOneProvider } from '@eartho/one-client-react';

const onRedirectCallback = (appState) => {
  // Use Next.js's Router.replace method to replace the url
  Router.replace(appState?.returnTo || '/');
};

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <EarthoOneProvider
        
        clientId="YOUR_EARTHO_CLIENT_ID"
        redirectUri={typeof window !== 'undefined' && window.location.origin}
        onRedirectCallback={onRedirectCallback}
      >
        <Component {...pageProps} />
      </EarthoOneProvider>
    );
  }
}

export default MyApp;
```

Create a page that you want to be protected, e.g. a profile page, and wrap it in the `withAuthenticationRequired` HOC:

```jsx
// pages/profile.js
import React from 'react';
import { useEarthoOne, withAuthenticationRequired } from '@eartho/one-client-react';

const Profile = () => {
  const { user } = useEarthoOne();
  return (
    <ul>
      <li>Name: {user.nickname}</li>
      <li>E-mail: {user.email}</li>
    </ul>
  );
};

// Wrap the component in the withAuthenticationRequired handler
export default withAuthenticationRequired(Profile);
```

See [Next.js example app](./examples/nextjs-app)

## 4. Create a `useApi` hook for accessing protected APIs with an access token.

```js
// use-api.js
import { useEffect, useState } from 'react';
import { useEarthoOne } from '@eartho/one-client-react';

export const useApi = (url, options = {}) => {
  const { getIdToken } = useEarthoOne();
  const [state, setState] = useState({
    error: null,
    loading: true,
    data: null,
  });
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { audience, scope, ...fetchOptions } = options;
        const accessToken = await getIdToken({ audience, scope });
        const res = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            // Add the Authorization header to the existing headers
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setState({
          ...state,
          data: await res.json(),
          error: null,
          loading: false,
        });
      } catch (error) {
        setState({
          ...state,
          error,
          loading: false,
        });
      }
    })();
  }, [refreshIndex]);

  return {
    ...state,
    refresh: () => setRefreshIndex(refreshIndex + 1),
  };
};
```

Then use it for accessing protected APIs from your components:

```jsx
// users.js
import { useApi } from './use-api';

export const Profile = () => {
  const opts = {
    audience: 'https://api.example.com/',
    scope: 'read:users',
  };
  const { login, getAccessTokenWithPopup } = useEarthoOne();
  const {
    loading,
    error,
    refresh,
    data: users,
  } = useApi('https://api.example.com/users', opts);
  const getTokenAndTryAgain = async () => {
    await getAccessTokenWithPopup(opts);
    refresh();
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    if (error.error === 'login_required') {
      return <button onClick={() => login(opts)}>Login</button>;
    }
    if (error.error === 'consent_required') {
      return (
        <button onClick={getTokenAndTryAgain}>Consent to reading users</button>
      );
    }
    return <div>Oops {error.message}</div>;
  }
  return (
    <ul>
      {users.map((user, index) => {
        return <li key={index}>{user}</li>;
      })}
    </ul>
  );
};
```
