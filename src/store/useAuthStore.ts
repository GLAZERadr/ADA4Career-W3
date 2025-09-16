import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { produce } from 'immer';
import { create } from 'zustand';

import { removeToken, setToken } from '@/lib/cookies';

import { UserInterface, withToken } from '@/types/entities/user.types';

type AuthStoreType = {
  user: UserInterface | null;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (user: UserInterface & withToken) => void;
  logout: () => void;
  stopLoading: () => void;
  setUser: (user: UserInterface) => void;
  isWalletAuthenticated: () => boolean;
  getAuthMethod: () => 'email' | 'wallet' | 'microsoft' | null;
};

const useAuthStoreBase = create<AuthStoreType>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isPending: true,
  login: (user) => {
    setToken(user.token);
    set(
      produce<AuthStoreType>((state) => {
        state.isAuthenticated = true;
        state.user = user;
        state.isPending = false;
      })
    );
  },
  logout: () => {
    removeToken();
    set(
      produce<AuthStoreType>((state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isPending = false;
      })
    );
  },
  stopLoading: () => {
    set(
      produce<AuthStoreType>((state) => {
        state.isPending = false;
      })
    );
  },
  setUser: (user) => {
    set(
      produce<AuthStoreType>((state) => {
        state.user = user;
      })
    );
  },
  isWalletAuthenticated: () => {
    const { user } = get();
    return user?.authMethod === 'wallet' && !!user?.walletAddress;
  },
  getAuthMethod: () => {
    const { user } = get();
    return user?.authMethod || null;
  },
}));

const useAuthStore = createSelectorHooks(useAuthStoreBase);

export default useAuthStore;
