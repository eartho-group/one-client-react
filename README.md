<div id="top"></div>
<br />
<div align="center">
  <a href="https://eartho.world">
    <img src="https://user-images.githubusercontent.com/99670283/172473537-5b4005cf-979b-45cf-bc8a-0f74fb6842e5.png" alt="Logo" width="128" height="128">
  </a>

  <h1 align="center">Eartho. One</h1>

  <p align="center">
    One line of code to authenticate users via<br /><b>Any social network, metamask and phone authentication</b><br /><br />
You don't need to read the documents of all companies and you don't need to open accounts there.<br />
We are a third layer that abstracts the complexity for you and protects your users from being tracked.<br /><br />
You can easily keep your backend solution - self server / firebase / amplify , or get a nocode solution from us.<br /><br />
    <a href="https://www.eartho.world/product/learn"><strong>Quick Start »</strong></a>
    <br />
    <br />
    <a href="https://eartho.world">Our Website</a>
    ·
    <a href="https://github.com/eartho-group/one-client-js/issues">Report Bug</a>
    ·
    <a href="https://github.com/eartho-group/one-client-js/issues">Request Feature</a>
    ·
    <a href="https://discord.gg/5QbuTNTG2q">Discord</a>
  </p>
 <br />
<img src="https://user-images.githubusercontent.com/99670283/176105926-c9f0b25a-01de-45a1-97a6-2f93dbb4d81c.png">
</div>


<!-- ABOUT THE PROJECT -->

## About The Project

<p align="center">
<br />
    <img src="https://user-images.githubusercontent.com/99670283/178576414-ac74ae1f-c072-4ea2-81e4-a0b758d5256d.gif" alt="Logo" height="300" />
<br /><br /><br />
Get all integrations at once. No extra steps.
From improving customer experience through seamless sign-on to making auth as easy as a click of a button – your login box must find the right balance between user convenience, privacy and security.


Here's why:

* Ready high converting UI/UX
* Login from Google, Twitter, Github, Facebook, Apple, Microsoft at once with not extra steps or
  extra effort.
* Your users will be protected under our third layer, we prevent from companies to track after your
  users.
* Advanced analytics and info about your app from all sources. ready for use. no extra steps
* No-Code / Your own server. you decide. We support all, your own server, our server, firebase auth
  and many more.

<p align="right">(<a href="#top">back to top</a>)</p>

## Installation

Using [npm](https://npmjs.org/)

```bash
npm install @eartho/one-client-react
```

Using [yarn](https://yarnpkg.com/)

```bash
yarn add @eartho/one-client-react
```

## Getting Started

Configure the SDK by wrapping your application in `EarthoOneProvider`:

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { EarthoOneProvider } from '@eartho/one-client-react';
import App from './App';

ReactDOM.render(
  <EarthoOneProvider
    clientId="YOUR_EARTHO_CLIENT_ID"
  >
    <App />
  </EarthoOneProvider>,
  document.getElementById('app')
);
```

Use the `useEarthoOne` hook in your components to access authentication state (`isLoading`, `isConnected` and `user`) and authentication methods (`connectWithPopup` and `logout`):

```jsx
// src/App.js
import React from 'react';
import { useEarthoOne } from '@eartho/one-client-react';

function App() {
  const {
    isLoading,
    isConnected,
    error,
    user,
    connectWithPopup,
    logout,
  } = useEarthoOne();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isConnected) {
    return (
      <div>
        Hello {user.name}{' '}
        <button onClick={() => logout({ returnTo: window.location.origin })}>
          Log out
        </button>
      </div>
    );
  } else {
    return <button onClick={connectWithPopup}>Log in</button>;
  }
}

export default App;
```

### Protect a Route

Protect a route component using the `withAuthenticationRequired` higher order component. Visits to this route when unauthenticated will redirect the user to the login page and back to this page after login:

```jsx
import React from 'react';
import { withAuthenticationRequired } from '@eartho/one-client-react';

const PrivateRoute = () => <div>Private</div>;

export default withAuthenticationRequired(PrivateRoute, {
  // Show a message while the user waits to be redirected to the login page.
  onRedirecting: () => <div>Redirecting you to the login page...</div>,
});
```

**Note** If you are using a custom router, you will need to supply the `EarthoOneProvider` with a custom `onRedirectCallback` method to perform the action that returns the user to the protected page. See examples for [react-router](https://github.com/eartho-group-group/one-client-react/blob/master/EXAMPLES.md#1-protecting-a-route-in-a-react-router-dom-app), [Gatsby](https://github.com/eartho-group-group/one-client-react/blob/master/EXAMPLES.md#2-protecting-a-route-in-a-gatsby-app) and [Next.js](https://github.com/eartho-group-group/one-client-react/blob/master/EXAMPLES.md#3-protecting-a-route-in-a-nextjs-app-in-spa-mode).

### Call an API

Call a protected API with an Access Token:

```jsx
import React, { useEffect, useState } from 'react';
import { useEarthoOne } from '@eartho/one-client-react';

const Posts = () => {
  const { getIdToken } = useEarthoOne();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getIdToken();
        const response = await fetch('https://api.example.com/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(await response.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getIdToken]);

  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {posts.map((post, index) => {
        return <li key={index}>{post}</li>;
      })}
    </ul>
  );
};

export default Posts;
```

For a more detailed example see how to [create a `useApi` hook for accessing protected APIs with an access token](https://github.com/eartho-group-group/one-client-react/blob/master/EXAMPLES.md#4-create-a-useapi-hook-for-accessing-protected-apis-with-an-access-token).

