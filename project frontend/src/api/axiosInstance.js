import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true 
});

//  interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url.includes("/user/refresh-token")
) {
      originalRequest._retry = true;

      try {
        await api.post("/user/refresh-token");

        return api(originalRequest);

      } catch (err) {
        // window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;