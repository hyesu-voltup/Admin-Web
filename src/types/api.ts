/**
 * VoltUp API 문서(VoltUpBE.md) 기반 타입 정의
 * Response 필드와 문서를 정확히 맞춤.
 */

/** 공통 에러 응답 (4xx/5xx 통일 형식) */
export interface ApiErrorResponse {
  code: string;
  message: string;
}

/** C001~C015 시 커스텀 에러 (message 포함) */
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

/** 에러 코드 C001~C015 매칭 (클라이언트 분기 처리용) */
const API_ERROR_CODE_PATTERN = /^C0(0[1-9]|1[0-5])$/;

/**
 * code가 C001~C015인지 여부
 */
export function isClientErrorCode(code: string): boolean {
  return API_ERROR_CODE_PATTERN.test(code);
}

// ─── 관리자 API Response 타입 (VoltUpBE.md 기준) ───

/** GET/PATCH /api/v1/admin/budget 응답 */
export interface Budget {
  /** 예산 일자 (YYYY-MM-DD) */
  budgetDate: string;
  /** 당일 누적 지급 포인트 */
  totalGranted: number;
  /** 잔여 예산 (100,000 - totalGranted) */
  remaining: number;
}

/** GET /api/v1/admin/orders 목록 한 건 */
export interface AdminOrder {
  /** 주문 ID */
  orderId: number;
  /** 유저 ID */
  userId: number;
  /** 유저 닉네임 */
  nickname: string;
  /** 주문 시간 (ISO 8601) */
  orderedAt: string;
  /** 물품명 */
  productName: string;
  /** 수량 */
  quantity: number;
}

/** GET/POST/PUT 상품 응답 (일반·어드민 공통) */
export interface AdminProduct {
  /** 상품 ID */
  id: number;
  /** 상품명 */
  name: string;
  /** 1개당 포인트 가격 */
  pointPrice: number;
  /** 재고 수량 */
  stock: number;
}

/** GET /api/v1/admin/roulette/participations 목록 한 건 */
export interface RouletteParticipation {
  /** 참여 ID */
  participationId: number;
  /** 사용자 ID */
  userId: number;
  /** 유저 닉네임 */
  nickname: string;
  /** 참여 시간 (ISO 8601) */
  participatedAt: string;
  /** 지급받은 포인트 (P). 꽝이면 0 */
  grantedPoint: number;
}

// ─── 인증 등 기타 (문서 기준) ───

/** POST /api/v1/auth/login Request (간편 로그인) */
export interface AuthLoginRequest {
  /** 닉네임(로그인 ID). 공백 불가 */
  nickname: string;
}

/** POST /api/v1/auth/login Response 200 OK */
export interface AuthLoginResponse {
  /** 사용자 ID (이후 X-User-Id로 사용) */
  userId: number;
  /** 닉네임 */
  nickname: string;
}
