/**
 * database.ts
 * 
 * 데이터베이스 ERD 기반 TypeScript 타입 정의
 * 
 * 주요 기능:
 * - 백엔드 데이터베이스 스키마와 일치하는 타입 정의
 * - 프론트엔드에서 사용하는 모든 데이터 구조 정의
 * - API 요청/응답 타입 정의
 * 
 * 포함된 타입들:
 * - Identity: 회원·학교 관련 타입 (School, User, SchoolLeaderboard)
 * - Onboarding: 가입 설문 관련 타입 (SurveyQuestion, SurveyAnswer)
 * - Gamification: 티어·경험치 관련 타입 (Tier, UserStats)
 * - Quests: 퀘스트 관련 타입 (Quest, QuestAttempt, QuestRecommendation)
 * - Accounts: 계좌 관련 타입 (SavingAccount, DepositAccount)
 * - Payments: 결제 관련 타입 (Payment, PaymentHistory)
 * - Attendance: 출석 관련 타입 (Attendance)
 * 
 * 특징:
 * - ULID 기반 고유 식별자 사용
 * - 엄격한 타입 체크를 통한 타입 안전성 보장
 * - 백엔드 API와 완전한 호환성
 */

// ERD 기반 데이터베이스 타입 정의

// 1) Identity (회원·학교)
export interface School {
  id: string; // ULID
  code: string; // 대학 코드
  name: string; // 대학명
}

export interface SchoolLeaderboard {
  id: string; // ULID
  school_id: string;
  savings_students: number; // 적금 가입자 수
  total_exp: number; // 누적 경험치 합
  avg_exp: number; // 평균 경험치
  rank_overall: number; // 종합 랭킹
  rank_avg: number; // 평균 랭킹
}

export interface User {
  id: string; // ULID
  login_id: string; // 로그인 아이디
  password: string; // 비밀번호 해시
  email: string; // 이메일
  real_name: string; // 이름
  gender: 'M' | 'F' | 'X'; // 성별
  birth_year: number; // 출생연도
  school_id: string; // 소속 학교
  department: string; // 학과
  grade: number; // 학년
  role: 'GUEST' | 'MEMBER' | 'ADMIN'; // 백엔드 UserRoleEnum과 정확히 일치
  created_at: string; // 가입 시각
  updated_at: string; // 수정 시각
}

// 2) Onboarding (가입 설문)
export interface SurveyQuestion {
  id: string; // ULID
  order_no: number; // 문항 순서
  question: string; // 질문
  question_type: number; // 카테고리 번호
}

export interface SurveyAnswer {
  id: string; // ULID
  user_id: string; // 응답자
  question_id: string; // 문항
  question_type: number; // 문항 당시의 카테고리
  option_id?: string; // 선택지 식별자
}

// 3) Gamification (티어·경험치)
export interface Tier {
  name: 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'SOL'; // 백엔드 TierNameEnum과 정확히 일치
  required_exp: number; // 진입 최소 누적 EXP
  interest_rate: number; // 우대금리(%)
}

export interface UserStats {
  user_id: string; // PK, FK→users.id
  total_exp: number; // 누적 경험치
  current_tier: 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'SOL'; // 백엔드 TierNameEnum과 정확히 일치
  updated_at: string; // 갱신 시각
}

// 4) Quests (정의 → 진행/완료)
export interface Quest {
  id: string; // ULID
  type: 'LIFE' | 'GROWTH' | 'SURPRISE'; // 백엔드 QuestTypeEnum과 정확히 일치
  title: string; // 제목
  category: 'STUDY' | 'HEALTH' | 'ECON' | 'LIFE' | 'ENT' | 'SAVING'; // 백엔드 QuestCategoryEnum과 정확히 일치
  verify_method: 'GPS' | 'STEPS' | 'LINK' | 'UPLOAD' | 'PAYMENT' | 'ATTENDANCE' | 'CERTIFICATION' | 'CONTEST' | 'QUIZ'; // 백엔드 QuestVerifyMethodEnum과 정확히 일치
  verify_params: string; // 인증 파라미터(JSON)
  reward_exp: number; // 보상 EXP
  target_count: number; // 누적형 목표
  period_scope: 'ANY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'; // 백엔드 PeriodScopeEnum과 정확히 일치
  active: boolean; // 노출 여부
  lat?: number; // GPS 미션용 좌표
  lng?: number; // GPS 미션용 좌표
}

export interface QuestAttempt {
  id: string; // ULID
  quest_id: string; // FK→quests.id
  user_id: string; // FK→users.id
  status: 'DEACTIVE' | 'IN_PROGRESS' | 'CLEAR' | 'SUBMITTED' | 'APPROVED'; // 백엔드 QuestAttemptStatusEnum과 정확히 일치
  progress_count: number; // 진행 누적
  target_count: number; // 시도 시작 시점의 목표
  proof_url?: string; // 증빙 URL
  period_scope: 'ANY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'; // 백엔드 PeriodScopeEnum과 정확히 일치
  period_key: string; // 스코프 키
  started_at: string; // 시작 시각
  submitted_at?: string; // 제출 시각
  approved_at?: string; // 승인 시각
}

// 5) Recommendations (추천·행동로그)
export interface QuestRecommendation {
  id: string; // ULID
  user_id: string; // FK→users.id
  quest_id: string; // FK→quests.id
  recommendation_date: string; // 추천일
  is_click: boolean; // 당일 클릭 여부
  is_cleared: boolean; // 기한 내 완료/보상 수락 여부
}

export interface QuestRecoInteraction {
  id: string; // ULID
  user_id: string; // FK→users.id
  quest_id: string; // FK→quests.id
  event: 'impression' | 'detail_click' | 'start' | 'complete'; // 이벤트 종류
  context: string; // 메타(슬롯/AB버전 등)
  created_at: string; // 기록 시각
}

// 6) Commerce (결제·가맹점)
export interface Merchant {
  id: string; // ULID
  store_name: string; // 가게명
  category: string; // 카테고리
  url: string; // 매장/주문 페이지 URL
}

export interface Payment {
  id: string; // ULID
  user_id: string; // FK→users.id
  merchant_id: string; // FK→merchants.id
  amount: number; // 결제 금액
  status: 'pending' | 'success'; // 상태
  created_at: string; // 결제 시각
}

// 7) Accounts (계좌·이체·원장)
export interface DemandDepositAccount {
  id: string; // ULID
  user_id: string; // FK→users.id
  account_no: string; // 계좌번호
  balance: number; // 잔액
  opened_at: string; // 개설 시각
  closed_at?: string; // 해지 시각
}

export interface InstallmentSavingsAccount {
  id: string; // ULID
  user_id: string; // FK→users.id
  product_code: string; // 상품 코드
  linked_dd_account_id: string; // 연결(자동이체 원천)
  term_months: number; // 기간(개월)
  monthly_amount: number; // 자동이체 금액
  interest_rate: number; // 약정 금리
  opened_at: string; // 가입 시각
  maturity_date: string; // 만기일
  status: 'active' | 'matured' | 'closed'; // 상태
}

export interface Transfer {
  id: string; // ULID
  from_dd_account_id: string; // FK→demand_deposit_accounts.id
  to_savings_account_id: string; // FK→installment_savings_accounts.id
  amount: number; // 금액
  status: 'REQUESTED' | 'SUCCESS' | 'FAILED'; // 백엔드 TransferStatusEnum과 정확히 일치
  created_at: string; // 시각
}

export interface AccountTransaction {
  id: string; // ULID
  account_type: 'DEMAND' | 'SAVINGS'; // 백엔드 AccountTypeEnum과 정확히 일치
  account_id: string; // 대상 계좌 id
  direction: 'CREDIT' | 'DEBIT'; // 백엔드 TransactionDirectionEnum과 정확히 일치
  amount: number; // 금액
  balance_after?: number; // 거래 후 잔액
  related_payment_id?: string; // 결제 연계 시 payments.id
  memo?: string; // 비고
  created_at: string; // 시각
}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 인증 관련 타입
export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  login_id: string;
  password: string;
  email: string;
  real_name: string;
  gender: 'M' | 'F' | 'X';
  birth_year: number;
  school_id: string;
  department: string;
  grade: number;
}

// 퀘스트 관련 타입
export interface QuestWithAttempt extends Quest {
  attempt?: QuestAttempt;
  is_recommended?: boolean;
  is_clicked?: boolean;
}

export interface QuestProgress {
  quest_id: string;
  progress_count: number;
  target_count: number;
  percentage: number;
  status: QuestAttempt['status'];
}

// 계좌 관련 타입
export interface AccountSummary {
  demand_deposit?: DemandDepositAccount;
  savings?: InstallmentSavingsAccount;
  total_balance: number;
  monthly_savings: number;
}

// 리더보드 관련 타입
export interface LeaderboardEntry {
  rank: number;
  school: School;
  total_exp: number;
  avg_exp: number;
  savings_students: number;
  is_my_school: boolean;
}
