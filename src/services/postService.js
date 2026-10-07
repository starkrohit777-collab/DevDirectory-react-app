import apiClient from './api';

export const getUsers = () => apiClient.get('/users').then((r) => r.data);
export const getUser = (id) => apiClient.get(`/users/${id}`).then((r) => r.data);
export const getUserPosts = (id) => apiClient.get('/posts', { params: { userId: id } }).then((r) => r.data);
export const createPost = (payload) => apiClient.post('/posts', payload); // full response so status 201 can be checked

export const errorMessage = (err) =>
  err.response ? `Server responded with ${err.response.status}. Please try again.`
  : err.code === 'ECONNABORTED' ? 'The request timed out after 8 seconds.'
  : 'Network error. Check your connection.';
