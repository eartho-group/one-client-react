import { useContext } from 'react';
import { User } from '@eartho/one-client-js';
import EarthoOneContext, { EarthoOneContextInterface } from './eartho-context';

/**
 * ```js
 * const {
 *   // Auth state:
 *   error,
 *   isConnected,
 *   isLoading,
 *   user,
 *   // Auth methods:
 *   getIdToken,
 *   getUser,
 *   connectWithPopup,
 *   loginWithPopup,
 *   logout,
 * } = useEarthoOne<TUser>();
 * ```
 *
 * Use the `useEarthoOne` hook in your components to access the auth state and methods.
 *
 * TUser is an optional type param to provide a type to the `user` field.
 */
const useEarthoOne = <TUser extends User = User>(): EarthoOneContextInterface<TUser> =>
  useContext(EarthoOneContext) as EarthoOneContextInterface<TUser>;

export default useEarthoOne;  
