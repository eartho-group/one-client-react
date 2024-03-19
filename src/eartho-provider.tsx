import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  EarthoOne,
  EarthoOneOptions,
  LogoutOptions,
  LogoutUrlOptions,
  PopupConnectOptions,
  PopupConfigOptions,
  RedirectConnectOptions as EarthoOneRedirectConnectOptions,
  RedirectLoginResult,
  GetTokenSilentlyOptions,
  GetUserOptions,
  User,
} from '@eartho/one-client-js';
import EarthoOneContext, { EarthoOneContextInterface, RedirectConnectOptions } from './eartho-context';
import { hasAuthParams, loginError, tokenError } from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

/**
 * The state of the application before the user was redirected to the login page.
 */
export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * The main configuration to instantiate the `EarthoOneProvider`.
 */
export interface EarthoOneProviderOptions {
  /**
   * The child nodes your Provider has wrapped
   */
  children?: React.ReactNode;
  /**
   * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
   * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
   * See the EXAMPLES.md for more info.
   */
  onRedirectCallback?: (appState?: AppState) => void;
  /**
   * The Client ID found on your Application settings page
   */
  clientId: string;
  /**
   * The default URL where Eartho will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Eartho Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  redirectUri?: string;
  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Replaced by the package version at build time.
 * @ignore
 */
declare const __VERSION__: string;

/**
 * @ignore
 */
const toEarthoOneOptions = (
  opts: EarthoOneProviderOptions
): EarthoOneOptions => {
  const { clientId, redirectUri, maxAge, ...validOpts } = opts;
  return {
    ...validOpts,
    client_id: clientId,
    redirect_uri: redirectUri,
    max_age: maxAge,
    earthoOneClient: {
      name: 'one-client-react',
      version: __VERSION__,
    },
  };
};

/**
 * @ignore
 */
const toEarthoOneLoginRedirectOptions = (
  opts?: RedirectConnectOptions
): EarthoOneRedirectConnectOptions | undefined => {
  if (!opts) {
    return;
  }
  const { redirectUri, ...validOpts } = opts;
  return {
    ...validOpts,
    redirect_uri: redirectUri,
  };
};

/**
 * @ignore
 */
const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

/**
 * ```jsx
 * <EarthoOneProvider
 *   clientId={clientId}
 *   redirectUri={window.location.origin}>
 *   <MyApp />
 * </EarthoOneProvider>
 * ```
 *
 * Provides the EarthoOneContext to its child components.
 */
const EarthoOneProvider = (opts: EarthoOneProviderOptions): JSX.Element => {
  const {
    children,
    skipRedirectCallback,
    onRedirectCallback = defaultOnRedirectCallback,
    ...clientOpts
  } = opts;
  const [client] = useState(
    () => new EarthoOne(toEarthoOneOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const didInitialise = useRef(false);

  useEffect(() => {
    if (didInitialise.current) {
      return;
    }
    didInitialise.current = true;
    (async (): Promise<void> => {
      try {
        if (hasAuthParams() && !skipRedirectCallback) {
          const { appState } = await client.handleRedirectCallback();
          onRedirectCallback(appState);
        } else {
          await client.checkSession();
        }
        const user = await client.getUser();
        dispatch({ type: 'INITIALISED', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
      }
    })();
  }, [client, onRedirectCallback, skipRedirectCallback]);

  const buildLogoutUrl = useCallback(
    (opts?: LogoutUrlOptions): string => client.buildLogoutUrl(opts),
    [client]
  );

  const connectWithRedirect = useCallback(
    (opts?: RedirectConnectOptions): Promise<void> =>
      client.connectWithRedirect(toEarthoOneLoginRedirectOptions(opts)),
    [client]
  );

  const connectWithPopup = useCallback(
    async (
      options?: PopupConnectOptions,
      config?: PopupConfigOptions
    ): Promise<void> => {
      dispatch({ type: 'LOGIN_POPUP_STARTED' });
      try {
        await client.connectWithPopup(options, config);
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
        return;
      }
      const user = await client.getUser();
      dispatch({ type: 'LOGIN_POPUP_COMPLETE', user });
    },
    [client]
  );

  const logout = useCallback(
    (opts: LogoutOptions = {}): Promise<void> | void => {
      const maybePromise = client.logout(opts);
      if (opts.localOnly) {
        if (maybePromise && typeof maybePromise.then === 'function') {
          return maybePromise.then(() => dispatch({ type: 'LOGOUT' }));
        }
        dispatch({ type: 'LOGOUT' });
      }
      return maybePromise;
    },
    [client]
  );

  const getIdToken = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (opts?: GetTokenSilentlyOptions): Promise<any> => {
      let token;
      try {
        token = await client.connectSilently(opts);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'GET_ACCESS_TOKEN_COMPLETE',
          user: await client.getUser(),
        });
      }
      return token;
    },
    [client]
  );

  const getUser = useCallback(
    (options?: GetUserOptions) => client.getUser(options),
    [client]
  );

  const handleRedirectCallback = useCallback(
    async (url?: string): Promise<RedirectLoginResult> => {
      try {
        return await client.handleRedirectCallback(url);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'HANDLE_REDIRECT_COMPLETE',
          user: await client.getUser(),
        });
      }
    },
    [client]
  );

  const contextValue = useMemo<EarthoOneContextInterface<User>>(() => ({
    ...state,
    buildLogoutUrl,
    getIdToken,
    getUser,
    connectWithRedirect,
    connectWithPopup,
    logout,
    handleRedirectCallback,
  }), [
    state,
    buildLogoutUrl,
    getIdToken,
    getUser,
    connectWithRedirect,
    connectWithPopup,
    logout,
    handleRedirectCallback,
  ]);

  return (
    <EarthoOneContext.Provider value={contextValue}>
      {children}
    </EarthoOneContext.Provider>
  );
};

export default EarthoOneProvider;
