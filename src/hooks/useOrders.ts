import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orders";

/** 주문 목록 쿼리 키 (캐시·무효화 식별용) */
export const ordersQueryKey = ["admin", "orders"] as const;

/**
 * 전체 주문 목록 조회 (TanStack Query)
 * GET /api/v1/admin/orders
 * @returns useQuery 결과 - data: Order[], isLoading, isError 등
 */
export function useOrders() {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  });
}
