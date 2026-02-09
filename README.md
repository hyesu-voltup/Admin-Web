# 볼트업 웹 어드민 (React)

## Tech Stack
- Framwork: React 18+ (Vite)
- Language: TypeScript
- UI Library: shadcn/ui, Tailwind CSS
- Http Client: Axios

## Project Structure & Rules
- `src/api`: 모든 API 호출 함수를 정의합니다.
- `src/components/ui`: shadcn/ui 컴포넌트 위치
- `src/hooks`: 공통 비즈니스 로직 및 TanStack query 커스텀 hook
- `src/pages/`: 화면 단위 컴포넌트
- 이름 컨벤션: PascalCase for Components, CamelCase for Func/Variables

## 🚀 Admin Core Features & API Specification

### 1. Authentication & Permission
- **Login:** `POST /api/v1/auth/login` (Admin ID must start with `ADMIN`)
- **Header:** Every request must include `X-User-Id: {userId}`
- **Base URL:** `{BASE_URL}/api/v1`

### 2. Dashboard & Budget (예산 관리)
- **Feature:** 오늘 예산 현황(누적 지급액, 잔여 예산) 조회 및 강제 수정
- **API:**
  - `GET /admin/budget`: 오늘 예산 조회
  - `PATCH /admin/budget`: 오늘 예산 강제 설정 (Body: `{ "totalGranted": number }`)

### 3. Product Management (상품 관리)
- **Feature:** 상품 CRUD (등록, 수정, 목록 조회)
- **API:**
  - `GET /products`: 전체 상품 목록 조회
  - `POST /admin/products`: 새 상품 등록 (Body: `{ name, pointPrice, stock }`)
  - `PUT /admin/products/{productId}`: 상품 정보 수정

### 4. Order History (주문 관리)
- **Feature:** 전체 서비스 주문 내역 모니터링 및 주문 취소(포인트 환불/재고 복구)
- **API:**
  - `GET /admin/orders`: 전체 주문 목록 조회
  - `POST /admin/orders/{orderId}/cancel`: 특정 주문 취소 처리

### 5. Roulette Management (룰렛 관리)
- **Feature:** 룰렛 참여 로그 확인 및 부정한 참여 취소(포인트 회수)
- **API:**
  - `GET /admin/roulette/participations`: 전체 참여 기록 조회
  - `POST /admin/roulette/{participationId}/cancel`: 참여 취소 및 포인트 회수

### ⚠️ Common Error Handling
- 모든 에러는 아래 형식을 따르며, UI 상에서 `message`를 Toast로 표시함
- Format: `{ "code": string, "message": string }`

## Important Implementation
- 기능 동작 및 데이터 무결성에 집중할 것
- 모든 API 응답 처리는 TypeScript 인터페이스를 먼저 정의한 후 사용할 것
- `shadcn/ui`의 Table과 From 컴포넌트를 우선적으로 활용할 것
- 에러 핸들링은 사용자에게 명확한 토스트 메시지를 보여줄 것


