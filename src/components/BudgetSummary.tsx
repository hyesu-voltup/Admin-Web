import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { ApiClientError } from "../types/api";
import { patchBudget } from "../api/budget";
import { useBudget, budgetQueryKey } from "../hooks/useBudget";

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

function BudgetCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-28" />
      </CardContent>
    </Card>
  );
}

/** 잔여 예산은 0 이상 (이미 지급액보다 적게 설정 시 서버 C016) */
const ERROR_INVALID_REMAINING = "잔여 예산은 0 이상이어야 합니다.";
/** C016: 이미 지급액보다 잔여를 적게 설정 불가 */
const C016_MESSAGE = "이미 지급된 포인트보다 잔여 예산을 적게 설정할 수 없습니다.";

/**
 * 일일 예산 조회 (필요 시 수정 버튼·다이얼로그)
 * - 대시보드: showEditButton=false, showSummaryCards=true (참여자 수·지급 포인트·잔여 예산 카드만)
 * - 예산 관리: showEditButton=true, showSummaryCards=false (카드 없이 예산 수정 버튼·다이얼로그만)
 * - 예산 수정: remaining 입력 시 서버에서 totalLimit = totalGranted + remaining 설정, totalGranted는 불변. C016 시 별도 안내.
 */
export default function BudgetSummary({
  showEditButton = true,
  showSummaryCards = true,
}: {
  showEditButton?: boolean;
  /** false면 상단 요약 카드(참여자 수·지급 포인트·잔여 예산) 미표시 - 예산 관리 페이지용 */
  showSummaryCards?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useBudget();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remainingInput, setRemainingInput] = useState("");
  const [isPatching, setIsPatching] = useState(false);

  if (isLoading) {
    if (!showSummaryCards) {
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" />
        </div>
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
        <BudgetCardSkeleton />
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? null;
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="text-gray-600">
          예산 정보를 불러오지 못했습니다.
          {message ? ` (${message})` : ""}
        </p>
      </div>
    );
  }

  const handleOpenDialog = () => {
    setRemainingInput(String(data?.remaining ?? 0));
    setDialogOpen(true);
  };

  const handleSubmitBudget = async () => {
    const num = Number(remainingInput.replace(/,/g, ""));
    if (Number.isNaN(num) || num < 0) {
      toast.error(ERROR_INVALID_REMAINING);
      return;
    }
    setIsPatching(true);
    try {
      await patchBudget(num);
      await queryClient.invalidateQueries({ queryKey: budgetQueryKey });
      toast.success("잔여 예산이 수정되었습니다.");
      setDialogOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.code === "C016"
            ? C016_MESSAGE
            : err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message;
      toast.error(message ?? "예산 수정에 실패했습니다.");
    } finally {
      setIsPatching(false);
    }
  };

  return (
    <>
      {showSummaryCards && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>참여자 수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {formatNumber(data?.participantCount ?? 0)}
                <span className="ml-1 text-base font-medium text-gray-500 sm:text-lg">명</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>지급 포인트</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {formatNumber(data?.totalGranted ?? 0)}
                <span className="ml-1 text-base font-medium text-gray-500 sm:text-lg">P</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>오늘 발급 한도 (totalLimit)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {formatNumber(data?.totalLimit ?? 0)}
                <span className="ml-1 text-base font-medium text-gray-500 sm:text-lg">P</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>잔여 예산</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-highlight sm:text-3xl">
                {formatNumber(data?.remaining ?? 0)}
                <span className="ml-1 text-base font-medium text-gray-500 sm:text-lg">P</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      {showEditButton && (
        <>
          <div>
            <button
              type="button"
              onClick={handleOpenDialog}
              className="btn-primary"
            >
              예산 수정
            </button>
          </div>
          <DialogContent open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogHeader>
              <DialogTitle>잔여 예산 설정</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <label
                htmlFor="remaining"
                className="block text-sm font-medium text-gray-700"
              >
                설정할 잔여 예산 (P)
              </label>
              <input
                id="remaining"
                type="text"
                inputMode="numeric"
                value={remainingInput}
                onChange={(e) => setRemainingInput(e.target.value)}
                placeholder="0"
                disabled={isPatching}
                className="input-base"
              />
              <p className="text-xs text-gray-500">
                ※ 입력한 잔여 예산(remaining)을 보내면, 오늘 룰렛 발급 가능 전체 포인트(totalLimit)가 지급액({formatNumber(data?.totalGranted ?? 0)}P) + remaining으로 설정됩니다. 지급액은 변경되지 않습니다. 
              </p>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitBudget}
                disabled={isPatching}
                className="btn-primary min-w-[80px]"
              >
                {isPatching ? "수정 중…" : "수정"}
              </button>
            </DialogFooter>
          </DialogContent>
        </>
      )}
    </>
  );
}
