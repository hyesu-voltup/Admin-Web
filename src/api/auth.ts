import { apiClient } from "./axiosInstance";
import type { ApiErrorResponse, AuthLoginRequest, AuthLoginResponse } from "../types/api";

/** Mock 테스트용 허용 로그인 ID (실서비스 연동 시 제거) */
const MOCK_LOGIN_ID = "ADMINtest";

/** 로그인 API 경로 (명세: POST /api/v1/auth/login) */
const LOGIN_PATH = "/auth/login";

/**
 * 로그인 (VoltUpBE: POST /api/v1/auth/login, 현재 Mock: ADMINtest만 성공)
 * - 닉네임(로그인 ID)만으로 인증
 * - 실서비스 연동 시 apiClient.post 호출로 교체
 * @param payload - nickname (로그인 ID)
 * @returns AuthLoginResponse (userId, nickname)
 */
export async function login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
  const trimmed = payload.nickname.trim();

  // Mock: 허용된 ID면 즉시 성공 반환 (실제 API 호출 없음)
  if (trimmed === MOCK_LOGIN_ID) {
    return Promise.resolve({
      userId: 1,
      nickname: trimmed,
    });
  }

  try {
    const { data } = await apiClient.post<AuthLoginResponse>(LOGIN_PATH, {
      nickname: trimmed,
    });
    return data;
  } catch {
    // Mock: 등록되지 않은 ID는 실패 (API 401 시 동일 메시지)
  }

  return Promise.reject({
    response: {
      data: {
        code: "UNAUTHORIZED",
        message: "등록된 로그인 ID가 아닙니다. ADMINtest 로그인 ID로 테스트해 보세요.",
      } satisfies ApiErrorResponse,
    },
  });
}

/** API 에러인지 판별 (응답에 code, message 존재) */
export function isApiError(
  err: unknown
): err is { response?: { data?: ApiErrorResponse } } {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    "message" in data
  );
}
