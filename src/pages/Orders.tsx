import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
import { cancelOrder } from "../api/orders";
import { useOrders, ordersQueryKey } from "../hooks/useOrders";
import type { AdminOrder } from "../types/api";

/** 주문 시간 포맷 (Intl.DateTimeFormat, 읽기 편한 날짜·시간) */
const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatOrderedAt(isoString: string): string {
  return dateTimeFormat.format(new Date(isoString));
}

/**
 * 주문 테이블 로딩 스켈레톤
 */
function OrdersTableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border border-black/10 p-4">
      <Skeleton className="h-10 w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * 전체 주문 목록 페이지 (README 관리자 API > 2. 주문)
 * - List: useQuery GET /api/v1/admin/orders, Table(주문ID, 닉네임, 주문시간, 상품명, 수량)
 * - Cancel: 각 행 주문 취소 버튼 → 확인 모달 → useMutation POST .../cancel → invalidateQueries + '취소 완료' 토스트
 */
export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError, error } = useOrders();
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      toast.success("취소 완료");
      setCancelTarget(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err &&
              typeof err === "object" &&
              "response" in err &&
              (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message;
      toast.error(message ?? "주문 취소에 실패했습니다.");
    },
  });

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget.orderId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="section-title">주문 내역</h2>
        <OrdersTableSkeleton />
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? null
          : null;
    return (
      <div className="space-y-6">
        <h2 className="section-title">주문 내역</h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
          <p className="text-gray-600">
            주문 목록을 불러오지 못했습니다.
            {message ? ` (${message})` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">주문 내역</h2>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문 ID</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead>주문 시간</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>수량</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-gray-500">
                  주문 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.nickname}</TableCell>
                  <TableCell>{formatOrderedAt(order.orderedAt)}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setCancelTarget(order)}
                      className="btn-ghost min-h-[44px] text-gray-700"
                    >
                      주문 취소
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 주문 취소 확인 모달 */}
      <DialogContent
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogHeader>
          <DialogTitle>주문 취소</DialogTitle>
        </DialogHeader>
        <p className="text-gray-700">
          이 주문을 취소하시겠습니까? 포인트 환불 및 재고가 복구됩니다.
          {cancelTarget && (
            <span className="mt-2 block text-sm text-gray-500">
              주문 ID: {cancelTarget.orderId}
            </span>
          )}
        </p>
        <DialogFooter>
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            className="btn-secondary"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelMutation.isPending}
            className="btn-primary"
          >
            {cancelMutation.isPending ? "처리 중…" : "확인"}
          </button>
        </DialogFooter>
      </DialogContent>
    </div>
  );
}
