import { apiClient } from "./axiosInstance";
import type { Budget } from "../types/api";

/** 오늘 예산 조회 API 경로 (VoltUpBE: GET /api/v1/admin/budget) */
const BUDGET_PATH = "/admin/budget";

/**
 * 오늘 예산 현황 조회
 * @returns Budget (budgetDate, totalGranted, totalLimit, remaining, participantCount)
 */
export async function getBudget(): Promise<Budget> {
  const { data } = await apiClient.get<Budget>(BUDGET_PATH);
  return data;
}

/**
 * 오늘 잔여 예산(remaining) 강제 설정 (VoltUpBE: PATCH /api/v1/admin/budget, Body: { remaining })
 * - 서버에서 오늘 발급 한도 totalLimit = totalGranted + remaining 으로 설정. totalGranted는 변경되지 않음.
 * - remaining을 이미 지급액(totalGranted)보다 적게 설정 불가 시 서버에서 C016
 * @param remaining - 설정할 잔여 예산(추가 발급 가능 포인트) (P)
 */
export async function patchBudget(remaining: number): Promise<void> {
  await apiClient.patch(BUDGET_PATH, { remaining });
}
