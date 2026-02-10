import BudgetSummary from "../components/BudgetSummary";
import RouletteParticipationsSection from "../components/RouletteParticipationsSection";

/**
 * 예산 관리 - 일일 예산 설정/조회, 룰렛 참여 취소(포인트 회수)
 */
export default function Budget() {
  return (
    <div className="space-y-10">
      <h2 className="section-title">예산 관리</h2>
      <BudgetSummary showEditButton={true} showSummaryCards={false} />
      <RouletteParticipationsSection />
    </div>
  );
}
