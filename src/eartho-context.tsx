import {
  BaseLoginOptions,
  GetTokenSilentlyOptions,
  LogoutOptions,
  PopupConnectOptions,
  PopupConfigOptions,
  RedirectLoginResult,
  User,
  GetUserOptions
} from '@eartho/one-client-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export interface RedirectConnectOptions extends BaseLoginOptions {
  /**
   * The URL where Eartho will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Eartho Application's
   * settings.
   */
  redirectUri?: string;

  /**
   * Used to store state before doing the redirect
   */
  appState?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  /**
   * Used to add to the URL fragment before redirecting
   */
  fragment?: string;
}

/**
 * Contains the authenticated state and authentication methods provided by the `useEarthoOne` hook.
 */
export interface EarthoOneContextInterface<TUser extends User = User>
  extends AuthState<TUser> {

  /**
   * ```js
   * const token = await getIdToken(options);
   * ```
   *
   * If there's a valid token stored, return it. Otherwise, opens an
   * iframe with the `/authorize` URL using the parameters provided
   * as arguments. Random and secure `state` and `nonce` parameters
   * will be auto-generated. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * If refresh tokens are used, the token endpoint is called directly with the
   * 'refresh_token' grant. If no refresh token is available to make this call,
   * the SDK falls back to using an iframe to the '/authorize' URL.
   *
   * This method may use a web worker to perform the token call if the in-memory
   * cache is used.
   *
   * Note that in all cases, falling back to an iframe requires access to
   * the `eartho` cookie.
   */
   getIdToken: (
    options?: GetTokenSilentlyOptions
  ) => Promise<string | undefined>;

  /**
   * ```js
   * const claims = await getUser();
   * ```
   *
   * Returns all claims from the id_token if available.
   */
  getUser: (
    options?: GetUserOptions
  ) => Promise<User | undefined>;

  /**
   * ```js
   * await connectWithPopup(options);
   * ```
   *
   * Performs a redirect to `/authorize` using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   */
  connectWithRedirect: (options?: RedirectConnectOptions) => Promise<void>;

  /**
   * ```js
   * await loginWithPopup(options, config);
   * ```
   *
   * Opens a popup with the `/authorize` URL using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated. If the response is successful,
   * results will be valid according to their expiration times.
   *
   * IMPORTANT: This method has to be called from an event handler
   * that was started by the user like a button click, for example,
   * otherwise the popup will be blocked in most browsers.
   */
  connectWithPopup: (
    options?: PopupConnectOptions,
    config?: PopupConfigOptions
  ) => Promise<void>;

  /**
   * ```js
   * eartho.logout({ returnTo: window.location.origin });
   * ```
   *
   * Clears the application session and performs a redirect to `/v2/logout`, using
   * the parameters provided as arguments, to clear the Eartho session.
   * If the `federated` option is specified, it also clears the Identity Provider session.
   * If the `localOnly` option is specified, it only clears the application session.
   * It is invalid to set both the `federated` and `localOnly` options to `true`,
   * and an error will be thrown if you do.
   */
  logout: (options?: LogoutOptions) => void;

  /**
   * After the browser redirects back to the callback page,
   * call `handleRedirectCallback` to handle success and error
   * responses from Eartho. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * @param url The URL to that should be used to retrieve the `state` and `code` values. Defaults to `window.location.href` if not given.
   */
  handleRedirectCallback: (url?: string) => Promise<RedirectLoginResult>;
}

/**
 * @ignore
 */
const stub = (): never => {
  throw new Error('You forgot to wrap your component in <EarthoOneProvider>.');
};

/**
 * @ignore
 */
const initialContext = {
  ...initialAuthState,
  getIdToken: stub,
  getUser: stub,
  connectWithPopup: stub,
  connectWithRedirect: stub,
  logout: stub,
  handleRedirectCallback: stub,
};

/**
 * The Eartho Context
 */
const EarthoOneContext = createContext<EarthoOneContextInterface>(initialContext);

export default EarthoOneContext;
