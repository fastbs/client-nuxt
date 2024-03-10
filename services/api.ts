import axios from "axios";
import type { AxiosInstance } from "axios";

export default (): AxiosInstance => {
  const token = window.localStorage.getItem("auth");
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      },
    baseURL: "http://localhost:4400"
  })
};