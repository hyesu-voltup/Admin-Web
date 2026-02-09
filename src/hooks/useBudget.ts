import { useQuery } from "@tanstack/react-query";
import { getBudget } from "../api/budget";

/** 예산 조회 쿼리 키 (캐시·무효화 식별용) */
export const budgetQueryKey = ["admin", "budget"] as const;

/**
 * 오늘 예산 현황 조회 (TanStack Query)
 * @returns useQuery 결과 - data: BudgetResponse, isLoading, isError, error 등
 */
export function useBudget() {
  return useQuery({
    queryKey: budgetQueryKey,
    queryFn: getBudget,
  });
}
