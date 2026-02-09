# CURSOR.md — 프로젝트 ai 정리 내용

> CURSOR ai를 활용한 어드민 웹 페이지 제작 대화 정리

---

## 1. 인증 명세 기반 Axios 설정 및 로그인 페이지

<aside>
<strong>질문 의도</strong><br/>
README 인증 명세를 실제 코드에 반영할 수 있는지, 그리고 로그인 플로우(검증 포함)를 한 번에 설계·구현할 수 있는지 확인하고 싶은 질문입니다. “닉네임이 ADMIN으로 시작하지 않으면 경고”는 비즈니스 규칙 준수와 UX를 함께 보는 포인트입니다.
</aside>

**요청:** README 인증 명세를 바탕으로 Axios 인스턴스를 만들고, 로그인 페이지를 먼저 구현해 달라. 닉네임이 ADMIN으로 시작하지 않으면 경고 메시지를 띄워 달라.

**결론·구현 요약**

- **Axios 인스턴스:** `baseURL = {BASE_URL}/api/v1`, 요청 인터셉터에서 `localStorage`의 `userId`를 읽어 `X-User-Id` 헤더에 자동 주입.
- **로그인 페이지:** Admin ID(닉네임) + 비밀번호 입력 폼, 실시간으로 “ADMIN” 접두사 검증 후 미충족 시 입력란 아래 경고 문구 표시, 제출 시에도 검증해 토스트로 안내.
- **인증 저장:** 로그인 성공 시 `userId`, `nickname`을 `localStorage`에 저장하고, 이후 요청에 사용.

---

## 2. 어드민 공통 레이아웃 및 라우팅

<aside>
<strong>질문 의도</strong><br/>
실무에서 자주 쓰는 “사이드바 + 헤더 + 메인” 구조와 라우팅 설계를 한 번에 요청해, 정보 구조 설계와 react-router-dom 활용 능력을 보려는 의도입니다. 하이라이트 색상 유지와 흰색/검정 기반은 디자인 시스템 일관성을 묻는 부분입니다.
</aside>

**요청:** 로그인 성공 후 보여줄 어드민 공통 레이아웃(AppLayout)을 만들어 달라. 왼쪽 사이드바에 [대시보드, 예산 관리, 상품 관리, 주문 내역, 룰렛 기록] 메뉴를 넣고, react-router-dom으로 메뉴 클릭 시 해당 페이지로 이동하게 하며, 우측 상단 헤더에는 로그인한 어드민 닉네임과 로그아웃 버튼을 배치해 달라. 디자인은 #E4FF30 하이라이트, 그 외 흰색·검정, 부드러운 UI로.

**결론·구현 요약**

- **AppLayout:** 왼쪽 고정 사이드바(메뉴 5개) + 우측 영역(헤더 + `<Outlet />`). `NavLink`로 활성 메뉴 하이라이트(#E4FF30) 표시.
- **라우팅:** `/`(대시보드), `/budget`, `/products`, `/orders`, `/roulette` 등 메뉴와 1:1 매칭, 인증 필요 시 `/login`으로 리다이렉트.
- **헤더:** `getNickname()`으로 표시, 로그아웃 시 `clearAuth()` 후 `/login`으로 이동.

---

## 3. 로그인 방식 단순화 및 Mock 테스트

<aside>
<strong>질문 의도</strong><br/>
“로그인 ID만으로 로그인”이라는 요구를 통해, 인증 플로우 단순화(비밀번호 제거)와 Mock 데이터로 개발·테스트 환경을 구축하는 능력을 보고자 한 질문입니다.
</aside>

**요청:** 회원가입·로그인 시 로그인 ID만으로 로그인하게 하고, 현재는 Mock으로 ADMINtest 한 개만 만들어 테스트하게 해 달라.

**결론·구현 요약**

- **로그인:** 비밀번호 필드 제거, “로그인 ID” 한 필드만 사용. API 타입은 `LoginRequest { loginId }` → 이후 VoltUpBE 맞춰 `nickname` 기반으로 조정.
- **Mock:** 로그인 ID가 `ADMINtest`일 때만 성공 처리하고 `userId`(및 닉네임) 저장, 그 외는 “등록된 로그인 ID가 아닙니다” 토스트.
- **회원가입:** 명시적 회원가입 화면은 없고, “로그인 ID만으로 로그인”이라는 단순 플로우만 구현.

---

## 4. 대시보드 — 예산 API 연동 및 로딩 UX

<aside>
<strong>질문 의도</strong><br/>
README 예산 API를 실제로 호출해 대시보드에 반영하고, TanStack Query 사용과 로딩 상태(스켈레톤) 처리 같은 실무 패턴을 적용할 수 있는지 확인하려는 질문입니다.
</aside>

**요청:** README 예산 관리 API를 사용해 대시보드 페이지를 구현해 달라. shadcn 스타일 Card로 “오늘 총 지급액”, “잔여 예산”을 큰 글씨로 보여 주고, TanStack Query로 데이터를 가져오며, 로딩 시 스켈레톤 처리해 달라.

**결론·구현 요약**

- **API:** `GET /api/v1/admin/budget` → `BudgetResponse`(totalGranted, remainingBudget 등). 이후 VoltUpBE에 맞춰 `Budget` 타입(budgetDate, totalGranted, remaining)으로 통일.
- **대시보드:** `useBudget()`(useQuery)로 조회, Card 2개(총 지급액, 잔여 예산), 숫자는 천 단위 콤마 포맷.
- **로딩:** 데이터 로딩 중 동일한 카드 레이아웃의 스켈레톤 표시.

---

## 5. 예산 수정 버튼 및 Dialog, 캐시 무효화

<aside>
<strong>질문 의도</strong><br/>
PATCH API 호출, 모달(Dialog) UX, 성공 시 목록/캐시 갱신(invalidateQueries)까지 한 흐름으로 설계하는지 보려는 질문입니다.
</aside>

**요청:** 대시보드 카드 옆 또는 아래에 “예산 수정” 버튼을 두고, 클릭 시 shadcn 스타일 Dialog가 뜨게 해 달라. Dialog 안에는 “새로운 오늘 총 지급액” 입력과 수정 버튼이 있고, 수정 시 PATCH /api/v1/admin/budget을 호출한 뒤, 성공 시 `queryClient.invalidateQueries`로 대시보드 데이터를 새로 고침해 달라.

**결론·구현 요약**

- **UI:** 카드 아래 “예산 수정” 버튼, Dialog(제목·입력·취소/수정 버튼).
- **API:** `patchBudget(totalGranted)` → `PATCH /admin/budget` Body `{ totalGranted }`.
- **성공 시:** `queryClient.invalidateQueries({ queryKey: budgetQueryKey })` 호출 후 Dialog 닫기 및 성공 토스트. 실패 시 에러 메시지 토스트.

---

## 6. 주문 관리 페이지 — 목록·취소·확인 모달

<aside>
<strong>질문 의도</strong><br/>
README “주문 관리” 명세를 그대로 테이블·액션(주문 취소)·확인 모달·useMutation·캐시 무효화까지 연결해 구현할 수 있는지 확인하려는 질문입니다.
</aside>

**요청:** README “관리자 API > 2. 주문” 명세로 주문 내역 페이지를 구현해 달라. GET /api/v1/admin/orders를 useQuery로 가져와 shadcn Table로 [주문 ID, 닉네임, 주문 시간, 상품명, 수량, 관리] 컬럼을 구성하고, 주문 시간은 Intl.DateTimeFormat으로 읽기 쉽게 포맷해 달라. “관리” 컬럼에 “주문 취소” 버튼을 넣고, 클릭 시 확인 모달을 띄운 뒤 확인하면 POST /api/v1/admin/orders/{orderId}/cancel을 useMutation으로 호출하고, 취소 성공 시 queryClient.invalidateQueries로 목록을 갱신하며 성공/실패를 토스트로 알려 달라.

**결론·구현 요약**

- **경로:** 주문 내역 페이지는 `/admin/orders`에 배치(라우트·사이드바 링크 반영).
- **목록:** useQuery로 GET /admin/orders, Table에 주문ID·닉네임·주문시간·상품명·수량·관리(주문 취소 버튼). 주문 시간은 `Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' })` 사용.
- **취소:** “주문 취소” 클릭 → 확인 Dialog → useMutation으로 POST .../cancel 호출 → 성공 시 invalidateQueries + “취소 완료” 토스트, 실패 시 에러 토스트.

---

## 7. VoltUpBE API 문서 기반 타입·Axios·에러 처리

<aside>
<strong>질문 의도</strong><br/>
외부 API 명세(VoltUpBE.md)를 보고 타입 정의, Axios 설정, 에러 코드(C001~C015) 분기까지 체계적으로 설계할 수 있는지 보려는 질문입니다.
</aside>

**요청:** VoltUpBE.md를 기반으로 src/types/api.ts에 Budget, AdminOrder, AdminProduct, RouletteParticipation 등 Response와 맞는 인터페이스를 정의하고, Axios는 baseURL /api/v1, localStorage의 userId를 X-User-Id에 넣는 인터셉터를 적용해 달라. 에러 응답은 { code, message } 형태로 파싱하고, code가 C001~C015일 때 해당 message를 담은 커스텀 에러를 던지도록 설계해 달라.

**결론·구현 요약**

- **types/api.ts:** Budget(budgetDate, totalGranted, remaining), AdminOrder(orderId, userId, nickname, orderedAt, productName, quantity), AdminProduct(id, name, pointPrice, stock), RouletteParticipation(participationId, userId, nickname, participatedAt, grantedPoint), ApiErrorResponse, AuthLoginRequest/Response 등 문서와 동일한 필드로 정의.
- **Axios:** baseURL `/api/v1`(또는 env 연동), 요청 인터셉터에서 getUserId()로 X-User-Id 설정.
- **에러:** 응답 에러 시 data.code가 C001~C015 정규식 매칭이면 `ApiClientError(code, message)` throw. 화면에서는 `instanceof ApiClientError`로 분기해 message를 토스트 등으로 표시.

---

## 8. 상품 관리 — CRUD·폼·검증

<aside>
<strong>질문 의도</strong><br/>
관리자 API “상품” 명세를 CRUD(목록·등록·수정)와 연결하고, Dialog + react-hook-form + zod로 폼 검증까지 구현할 수 있는지 확인하려는 질문입니다.
</aside>

**요청:** README “관리자 API > 3. 상품” 명세로 /admin/products 경로에 상품 관리 페이지를 만들어 달라. shadcn Dialog와 react-hook-form으로 상품 등록/수정 폼(name, pointPrice, stock)을 만들고, 등록은 POST /api/v1/admin/products, 수정은 PUT /api/v1/admin/products/{productId}를 사용하며, 수정 시에는 기존 값이 폼에 채워지게 해 달라. 가격과 재고는 0 이상만 입력 가능하도록 zod 스키마를 적용해 달라.

**결론·구현 요약**

- **페이지:** /admin/products, useQuery로 GET /products 목록, Table(상품 ID, 상품명, 가격, 재고, 관리[수정 버튼]), “상품 등록” 버튼.
- **폼:** Dialog 하나로 등록/수정 공용. react-hook-form + zodResolver, 스키마에서 pointPrice·stock은 `z.coerce.number().min(0)`. 수정 시 선택한 상품으로 폼 reset.
- **API:** getProducts, createProduct(POST /admin/products), updateProduct(PUT /admin/products/{productId}). 성공 시 invalidateQueries 및 토스트.

---

## 9. 룰렛 기록 페이지 및 C015 특수 에러 처리

<aside>
<strong>질문 의도</strong><br/>
“관리자 API > 4. 룰렛” 명세 구현과, 특정 에러 코드(C015)에 대해 다른 메시지를 보여주는 예외 처리 설계를 함께 보려는 질문입니다.
</aside>

**요청:** README “관리자 API > 4. 룰렛” 명세로 /admin/roulette/participations에 룰렛 로그 페이지를 만들어 달라. “참여 취소” 버튼 클릭 시 POST /api/v1/admin/roulette/{participationId}/cancel을 호출하고, 에러 코드 C015(회수할 포인트 부족)가 반환되면 일반 에러 메시지 대신 “해당 유저의 잔액이 부족하여 지급된 포인트를 회수할 수 없습니다”라는 특수 경고를 띄워 달라.

**결론·구현 요약**

- **페이지:** GET /admin/roulette/participations로 목록 조회, Table(참여 ID, 유저 ID, 닉네임, 참여 시간, 지급 포인트, 관리[참여 취소]). 확인 Dialog 후 useMutation으로 cancel 호출.
- **C015 처리:** onError에서 `err instanceof ApiClientError && err.code === 'C015'`이면 고정 문구(“해당 유저의 잔액이 부족하여…”)로 토스트, 그 외는 err.message 또는 기본 메시지.

---

## 10. 기능 점검·모바일 대응·폰트

<aside>
<strong>질문 의도</strong><br/>
지금까지 구현한 API·기능이 빠진 곳이 없는지 점검하고, 모바일에서도 동일하게 쓰일 수 있게 반응형과 터치 영역을 요청한 뒤, 마지막으로 전체 폰트를 특정 폰트(Nanum Gothic Coding)로 통일해 보려는 의도입니다.
</aside>

**요청:** 지금까지의 API를 기준으로 (로그인, 일일 예산 조회/설정, 상품 CRUD, 주문 취소, 룰렛 참여 취소) 빠진 부분이 있으면 추가하고, 전체 UI가 모바일에서도 동일하게 적용되도록 해 달라. 전체 폰트는 구글 폰트 중 Nanum Gothic Coding으로 맞춰 달라.

**결론·구현 요약**

- **빠진 부분:** 예산 관리 전용 페이지(/budget)가 플레이스홀더만 있던 것을, 대시보드와 동일한 예산 카드·수정 Dialog를 쓰는 BudgetSummary 컴포넌트로 연동해 실제 조회/설정 가능하도록 보완.
- **모바일:** AppLayout은 md 미만에서 사이드바를 숨기고 햄버거 메뉴 + 드로어로 전환. 테이블은 가로 스크롤, Dialog는 모바일에서 하단 시트 형태. 버튼·링크에 min-h-[44px] 등 터치 영역 확보.
- **폰트:** index.html에 Nanum Gothic Coding 로드, tailwind fontFamily.sans 및 :root font-family에 적용. (이후 Pretendard로 변경됨.)

---

## 11. 예산 문구·역할 분리·토스 스타일 UI

<aside>
<strong>질문 의도</strong><br/>
예산 수정의 의미를 “오늘의 전체 예산”으로 명확히 하고, “받아간 지급액”보다 작게 설정하는 것을 막는 검증과, 대시보드(간략 정보)와 예산 관리(실제 수정) 역할을 나누는 설계를 요청한 뒤, 한국 서비스(토스)처럼 깔끔한 UI로 정리해 보려는 의도입니다.
</aside>

**요청:** (1) 대시보드 예산 수정 버튼은 “오늘의 전체 예산”을 수정하는 것이고, “오늘 총 지급액”이 아니라 “오늘 사용자가 받아간 지급액”이라고 표시해 달라. 잔여 예산은 그대로 두고, 예산 수정 시 “오늘 사용자가 받아간 지급액”보다 적게 넣으면 토스트로 불가 안내해 달라. (2) 예산 관리 페이지와 대시보드는 동일 기능처럼 보이므로, 대시보드는 간략 정보만 보여 주고 예산 수정은 예산 관리 페이지에서만 하게 해 달라. (3) 현재 색상은 유지하되, 토스처럼 깔끔하고 예쁜 한국형 UI로 맞춰 달라.

**결론·구현 요약**

- **라벨·검증:** 첫 번째 카드 라벨을 “오늘 사용자가 받아간 지급액”으로 변경. 수정 Dialog는 “오늘의 전체 예산 수정”, 입력값이 현재 totalGranted 미만이면 토스트 “오늘 사용자가 받아간 지급액보다 적게 설정할 수 없습니다.” 후 전송 불가.
- **역할 분리:** BudgetSummary에 `showEditButton` prop 추가. 대시보드는 `showEditButton={false}`(카드만), 예산 관리 페이지는 `showEditButton={true}`(카드 + 예산 수정 버튼 + Dialog).
- **UI:** 배경 gray-50, 카드/테이블 흰 배경·gray-100 테두리·shadow-card, 버튼 btn-primary/secondary/ghost, 입력 input-base, 섹션 제목 section-title 등 토스 스타일 유틸리티 적용. Typography·여백·라운드 정리.

---

## 12. 폰트·브랜드 문구 변경

<aside>
<strong>질문 의도</strong><br/>
전체 서비스 톤을 한글 가독성에 맞는 Pretendard로 통일하고, 브랜드 노출을 “VoltUp Admin”으로 통일해 달라는 단순하지만 일관성 있는 변경 요청입니다.
</aside>

**요청:** 글씨체를 전체적으로 Pretendard로 바꿔 달라. “볼트업 어드민”이라는 글씨는 “VoltUp Admin”으로 변경해 달라.

**결론·구현 요약**

- **Pretendard:** index.html에서 Nanum Gothic Coding 링크 제거, Pretendard CDN(jsDelivr) 스타일시트 추가. index.css :root와 tailwind.config.js fontFamily.sans를 "Pretendard" 및 시스템 폰트 fallback으로 설정.
- **브랜드:** index.html `<title>`, AppLayout 사이드바/드로어 로고, Login 페이지 카드 제목을 “VoltUp Admin”으로 통일.

---

