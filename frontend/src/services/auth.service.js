import api from './api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Logout should always succeed client-side even if the API call fails
  }
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};
