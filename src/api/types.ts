/**
 * API 타입은 src/types/api.ts (VoltUpBE.md 기준)에서 정의합니다.
 * 하위 호환을 위해 재내보내기만 수행합니다.
 */
export type {
  ApiErrorResponse,
  AuthLoginRequest,
  AuthLoginResponse,
  Budget,
  AdminOrder,
  AdminProduct,
  RouletteParticipation,
} from "../types/api";

export {
  ApiClientError,
  isClientErrorCode,
} from "../types/api";
