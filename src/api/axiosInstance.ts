import axios, { type InternalAxiosRequestConfig } from "axios";
import { getUserId } from "../lib/authStorage";
import { ApiClientError, isClientErrorCode } from "../types/api";

/**
 * Base URL: 항상 상대 경로 /api/v1
 * - 배포(Vercel): 같은 오리진으로 요청 → 서버리스 함수가 API_BASE_URL로 프록시 (환경 변수는 서버만 사용)
 * - 로컬 개발: Vite proxy가 /api를 백엔드로 전달 (.env.local의 VITE_API_BASE_URL, 브라우저에 노출 안 됨)
 */
const baseURL = "/api/v1";

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
