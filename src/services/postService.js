<<<<<<< HEAD
import { developers } from '../data/developers.js';

// Curated public developer profiles keep the directory usable without a fragile demo API.
export const getUsers = async () => developers;
export const getUser = async (id) => {
  const user = developers.find((item) => item.id === Number(id));
  if (!user) { const error = new Error('Developer not found'); error.response = { status: 404 }; throw error; }
  return user;
};
export const getUserPosts = async (id) => {
  const user = await getUser(id);
  return user.projects.map((project, index) => ({
    id: `${user.id}-${index}`, title: project.name, body: project.description, url: project.url
  }));
};
export const createPost = async (payload) => ({ status: 201, data: payload });
export const errorMessage = (err) => err.response
  ? `Server responded with ${err.response.status}. Please try again.`
  : 'Something went wrong. Please try again.';
=======
import apiClient from './api';

export const getUsers = () => apiClient.get('/users').then((r) => r.data);
export const getUser = (id) => apiClient.get(`/users/${id}`).then((r) => r.data);
export const getUserPosts = (id) => apiClient.get('/posts', { params: { userId: id } }).then((r) => r.data);
export const createPost = (payload) => apiClient.post('/posts', payload); // full response so status 201 can be checked

export const errorMessage = (err) =>
  err.response ? `Server responded with ${err.response.status}. Please try again.`
  : err.code === 'ECONNABORTED' ? 'The request timed out after 8 seconds.'
  : 'Network error. Check your connection.';
>>>>>>> ceda3109cfbd8ddaa4debd0f0066dbe9b3f23fc7
