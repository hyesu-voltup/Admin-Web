import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { ApiClientError } from "../types/api";
import type { AdminProduct } from "../types/api";
import { createProduct, updateProduct, deleteProduct } from "../api/products";
import { useProducts, productsQueryKey } from "../hooks/useProducts";

/** 폼 값 타입 (zod 스키마와 동일하게 유지) */
export type ProductFormValues = {
  name: string;
  pointPrice: number;
  stock: number;
};

/** 폼 검증 스키마: 가격·재고는 0 이상 숫자만 (Zod v4 호환) */
const productFormSchema = z.object({
  name: z.string().min(1, "상품명을 입력해 주세요."),
  pointPrice: z.coerce.number().min(0, "가격은 0 이상이어야 합니다."),
  stock: z.coerce.number().min(0, "재고는 0 이상이어야 합니다."),
}) satisfies z.ZodType<ProductFormValues>;

const defaultValues: ProductFormValues = {
  name: "",
  pointPrice: 0,
  stock: 0,
};

/**
 * 상품 등록/수정 Dialog 폼
 * - react-hook-form + zod (name, pointPrice >= 0, stock >= 0)
 * - 수정 시 기존 값으로 폼 초기화
 */
function ProductFormDialog({
  open,
  onOpenChange,
  editProduct,
  onSubmitForm,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct: AdminProduct | null;
  onSubmitForm: (
    values: ProductFormValues,
    productId?: number
  ) => void;
  isSubmitting: boolean;
}) {
  const isEdit = !!editProduct;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (editProduct) {
      reset({
        name: editProduct.name,
        pointPrice: editProduct.pointPrice,
        stock: editProduct.stock,
      });
    } else {
      reset(defaultValues);
    }
  }, [open, editProduct, reset]);

  const onSubmit = (values: ProductFormValues) => {
    onSubmitForm(values, editProduct?.id);
  };

  return (
    <DialogContent open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "상품 수정" : "상품 등록"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="product-name"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            상품명
          </label>
          <input
            id="product-name"
            {...register("name")}
            className="input-base"
            placeholder="상품명"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="product-pointPrice"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            포인트 가격 (P)
          </label>
          <input
            id="product-pointPrice"
            type="number"
            min={0}
            {...register("pointPrice")}
            className="input-base"
            disabled={isSubmitting}
          />
          {errors.pointPrice && (
            <p className="mt-1 text-sm text-red-600">
              {errors.pointPrice.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="product-stock"
            className="block text-sm font-bold text-gray-700 mb-2"
          >
            재고
          </label>
          <input
            id="product-stock"
            type="number"
            min={0}
            {...register("stock")}
            className="input-base"
            disabled={isSubmitting}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="btn-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? "처리 중…" : isEdit ? "수정" : "등록"}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/** 정렬 기준 (상품ID순, 가격순, 재고순) */
type ProductSortBy = "id" | "pointPrice" | "stock";

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: "id", label: "상품 ID순" },
  { value: "pointPrice", label: "가격순" },
  { value: "stock", label: "재고순" },
];

/**
 * 상품 관리 페이지 (README 관리자 API > 3. 상품)
 * - List: useQuery GET /api/v1/products, Table, 정렬(상품ID·가격·재고)
 * - Form: Dialog + react-hook-form + zod (name, pointPrice >= 0, stock >= 0)
 * - 등록: POST /admin/products, 수정: PUT /admin/products/{productId}, 수정 시 기존 값 채움
 */
export default function Products() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading, isError, error } = useProducts();
  const [sortBy, setSortBy] = useState<ProductSortBy>("id");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  /** 현재 정렬 기준으로 정렬된 목록 (원본 불변) */
  const sortedProducts = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      switch (sortBy) {
        case "pointPrice":
          return a.pointPrice - b.pointPrice;
        case "stock":
          return a.stock - b.stock;
        default:
          return a.id - b.id;
      }
    });
    return copy;
  }, [products, sortBy]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success("상품이 등록되었습니다.");
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "상품 등록에 실패했습니다."
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: number;
      body: { name: string; pointPrice: number; stock: number };
    }) => updateProduct(productId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success("상품이 수정되었습니다.");
      setDialogOpen(false);
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "상품 수정에 실패했습니다."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success("상품이 삭제되었습니다.");
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "상품 삭제에 실패했습니다."
      );
    },
  });

  const handleOpenCreate = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditProduct(product);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const handleSubmitForm = (
    values: ProductFormValues,
    productId?: number
  ) => {
    if (productId != null) {
      updateMutation.mutate({ productId, body: values });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="section-title">상품 관리</h2>
        <div className="space-y-2 rounded-xl border border-black/10 p-4">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : (error as { message?: string })?.message ?? null;
    return (
      <div className="space-y-6">
        <h2 className="section-title">상품 관리</h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
          <p className="text-gray-600">
            상품 목록을 불러오지 못했습니다.
            {message ? ` (${message})` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="section-title">상품 관리</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="product-sort" className="text-sm font-medium text-gray-700">
            정렬
          </label>
          <select
            id="product-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
            className="input-base w-auto min-w-[120px]"
            aria-label="상품 정렬 기준 선택"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn-primary w-full sm:w-auto"
          >
            상품 등록
          </button>
        </div>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상품 ID</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>가격 (P)</TableHead>
              <TableHead>재고</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-gray-500">
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.pointPrice.toLocaleString()}</TableCell>
                  <TableCell>{product.stock.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(product)}
                      className="btn-ghost min-h-[44px] text-gray-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      className="btn-ghost min-h-[44px] text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editProduct={editProduct}
        onSubmitForm={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* 삭제 확인 다이얼로그 */}
      <DialogContent
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogHeader>
          <DialogTitle>상품 삭제</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          {deleteTarget?.name}(ID: {deleteTarget?.id}) 상품을 삭제하시겠습니까?
          삭제된 상품은 목록에서 제외됩니다.
        </p>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="btn-secondary"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="btn-primary min-w-[80px] text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {deleteMutation.isPending ? "처리 중…" : "삭제"}
          </button>
        </DialogFooter>
      </DialogContent>
    </div>
  );
}
