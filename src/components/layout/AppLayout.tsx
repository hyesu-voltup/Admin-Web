import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { getNickname, clearAuth } from "../../lib/authStorage";

/** 사이드바 메뉴 항목 (path, 라벨) */
const MENU_ITEMS: { path: string; label: string }[] = [
  { path: "/", label: "대시보드" },
  { path: "/budget", label: "예산 관리" },
  { path: "/admin/products", label: "상품 관리" },
  { path: "/admin/orders", label: "주문 내역" },
  { path: "/admin/roulette/participations", label: "룰렛 기록" },
];

/** 햄버거 메뉴 아이콘 (모바일용) */
function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * 로그인 후 공통 레이아웃
 * - 데스크톱(md+): 왼쪽 사이드바 + 헤더 + 메인
 * - 모바일: 햄버거 메뉴 + 드로어, 동일한 헤더·메인
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const nickname = getNickname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    toast.success("로그아웃되었습니다.");
    navigate("/login", { replace: true });
  };

  const navContent = (
    <>
      <div className="border-b border-gray-100 px-5 py-5">
        <h1 className="text-lg font-bold text-gray-900">VoltUp Admin</h1>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {MENU_ITEMS.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block min-h-[48px] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-highlight text-gray-900 font-bold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 데스크톱: 왼쪽 사이드바 */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
        {navContent}
      </aside>

      {/* 모바일: 메뉴 드로어 */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-100 bg-white shadow-card md:hidden">
            {navContent}
          </aside>
        </>
      )}

      {/* 우측: 헤더 + 메인 */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 md:justify-end md:gap-4 md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="btn-ghost min-h-[48px] min-w-[48px] -ml-2 md:hidden"
            aria-label="메뉴 열기"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-sm font-medium text-gray-600 truncate max-w-[120px] sm:max-w-none">{nickname ?? "관리자"}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary min-h-[48px]"
            >
              로그아웃
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
