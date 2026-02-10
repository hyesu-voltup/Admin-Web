import { apiClient } from "./axiosInstance";
import type { AdminProduct } from "../types/api";

/** 전체 상품 목록 (VoltUpBE: GET /api/v1/products) */
const PRODUCTS_PATH = "/products";
/** 어드민 상품 (VoltUpBE: POST/PUT /api/v1/admin/products) */
const ADMIN_PRODUCTS_PATH = "/admin/products";

/**
 * 전체 상품 목록 조회
 * @returns AdminProduct[]
 */
export async function getProducts(): Promise<AdminProduct[]> {
  const { data } = await apiClient.get<AdminProduct[]>(PRODUCTS_PATH);
  return data;
}

/** 상품 등록 Request Body */
export interface CreateProductBody {
  name: string;
  pointPrice: number;
  stock: number;
}

/**
 * 상품 등록 (VoltUpBE: POST /api/v1/admin/products)
 * @returns 생성된 AdminProduct
 */
export async function createProduct(
  body: CreateProductBody
): Promise<AdminProduct> {
  const { data } = await apiClient.post<AdminProduct>(
    ADMIN_PRODUCTS_PATH,
    body
  );
  return data;
}

/** 상품 수정 Request Body (전달한 필드만 변경) */
export interface UpdateProductBody {
  name?: string;
  pointPrice?: number;
  stock?: number;
}

/**
 * 상품 수정 (VoltUpBE: PUT /api/v1/admin/products/{productId})
 * @returns 수정된 AdminProduct
 */
export async function updateProduct(
  productId: number,
  body: UpdateProductBody
): Promise<AdminProduct> {
  const { data } = await apiClient.put<AdminProduct>(
    `${ADMIN_PRODUCTS_PATH}/${productId}`,
    body
  );
  return data;
}

/**
 * 상품 소프트 삭제 (VoltUpBE: DELETE /api/v1/admin/products/{productId})
 * - 삭제된 상품은 목록/조회에서 제외됨
 * @param productId - 상품 ID
 * @returns 204 No Content (성공), 404 상품 없음 또는 이미 삭제됨
 */
export async function deleteProduct(productId: number): Promise<void> {
  await apiClient.delete(`${ADMIN_PRODUCTS_PATH}/${productId}`);
}
