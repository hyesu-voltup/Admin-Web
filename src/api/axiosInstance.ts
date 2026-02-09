import axios, { type InternalAxiosRequestConfig } from "axios";
import { getUserId } from "../lib/authStorage";
import { ApiClientError, isClientErrorCode } from "../types/api";

/**
 * Base URL: VoltUpBE.md 기준 {BASE_URL}/api/v1
 * - env 미설정 시 상대 경로 /api/v1 (같은 오리진)
 */
const origin = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const baseURL = origin ? origin.replace(/\/$/, "") + "/api/v1" : "/api/v1";

/**
 * VoltUp API용 Axios 인스턴스
 * - baseURL: /api/v1
 * - Request: localStorage의 userId를 X-User-Id 헤더에 자동 주입
 * - Response 에러: { code, message } 파싱 후 C001~C015이면 ApiClientError(code, message) throw
 */
export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** 요청 시 X-User-Id 헤더 자동 주입 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userId = getUserId();
    if (userId) {
      config.headers.set("X-User-Id", userId);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** 응답 에러 시 C001~C015면 message 포함 커스텀 에러로 throw */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (data && typeof data === "object" && "code" in data && "message" in data) {
      const code = String(data.code);
      const message = String(data.message);
      if (isClientErrorCode(code)) {
        return Promise.reject(new ApiClientError(code, message));
      }
    }
    return Promise.reject(error);
  }
);
