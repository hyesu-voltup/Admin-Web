import { apiClient } from "./axiosInstance";
import type { AdminOrder } from "../types/api";

/** 전체 주문 목록 (VoltUpBE: GET /api/v1/admin/orders) */
const ORDERS_PATH = "/admin/orders";

/**
 * 전체 주문 목록 조회
 * @returns AdminOrder[]
 */
export async function getOrders(): Promise<AdminOrder[]> {
  const { data } = await apiClient.get<AdminOrder[]>(ORDERS_PATH);
  return data;
}

/**
 * 주문 취소 (VoltUpBE: POST /api/v1/admin/orders/{orderId}/cancel)
 * @param orderId - 취소할 주문 ID
 */
export async function cancelOrder(orderId: number): Promise<void> {
  await apiClient.post(`${ORDERS_PATH}/${orderId}/cancel`);
}
