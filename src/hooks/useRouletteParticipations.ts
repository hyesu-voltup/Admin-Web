import { useQuery } from "@tanstack/react-query";
import { getRouletteParticipations } from "../api/roulette";

/** 룰렛 참여 기록 쿼리 키 */
export const rouletteParticipationsQueryKey = [
  "admin",
  "roulette",
  "participations",
] as const;

/**
 * 룰렛 참여 기록 목록 조회 (TanStack Query)
 * GET /api/v1/admin/roulette/participations
 */
export function useRouletteParticipations() {
  return useQuery({
    queryKey: rouletteParticipationsQueryKey,
    queryFn: getRouletteParticipations,
  });
}
