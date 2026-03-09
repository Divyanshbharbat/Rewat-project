import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Remove interceptor to match user exact API setup request
export default API;
