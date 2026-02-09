import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login as loginApi, isApiError } from "../api/auth";
import { setUserId, setNickname } from "../lib/authStorage";

/** Admin ID 접두사 (명세: Admin ID must start with ADMIN) */
const ADMIN_PREFIX = "ADMIN";

/**
 * 로그인 ID가 ADMIN으로 시작하는지 검사
 * @param loginId - 입력된 로그인 ID
 * @returns true면 허용, false면 경고 대상
 */
function isValidAdminLoginId(loginId: string): boolean {
  const trimmed = loginId.trim();
  return trimmed.length > 0 && trimmed.toUpperCase().startsWith(ADMIN_PREFIX);
}

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [showLoginIdWarning, setShowLoginIdWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** 로그인 ID 입력 시 ADMIN 접두사 미충족이면 경고 표시 */
  const handleLoginIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLoginId(value);
      if (value.trim().length > 0) {
        setShowLoginIdWarning(
          !value.trim().toUpperCase().startsWith(ADMIN_PREFIX)
        );
      } else {
        setShowLoginIdWarning(false);
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLoginId = loginId.trim();

    if (!isValidAdminLoginId(trimmedLoginId)) {
      toast.warning(
        "관리자 ID는 반드시 'ADMIN'으로 시작해야 합니다. 올바른 로그인 ID를 입력해 주세요."
      );
      setShowLoginIdWarning(true);
      return;
    }

    setIsSubmitting(true);
    setShowLoginIdWarning(false);

    try {
      const res = await loginApi({ nickname: trimmedLoginId });
      setUserId(String(res.userId));
      setNickname(res.nickname);
      toast.success("로그인되었습니다.");
      navigate("/", { replace: true });
    } catch (err) {
      if (isApiError(err)) {
        const msg =
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message ?? "로그인에 실패했습니다.";
        toast.error(msg);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-[400px] rounded-2xl border border-gray-100 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          VoltUp Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="loginId"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              로그인 ID
            </label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={handleLoginIdChange}
              onBlur={() => {
                if (loginId.trim().length > 0)
                  setShowLoginIdWarning(
                    !loginId.trim().toUpperCase().startsWith(ADMIN_PREFIX)
                  );
              }}
              placeholder="ADMIN으로 시작하는 로그인 ID"
              autoComplete="username"
              className="input-base"
              disabled={isSubmitting}
            />
            {showLoginIdWarning && (
              <p className="mt-2 text-sm text-amber-600" role="alert">
                관리자 ID는 &quot;ADMIN&quot;으로 시작해야 합니다.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
