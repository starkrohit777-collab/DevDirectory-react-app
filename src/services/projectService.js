import apiClient, { getErrorMessage } from './api.js';

export const projectService = {
  async getProjects(params = {}) {
    try {
      const res = await apiClient.get('/projects', { params });
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async getProject(id) {
    try {
      const res = await apiClient.get(`/projects/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async createProject(projectData) {
    try {
      const res = await apiClient.post('/projects', projectData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async updateProject(id, changes) {
    try {
      const res = await apiClient.put(`/projects/${id}`, changes);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async deleteProject(id) {
    try {
      const res = await apiClient.delete(`/projects/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async addTask(projectId, taskData) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/tasks`, taskData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async updateTask(projectId, taskId, updates) {
    try {
      const res = await apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async deleteTask(projectId, taskId) {
    try {
      const res = await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async addMember(projectId, memberData) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/members`, memberData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async updateMember(projectId, memberKey, updates) {
    try {
      const res = await apiClient.patch(`/projects/${projectId}/members/${memberKey}`, updates);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async removeMember(projectId, memberKey) {
    try {
      const res = await apiClient.delete(`/projects/${projectId}/members/${memberKey}`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async sendJoinRequest(projectId, requestData) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/requests`, requestData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async addThread(projectId, threadData) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/threads`, threadData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async replyThread(projectId, threadId, replyData) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/threads/${threadId}/replies`, replyData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async upvoteThread(projectId, threadId) {
    try {
      const res = await apiClient.post(`/projects/${projectId}/threads/${threadId}/upvote`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async updateMilestones(projectId, milestones) {
    try {
      const res = await apiClient.put(`/projects/${projectId}/milestones`, { milestones });
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async getProblems(params = {}) {
    try {
      const res = await apiClient.get('/problems', { params });
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async createProblem(problemData) {
    try {
      const res = await apiClient.post('/problems', problemData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async addProblemAnswer(problemId, answerData) {
    try {
      const res = await apiClient.post(`/problems/${problemId}/answers`, answerData);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async upvoteProblem(problemId) {
    try {
      const res = await apiClient.post(`/problems/${problemId}/upvote`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async markProblemSolution(problemId, answerId) {
    try {
      const res = await apiClient.patch(`/problems/${problemId}/answers/${answerId}/solve`);
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async getStats() {
    try {
      const res = await apiClient.get('/stats');
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async resetDemo() {
    try {
      const res = await apiClient.post('/reset');
      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },
};

export default projectService;
