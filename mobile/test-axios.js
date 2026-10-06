const axios = require('axios');
const api = axios.create();
api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer TEST';
  return config;
});
api.get('http://localhost:3000/api/access').catch(e => {
  console.log(e.config.headers);
});
