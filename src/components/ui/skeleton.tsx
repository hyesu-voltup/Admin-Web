import * as React from "react";

/**
 * 로딩 스켈레톤 UI
 * shadcn/ui 스타일, 애니메이션으로 로딩 상태 표현
 */
function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-black/10 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
