/**
 * 인증 정보 로컬 저장/조회
 * - 보안: 실제 운영에서는 토큰 저장 방식(httpOnly 등) 검토 필요
 */

const USER_ID_KEY = "admin_user_id";
const NICKNAME_KEY = "admin_nickname";

/**
 * 저장된 사용자 ID 조회
 * @returns 저장된 userId 또는 null
 */
export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * 로그인 성공 시 사용자 ID 저장
 * @param userId - API에서 반환한 사용자 ID
 */
export function setUserId(userId: string): void {
  localStorage.setItem(USER_ID_KEY, userId);
}

/**
 * 저장된 어드민 닉네임 조회 (헤더 표시용)
 * @returns 저장된 nickname 또는 null
 */
export function getNickname(): string | null {
  return localStorage.getItem(NICKNAME_KEY);
}

/**
 * 로그인 성공 시 어드민 닉네임 저장
 * @param nickname - 로그인한 어드민 ID(닉네임)
 */
export function setNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname);
}

/**
 * 로그아웃 시 저장된 사용자 ID 및 닉네임 제거
 */
export function clearAuth(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(NICKNAME_KEY);
}

/** @deprecated clearAuth 사용 권장 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}
