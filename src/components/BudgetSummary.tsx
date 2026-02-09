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

/** 오늘 사용자가 이미 받아간 지급액보다 적게 설정할 수 없음 */
const ERROR_LESS_THAN_GRANTED =
  "오늘 사용자가 받아간 지급액보다 적게 설정할 수 없습니다.";

/**
 * 일일 예산 조회 (필요 시 수정 버튼·다이얼로그)
 * - 대시보드: showEditButton=false (간략 정보만)
 * - 예산 관리: showEditButton=true (오늘의 전체 예산 수정 가능, 검증: 설정값 >= 받아간 지급액)
 */
export default function BudgetSummary({
  showEditButton = true,
}: {
  showEditButton?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useBudget();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalGrantedInput, setTotalGrantedInput] = useState("");
  const [isPatching, setIsPatching] = useState(false);

  const currentGranted = data?.totalGranted ?? 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
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
    setTotalGrantedInput(String(data?.totalGranted ?? 0));
    setDialogOpen(true);
  };

  const handleSubmitBudget = async () => {
    const num = Number(totalGrantedInput.replace(/,/g, ""));
    if (Number.isNaN(num) || num < 0) {
      toast.error("올바른 숫자를 입력해 주세요.");
      return;
    }
    if (num < currentGranted) {
      toast.error(ERROR_LESS_THAN_GRANTED);
      return;
    }
    setIsPatching(true);
    try {
      await patchBudget(num);
      await queryClient.invalidateQueries({ queryKey: budgetQueryKey });
      toast.success("예산이 수정되었습니다.");
      setDialogOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message;
      toast.error(message ?? "예산 수정에 실패했습니다.");
    } finally {
      setIsPatching(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>오늘 사용자가 받아간 지급액</CardTitle>
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
              <DialogTitle>오늘의 전체 예산 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <label
                htmlFor="totalGranted"
                className="block text-sm font-medium text-gray-700"
              >
                오늘의 전체 예산 (P)
              </label>
              <input
                id="totalGranted"
                type="text"
                inputMode="numeric"
                value={totalGrantedInput}
                onChange={(e) => setTotalGrantedInput(e.target.value)}
                placeholder="0"
                disabled={isPatching}
                className="input-base"
              />
              <p className="text-xs text-gray-500">
                ※ 오늘 사용자가 받아간 지급액({formatNumber(currentGranted)}P)보다 적게 설정할 수 없습니다.
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
