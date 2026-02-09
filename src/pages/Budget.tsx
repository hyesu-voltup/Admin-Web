import BudgetSummary from "../components/BudgetSummary";

/**
 * 예산 관리 - 일일 예산 조회 및 오늘의 전체 예산 수정
 */
export default function Budget() {
  return (
    <div className="space-y-8">
      <h2 className="section-title">예산 관리</h2>
      <BudgetSummary showEditButton={true} />
    </div>
  );
}
