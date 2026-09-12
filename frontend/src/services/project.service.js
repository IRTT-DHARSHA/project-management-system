import api from './api';

export const getProjects = async (params = {}) => {
  const { data } = await api.get('/projects', { params });
  return data.data.projects;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data.data.project;
};

export const createProject = async (payload) => {
  const { data } = await api.post('/projects', payload);
  return data.data.project;
};

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data.data.project;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};
