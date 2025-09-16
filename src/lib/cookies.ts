import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Login
export const getToken = (): string => {
  return cookies.get('ada4career-token');
};

export const setToken = (token: string) => {
  cookies.set('ada4career-token', token, {
    path: '/',
  });
};

export const removeToken = () => {
  cookies.remove('ada4career-token', {
    path: '/',
  });
};

export const getTokenEmail = (): string => {
  return cookies.get('ada4career-email');
};

export const setTokenEmail = (token: string) => {
  cookies.set('ada4career-email', token, {
    path: '/',
  });
};

export const removeTokenEmail = () => {
  cookies.remove('ada4career-email', {
    path: '/',
  });
};
