// import axios from 'axios';

// // Replace this with your real base URL
// const API_BASE_URL = 'http://172.16.227.173:8000/api';

// // Get JWT token from localStorage or any auth store
// const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTcyLjE2LjIyNy4xNzM6ODAwMC9hcGkvbG9naW4iLCJpYXQiOjE3NTQ1NzYyNTEsImV4cCI6MTc1NDU3OTg1MSwibmJmIjoxNzU0NTc2MjUxLCJqdGkiOiJzdGJkeHNVMnZ6MG1KR2E5Iiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.T1KG_n2qvXYpp4ZFjBQiRFpqeqIoyh_aMoNKqvk3pJg";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     Authorization: `Bearer ${token}`,  // Send token with every request
//     'Content-Type': 'application/json',
//   },
// });

// export default api;

import axios from "axios";

const API_BASE_URL = "http://localhost:8000/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;

