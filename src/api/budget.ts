import { apiClient } from "./axiosInstance";
import type { Budget } from "../types/api";

/** 오늘 예산 조회 API 경로 (VoltUpBE: GET /api/v1/admin/budget) */
const BUDGET_PATH = "/admin/budget";

/**
 * 오늘 예산 현황 조회 (누적 지급액, 잔여 예산)
 * @returns Budget (budgetDate, totalGranted, remaining)
 */
export async function getBudget(): Promise<Budget> {
  const { data } = await apiClient.get<Budget>(BUDGET_PATH);
  return data;
}

/**
 * 오늘 예산 강제 설정 (VoltUpBE: PATCH /api/v1/admin/budget, Body: { totalGranted })
 * @param totalGranted - 강제 설정할 당일 총 지급액 (0 ~ 100,000)
 */
export async function patchBudget(totalGranted: number): Promise<void> {
  await apiClient.patch(BUDGET_PATH, { totalGranted });
}
