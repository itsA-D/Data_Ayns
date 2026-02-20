import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const datasetService = {
    list: () => api.get('/datasets'),
    get: (id) => api.get(`/datasets/${id}`),
    delete: (id) => api.delete(`/datasets/${id}`),
    upload: (formData) => api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

export const analyticsService = {
    getSummary: (datasetId) => api.get(`/datasets/${datasetId}/summary`),
    getChartData: (datasetId) => api.get(`/datasets/${datasetId}/chart-data`),
};

export default api;
