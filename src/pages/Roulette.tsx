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
import type { RouletteParticipation } from "../types/api";
import { cancelRouletteParticipation } from "../api/roulette";
import {
  useRouletteParticipations,
  rouletteParticipationsQueryKey,
} from "../hooks/useRouletteParticipations";

/** C015: 룰렛 취소 시 회수할 포인트 부족 - 특수 안내 메시지 */
const C015_MESSAGE =
  "해당 유저의 잔액이 부족하여 지급된 포인트를 회수할 수 없습니다";

/** 참여 시간 포맷 */
const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatParticipatedAt(isoString: string): string {
  return dateTimeFormat.format(new Date(isoString));
}

/**
 * 룰렛 로그 페이지 (README 관리자 API > 4. 룰렛)
 * - GET /api/v1/admin/roulette/participations 목록
 * - 참여 취소: POST .../cancel, C015 시 특수 경고 메시지
 */
export default function Roulette() {
  const queryClient = useQueryClient();
  const { data: participations = [], isLoading, isError, error } = useRouletteParticipations();
  const [cancelTarget, setCancelTarget] =
    useState<RouletteParticipation | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (participationId: number) =>
      cancelRouletteParticipation(participationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rouletteParticipationsQueryKey });
      toast.success("참여가 취소되었습니다.");
      setCancelTarget(null);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiClientError && err.code === "C015") {
        toast.error(C015_MESSAGE);
      } else {
        const message =
          err instanceof ApiClientError
            ? err.message
            : (err as { message?: string })?.message ?? "참여 취소에 실패했습니다.";
        toast.error(message);
      }
    },
  });

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget.participationId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="section-title">룰렛 기록</h2>
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
        <h2 className="section-title">룰렛 기록</h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-card">
          <p className="text-gray-600">
            참여 기록을 불러오지 못했습니다.
            {message ? ` (${message})` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">룰렛 기록</h2>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>참여 ID</TableHead>
              <TableHead>유저 ID</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead>참여 시간</TableHead>
              <TableHead>지급 포인트 (P)</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-gray-500">
                  참여 기록이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              participations.map((p) => (
                <TableRow key={p.participationId}>
                  <TableCell className="font-medium">{p.participationId}</TableCell>
                  <TableCell>{p.userId}</TableCell>
                  <TableCell>{p.nickname}</TableCell>
                  <TableCell>{formatParticipatedAt(p.participatedAt)}</TableCell>
                  <TableCell>{p.grantedPoint.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setCancelTarget(p)}
                      className="btn-ghost min-h-[44px] text-gray-700"
                    >
                      참여 취소
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DialogContent
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogHeader>
          <DialogTitle>룰렛 참여 취소</DialogTitle>
        </DialogHeader>
        <p className="text-gray-700">
          이 참여를 취소하시겠습니까? 지급된 포인트가 회수됩니다.
          {cancelTarget && (
            <span className="mt-2 block text-sm text-gray-500">
              참여 ID: {cancelTarget.participationId} · {cancelTarget.nickname} ·{" "}
              {cancelTarget.grantedPoint}P
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
