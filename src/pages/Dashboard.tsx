import BudgetSummary from "../components/BudgetSummary";

/**
 * 대시보드 - 오늘 예산 간략 현황만 표시 (수정은 예산 관리 페이지에서)
 */
export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="section-title">오늘 예산 요약</h2>
      <BudgetSummary showEditButton={false} />
    </div>
  );
}
