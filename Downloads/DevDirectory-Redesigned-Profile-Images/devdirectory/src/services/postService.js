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
