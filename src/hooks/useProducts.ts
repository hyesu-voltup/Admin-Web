import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products";
import type { AdminProduct } from "../types/api";

/** 상품 목록 쿼리 키 (캐시·무효화 식별용) */
export const productsQueryKey = ["products"] as const;

/**
 * 전체 상품 목록 조회 (TanStack Query)
 * GET /api/v1/products
 * @returns useQuery 결과, data는 AdminProduct[]
 */
export function useProducts() {
  return useQuery<AdminProduct[], Error>({
    queryKey: productsQueryKey,
    queryFn: getProducts,
  });
}
