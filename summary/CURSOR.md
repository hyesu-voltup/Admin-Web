# CURSOR.md — AI 활용 개발 기록

---

## 📋 프롬프트 기록

---

### 1. 인증 명세 기반 Axios 설정 및 로그인 페이지

**요청:** README 인증 명세를 반영해 Axios 인스턴스를 구성하고, 로그인 페이지를 먼저 구현해 달라. baseURL은 `{BASE_URL}/api/v1`로 두고, 닉네임이 ADMIN으로 시작하지 않으면 경고 메시지를 표시해 달라.

**구현 요약**

- Axios: `baseURL`, 요청 인터셉터에서 `localStorage`의 `userId`를 `X-User-Id`에 자동 주입.
- 로그인 페이지: Admin ID(닉네임) 입력 폼, “ADMIN” 접두사 검증(실시간·제출 시), 인증 성공 시 `userId`, `nickname`을 `localStorage`에 저장 후 이후 요청에 사용.

---

### 2. 어드민 공통 레이아웃 및 라우팅

**요청:** 로그인 후 공통 레이아웃(AppLayout)을 만들어 달라. 왼쪽 사이드바에 [대시보드, 예산 관리, 상품 관리, 주문 내역, 룰렛 기록] 메뉴를 두고 react-router-dom으로 라우팅하며, 우측 상단에는 로그인한 닉네임과 로그아웃 버튼을 배치해 달라. 하이라이트 색상 #E4FF30, 나머지는 흰색·검정 기반으로 정리해 달라.

**구현 요약**

- AppLayout: 고정 사이드바 + 헤더 + `<Outlet />`. `NavLink`로 활성 메뉴 하이라이트.
- 라우팅: `/`, `/budget`, `/admin/products`, `/admin/orders`, `/admin/roulette/participations` 등 메뉴와 1:1 매칭, 미인증 시 `/login` 리다이렉트.

---

### 3. 로그인 단순화 및 Mock 테스트

**요청:** 로그인을 “로그인 ID만” 사용하는 방식으로 단순화해 달라. 현재는 Mock으로 ADMINtest 한 개만 허용해 테스트할 수 있게 해 달라.

**구현 요약**

- 비밀번호 제거, 단일 필드(로그인 ID) 로그인. VoltUpBE 명세에 맞춰 `nickname` 기반으로 조정.
- Mock: `ADMINtest`일 때만 성공, 그 외 “등록된 로그인 ID가 아닙니다” 토스트.

---

### 4. 대시보드 — 예산 API 연동 및 로딩 UX

**요청:** README 예산 API를 사용해 대시보드 페이지를 구현해 달라. Card로 “오늘 총 지급액”, “잔여 예산”을 표시하고, TanStack Query로 데이터를 가져오며, 로딩 시 스켈레톤을 적용해 달라.

**구현 요약**

- `GET /api/v1/admin/budget` → `Budget` 타입(budgetDate, totalGranted, remaining) 연동.
- useBudget(useQuery), Card 2개, 숫자 천 단위 콤마, 로딩 시 카드 레이아웃 스켈레톤.

---

### 5. 예산 수정 Dialog 및 캐시 무효화

**요청:** 대시보드에 “예산 수정” 버튼을 두고, 클릭 시 Dialog에서 “새로운 오늘 총 지급액”을 입력해 PATCH 호출 후, 성공 시 `invalidateQueries`로 대시보드 데이터를 갱신해 달라.

**구현 요약**

- Dialog(입력·취소/수정 버튼), `patchBudget(totalGranted)` → PATCH Body `{ totalGranted }`.
- 성공 시 `queryClient.invalidateQueries({ queryKey: budgetQueryKey })`, Dialog 닫기·성공 토스트.

---

### 6. 주문 관리 — 목록·취소·확인 모달

**요청:** README “관리자 API > 2. 주문” 명세로 주문 내역 페이지를 구현해 달라. GET /admin/orders를 useQuery로 가져와 Table로 [주문 ID, 닉네임, 주문 시간, 상품명, 수량, 관리]를 구성하고, “주문 취소” 클릭 시 확인 모달 후 useMutation으로 cancel 호출, 성공 시 목록 갱신 및 토스트 처리해 달라.

**구현 요약**

- `/admin/orders` 라우트, useQuery + Table, 주문 시간은 `Intl.DateTimeFormat('ko-KR')` 포맷.
- 주문 취소: 확인 Dialog → useMutation POST .../cancel → invalidateQueries + 토스트.

---

### 7. VoltUpBE 기반 타입·Axios·에러 처리

**요청:** VoltUpBE.md를 기준으로 Response 타입(Budget, AdminOrder, AdminProduct, RouletteParticipation 등)을 정의하고, Axios baseURL·X-User-Id 인터셉터를 적용해 달라. 에러 응답은 `{ code, message }`로 파싱하고, code가 C001~C015일 때 해당 message를 가진 커스텀 에러를 던지도록 설계해 달라.

**구현 요약**

- `src/types/api.ts`: 문서와 동일 필드로 인터페이스 정의, ApiErrorResponse, ApiClientError(C001~C015 분기).
- Axios 인터셉터에서 getUserId()로 X-User-Id 설정. 응답 에러 시 C001~C015면 `ApiClientError` throw, 화면에서는 `instanceof ApiClientError`로 message 표시.

---

### 8. 상품 관리 — CRUD·폼·검증

**요청:** “관리자 API > 3. 상품” 명세로 /admin/products에 상품 관리 페이지를 만들어 달라. Dialog + react-hook-form으로 등록/수정 폼(name, pointPrice, stock)을 구성하고, 등록은 POST, 수정은 PUT /admin/products/{productId}를 사용하며, 가격·재고는 0 이상만 허용하도록 zod로 검증해 달라.

**구현 요약**

- useQuery 목록, Table + “상품 등록” 버튼. Dialog 하나로 등록/수정 공용, zodResolver·`z.coerce.number().min(0)`.
- getProducts, createProduct, updateProduct, 성공 시 invalidateQueries·토스트.

---

### 9. 룰렛 기록 페이지 및 C015 예외 처리

**요청:** “관리자 API > 4. 룰렛” 명세로 /admin/roulette/participations에 룰렛 로그 페이지를 만들어 달라. “참여 취소” 시 POST cancel 호출하고, 에러 코드 C015(회수할 포인트 부족)일 때는 별도 안내 문구로 표시해 달라.

**구현 요약**

- GET participations 목록, Table + 참여 취소 버튼, 확인 Dialog 후 useMutation.
- onError에서 `err.code === 'C015'`이면 “해당 유저의 잔액이 부족하여 지급된 포인트를 회수할 수 없습니다” 고정 메시지 토스트.

---

### 10. 기능 점검·모바일·폰트 통일

**요청:** 로그인·예산·상품·주문·룰렛까지 빠진 기능이 있으면 보완하고, 모바일에서도 동일하게 사용할 수 있도록 반응형과 터치 영역을 적용해 달라. 전체 폰트는 Nanum Gothic Coding으로 통일해 달라.

**구현 요약**

- 예산 관리 페이지(/budget)를 BudgetSummary로 실제 조회/설정 가능하도록 보완.
- md 미만에서 햄버거 메뉴 + 드로어, 테이블 가로 스크롤, 버튼 min-h-[44px] 등 터치 영역 확보.
- 폰트: Nanum Gothic Coding → 이후 Pretendard로 변경.

---

### 11. 예산 문구·역할 분리·토스 스타일 UI

**요청:** (1) 예산 카드 문구를 “오늘 사용자가 받아간 지급액”으로 명확히 하고, 수정 시 이 값보다 작게 설정할 수 없도록 검증해 달라. (2) 대시보드는 요약만, 예산 수정은 예산 관리 페이지에서만 하도록 역할을 나눠 달라. (3) 토스처럼 깔끔한 한국형 UI로 정리해 달라.

**구현 요약**

- 라벨·검증: totalGranted 미만 입력 시 토스트 후 전송 불가.
- BudgetSummary에 `showEditButton` prop. 대시보드 false(카드만), 예산 관리 true(카드 + 수정 버튼 + Dialog).
- gray-50 배경, 카드/테이블 흰 배경·shadow-card, btn-primary/secondary/ghost, input-base, section-title 등 유틸리티 적용.

---

### 12. 폰트·브랜드 문구 통일

**요청:** 전체 폰트를 Pretendard로 바꾸고, 브랜드 노출을 “VoltUp Admin”으로 통일해 달라.

**구현 요약**

- Pretendard CDN 적용, tailwind fontFamily.sans 및 :root 반영.
- title, AppLayout 로고, Login 카드 제목을 “VoltUp Admin”으로 통일.

---

### 13. Vercel 배포 — 환경 변수 서버 전용 및 Serverless 프록시

**요청:** Vercel로 배포할 예정인데, .env·vite.config에 있는 도메인이 노출되는 것이 불안하다. Vercel 대시보드에 저장한 환경 변수를 서버에서만 사용하고 브라우저로 넘어가지 않게 하고, Serverless Function으로 API 프록시를 구성해 달라.

**구현 요약**

- 클라이언트: axios baseURL을 상대 경로 `/api/v1`로 고정. 실제 백엔드 URL은 클라이언트에 노출하지 않음.
- Vercel: `api/proxy.ts` 서버리스 함수에서 `API_BASE_URL`(서버 전용 환경 변수)로 백엔드 프록시. `vercel.json` rewrites로 `/api/v1/:path*` → `/api/proxy` 전달, path는 쿼리로 전달.
- vite.config·.env의 도메인은 로컬 개발용으로만 유지, 저장소에는 .env 제외·.env.example만 관리.

---

### 14. 배포 빌드 에러 수정 (타입·문법)

**요청:** 배포 중 다음 문제를 해결해 달라. (1) auth.ts의 apiClient, LOGIN_PATH가 선언만 되고 사용되지 않음. (2) Products.tsx에서 타입이 unknown으로 추론됨. (3) api.ts에서 erasableSyntaxOnly 사용 시 허용되지 않는 문법 오류.

**구현 요약**

- auth.ts: Mock이 아닌 경우 실제 `apiClient.post(LOGIN_PATH, { nickname })` 호출로 연동.
- useProducts: `useQuery<AdminProduct[], Error>` 제네릭 지정으로 data 타입 명시.
- api.ts: ApiClientError 생성자에서 parameter property(`public readonly code`) 제거, 클래스 필드 + 생성자 내 `this.code = code`로 변경해 erasableSyntaxOnly 호환.

---

### 15. Orders·Products 토스트·폼 타입 에러 수정

**요청:** Orders.tsx 74행 toast.error 인자 타입 에러, Products.tsx에서 zodResolver·SubmitHandler 관련 타입 불일치(unknown 추론)를 수정해 달라.

**구현 요약**

- Orders: 에러에서 message 추출 시 `string | undefined`로 명시하고, `response?.data?.message`는 unknown으로 받은 뒤 `String()`으로 안전 변환 후 toast에 전달.
- Products: ProductFormValues를 스키마 추론 대신 명시적 타입으로 정의, `zodResolver(schema) as Resolver<ProductFormValues>`로 resolver 타입 단언.

---

### 16. 예산 API 응답 확장·상품 삭제·페이지 구성 정리

**요청:** (1) 예산 API 응답에 `participantCount`가 추가되었다. 타입과 화면에 반영해 달라. (2) 어드민에서 상품 삭제(소프트 삭제) 기능을 추가해 달라. (3) 예산 강제 설정 API가 잔여(remaining) 기준으로 변경되었다. PATCH body를 remaining으로 맞추고, 예산 관리 화면도 잔여 예산 수정으로 바꿔 달라. (4) 화면 구성을 [대시보드: 예산 현황·참여자 수·지급 포인트 / 예산 관리: 일일 예산 설정·조회 + 룰렛 참여 취소(포인트 회수) / 상품 관리: CRUD·재고 / 주문 내역: 목록·주문 취소]로 정리해 달라.

**구현 요약**

- Budget 타입에 `participantCount` 추가. BudgetSummary에서 참여자 수·지급 포인트·잔여 예산 카드 3개 표시.
- products API에 deleteProduct(DELETE /admin/products/{productId}) 추가, Products 페이지에 삭제 버튼·확인 Dialog·mutation 연동.
- patchBudget 인자를 remaining으로 변경, Body `{ remaining }`. BudgetSummary 다이얼로그를 “잔여 예산 강제 설정”으로 변경.
- 예산 관리 페이지에 RouletteParticipationsSection 통합. 네비에서 “룰렛 기록” 제거, 해당 경로는 /budget으로 리다이렉트. RouletteParticipationsSection에서 참여 취소 성공 시 budget 쿼리 무효화로 참여자 수 갱신.

---

### 17. 예산 관리 상단 중복 제거

**요청:** 예산 관리와 대시보드가 상단이 비슷해서, 예산 관리에서는 대시보드와 같은 요약 카드 영역을 제거해 달라.

**구현 요약**

- BudgetSummary에 `showSummaryCards` prop 추가. true일 때만 참여자 수·지급 포인트·잔여 예산 카드 렌더링.
- 예산 관리 페이지에서는 `showSummaryCards={false}`로 전달해 카드 없이 “예산 수정” 버튼·Dialog와 룰렛 참여 취소 섹션만 표시.

---

### 18. 상품 관리 정렬(필터) 기능

**요청:** 상품 관리에서 목록 정렬 기능을 추가해 달라. 상품 ID순, 가격순, 재고순으로 정렬할 수 있게 해 달라.

**구현 요약**

- sortBy 상태(`id` | `pointPrice` | `stock`), `<select>`로 “상품 ID순 / 가격순 / 재고순” 선택.
- useMemo로 `products`를 sortBy 기준으로 정렬한 `sortedProducts` 생성, 테이블에는 sortedProducts 사용. API 호출은 변경 없이 클라이언트 정렬만 적용.

---

## 📊 관점별 정리

### 1. 설계

| 주제 | 설계 관점에서의 요약 |
|------|----------------------|
| **인증·API 계층** | README/VoltUpBE 명세를 기준으로 Axios baseURL·X-User-Id, 공통 에러 형식(ApiErrorResponse, ApiClientError, C001~C015 분기)을 먼저 정의하고, 페이지별로 API·타입을 일관되게 사용하도록 설계했다. |
| **레이아웃·라우팅** | 로그인 후 단일 레이아웃(AppLayout) + Outlet 구조로 두고, 메뉴와 경로를 1:1 매칭해 확장하기 쉬운 라우팅 구조를 선택했다. |
| **역할 분리** | 대시보드(요약만)·예산 관리(수정 + 룰렛 참여 취소)를 BudgetSummary의 `showEditButton`·`showSummaryCards`로 제어해, 한 컴포넌트로 두 화면의 요구사항을 만족시키도록 설계했다. |
| **배포·보안** | 백엔드 URL을 클라이언트에 노출하지 않기 위해 상대 경로 `/api/v1` + Vercel Serverless 프록시(api/proxy, 환경 변수 서버 전용)로 설계했다. |

---

### 2. 문제 고민과 해결

| 문제 | 고민·해결 방향 |
|------|-----------------|
| **타입 unknown·resolver 불일치** | useQuery·zod 스키마 추론이 unknown을 낼 때, 제네릭 명시(useQuery<AdminProduct[], Error>)와 Resolver 단언, ProductFormValues 명시 타입으로 해결했다. |
| **erasableSyntaxOnly 오류** | ApiClientError의 parameter property가 erasable 문법에 맞지 않아, 일반 클래스 필드 + 생성자 대입으로 바꿔 제거 가능한 문법만 사용하도록 했다. |
| **toast 인자 타입** | 에러 객체에서 message를 꺼낼 때 추론이 `{}`가 되는 경우를 막기 위해, message를 `string \| undefined`로 두고 optional chaining 결과를 `String()`으로 감싸 안전하게 전달했다. |
| **예산 관리·대시보드 중복** | “같은 카드가 두 페이지에 나오는 것”을 줄이기 위해, 예산 관리에서는 카드를 숨기는 옵션(showSummaryCards)을 도입해 수정·룰렛 영역만 노출하도록 했다. |
| **Windows·경로 이슈** | Vercel catch-all 경로 `api/[[...path]]`의 브라켓 폴더명이 Windows에서 문제를 일으킬 수 있어, vercel.json rewrites + 단일 `api/proxy.ts`로 대체했다. |

---

### 3. 생산성 향상

| 방식 | 효과 |
|------|------|
| **명세 기반 일괄 요청** | “README/VoltUpBE 명세로 타입·API·에러 처리까지 한 번에 맞춰 달라”처럼 범위를 묶어 요청해, 타입 정의·axios 설정·에러 분기를 한 사이클에 정리할 수 있었다. |
| **역할·화면 단위 정리** | “대시보드는 요약만, 예산 수정은 예산 관리에서만”, “예산 관리에는 룰렛 참여 취소까지 포함”처럼 화면별 역할을 문장으로 정리한 뒤 요청해, 불필요한 수정을 줄였다. |
| **에러 메시지 그대로 전달** | “Orders 74행 toast 타입 에러”, “api.ts erasableSyntaxOnly”처럼 파일·위치·에러 종류를 적어 주어, 원인 파악과 수정이 빠르게 이뤄졌다. |
| **API 변경과 UI 변경 분리** | “현재 API는 변하면 안 되고, 응답 필드만 participantCount 추가·PATCH body만 remaining으로 변경”처럼 제약을 명시해, 기존 호출을 유지한 채 타입·화면만 수정할 수 있었다. |
