import BudgetSummary from "../components/BudgetSummary";

/**
 * 대시보드 - 오늘 예산 현황, 참여자 수, 지급 포인트 (수정은 예산 관리에서)
 */
export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="section-title">대시보드</h2>
      <BudgetSummary showEditButton={false} />
    </div>
  );
}
