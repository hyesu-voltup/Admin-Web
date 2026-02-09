import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { createProduct, updateProduct } from "../api/products";
import { useProducts, productsQueryKey } from "../hooks/useProducts";

/** 폼 검증 스키마: 가격·재고는 0 이상 숫자만 */
const productFormSchema = z.object({
  name: z.string().min(1, "상품명을 입력해 주세요."),
  pointPrice: z.coerce.number().min(0, "가격은 0 이상이어야 합니다."),
  stock: z.coerce.number().min(0, "재고는 0 이상이어야 합니다."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

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
    resolver: zodResolver(productFormSchema),
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

/**
 * 상품 관리 페이지 (README 관리자 API > 3. 상품)
 * - List: useQuery GET /api/v1/products, Table
 * - Form: Dialog + react-hook-form + zod (name, pointPrice >= 0, stock >= 0)
 * - 등록: POST /admin/products, 수정: PUT /admin/products/{productId}, 수정 시 기존 값 채움
 */
export default function Products() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading, isError, error } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

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

  const handleOpenCreate = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditProduct(product);
    setDialogOpen(true);
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
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-primary w-full sm:w-auto"
        >
          상품 등록
        </button>
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
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-gray-500">
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
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
    </div>
  );
}
