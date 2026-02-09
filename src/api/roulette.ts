import { apiClient } from "./axiosInstance";
import type { RouletteParticipation } from "../types/api";

/** 룰렛 참여 기록 (VoltUpBE: GET /api/v1/admin/roulette/participations) */
const ROULETTE_PARTICIPATIONS_PATH = "/admin/roulette/participations";

/**
 * 룰렛 참여 기록 목록 조회
 * @returns RouletteParticipation[]
 */
export async function getRouletteParticipations(): Promise<
  RouletteParticipation[]
> {
  const { data } = await apiClient.get<RouletteParticipation[]>(
    ROULETTE_PARTICIPATIONS_PATH
  );
  return data;
}

/**
 * 룰렛 참여 취소·포인트 회수 (VoltUpBE: POST /api/v1/admin/roulette/{participationId}/cancel)
 * @param participationId - 참여 ID
 */
export async function cancelRouletteParticipation(
  participationId: number
): Promise<void> {
  await apiClient.post(
    `/admin/roulette/${participationId}/cancel`
  );
}
