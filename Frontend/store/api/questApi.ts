/**
 * questApi.ts
 * 
 * 퀘스트 관련 API 엔드포인트 정의
 * 
 * 주요 기능:
 * - 퀘스트 목록 조회
 * - 퀘스트 상세 조회
 * - 퀘스트 시작/제출/인증
 * - 퀘스트 진행 상황 조회
 * - 추천 퀘스트 조회
 * - 퀘스트 상호작용 로그
 * 
 * 사용 기술:
 * - RTK Query를 사용한 API 상태 관리
 * - 자동 캐싱 및 리페치 기능
 * - 로딩/에러 상태 자동 관리
 */

import { baseApi } from './baseApi';
import { 
  Quest, 
  QuestAttempt, 
  QuestWithAttempt, 
  QuestRecommendation,
  QuestProgress,
  ApiResponse,
  PaginatedResponse 
} from '../../types/database';

/**
 * 퀘스트 목록 조회 요청 인터페이스
 */
export interface QuestListRequest {
  type?: 'LIFE' | 'GROWTH' | 'SURPRISE';  // 퀘스트 타입 필터 (대문자로 통일)
  category?: 'STUDY' | 'HEALTH' | 'ECON' | 'LIFE' | 'ENT' | 'SAVING';  // 카테고리 필터
  page?: number;  // 페이지 번호
  limit?: number;  // 페이지당 항목 수
}

/**
 * 퀘스트 시작 요청 인터페이스
 */
export interface QuestStartRequest {
  quest_id: string;  // 퀘스트 ID
}

/**
 * 퀘스트 제출 요청 인터페이스
 */
export interface QuestSubmitRequest {
  quest_id: string;  // 퀘스트 ID
  proof_url?: string;  // 증빙 자료 URL (선택사항)
}

/**
 * 퀘스트 인증 데이터 타입
 */
export interface QuestVerifyData {
  // GPS 인증
  latitude?: number;
  longitude?: number;
  radius?: number;
  
  // 스텝 카운터 인증
  steps?: number;
  target_steps?: number;
  
  // 결제 인증
  payment_amount?: number;
  merchant_id?: string;
  
  // 링크 인증
  url?: string;
  
  // 업로드 인증
  file_url?: string;
  
  // 출석 인증
  attendance_date?: string;
  
  // 인증서 인증
  certificate_url?: string;
  
  // 대회 인증
  contest_result?: string;
  
  // 퀴즈 인증
  quiz_answers?: string[];
  correct_count?: number;
}

/**
 * 퀘스트 인증 요청 인터페이스
 */
export interface QuestVerifyRequest {
  quest_id: string;  // 퀘스트 ID
  verify_data: QuestVerifyData;  // 구체적인 인증 데이터 타입
}

/**
 * 퀘스트 완료 응답 인터페이스
 */
export interface QuestCompleteResponse {
  success: boolean;
  data: {
    quest_id: string;
    completed: boolean;
    reward_exp: number;
    new_total_exp: number;
    new_tier?: string;
  };
  message?: string;
}

/**
 * 퀘스트 API 엔드포인트 정의
 * RTK Query를 사용하여 퀘스트 관련 API 호출을 관리
 */
export const questApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /**
     * 퀘스트 목록 조회
     * GET /quests
     * 타입, 카테고리, 페이지네이션 파라미터로 필터링된 퀘스트 목록 반환
     */
    getQuests: builder.query<PaginatedResponse<QuestWithAttempt>, QuestListRequest>({
      query: (params) => ({
        url: '/quests',
        method: 'GET',
        params,
      }),
    }),

    /**
     * 퀘스트 상세 조회
     * GET /quests/{questId}
     * 특정 퀘스트의 상세 정보와 사용자의 진행 상황 반환
     */
    getQuestDetail: builder.query<QuestWithAttempt, string>({
      query: (questId) => ({
        url: `/quests/${questId}`,
        method: 'GET',
      }),
    }),

    /**
     * 퀘스트 시작
     * POST /quests/{questId}/start
     * 퀘스트를 시작하고 QuestAttempt 레코드 생성
     */
    startQuest: builder.mutation<ApiResponse<QuestAttempt>, QuestStartRequest>({
      query: ({ quest_id }) => ({
        url: `/quests/${quest_id}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Quest'],
    }),

    /**
     * 퀘스트 제출
     * POST /quests/{questId}/submit
     * 퀘스트를 제출하고 증빙 자료 업로드
     */
    submitQuest: builder.mutation<ApiResponse<QuestAttempt>, QuestSubmitRequest>({
      query: ({ quest_id, proof_url }) => ({
        url: `/quests/${quest_id}/submit`,
        method: 'POST',
        body: { proof_url },
      }),
      invalidatesTags: ['Quest'],
    }),

    /**
     * 퀘스트 인증
     * POST /quests/{questId}/verify
     * 퀘스트 인증 데이터를 제출하여 완료 처리
     */
    verifyQuest: builder.mutation<QuestCompleteResponse, QuestVerifyRequest>({
      query: ({ quest_id, verify_data }) => ({
        url: `/quests/${quest_id}/verify`,
        method: 'POST',
        body: { verify_data },
      }),
      invalidatesTags: ['Quest'],
    }),

    /**
     * 퀘스트 진행 상황 조회
     * GET /quests/progress
     * 사용자의 모든 퀘스트 진행 상황 반환
     */
    getQuestProgress: builder.query<QuestProgress[], void>({
      query: () => ({
        url: '/quests/progress',
        method: 'GET',
      }),
    }),

    /**
     * 추천 퀘스트 조회
     * GET /quests/recommendations
     * 사용자 맞춤 추천 퀘스트 목록 반환
     */
    getQuestRecommendations: builder.query<QuestRecommendation[], void>({
      query: () => ({
        url: '/quests/recommendations',
        method: 'GET',
      }),
    }),

    /**
     * 퀘스트 상호작용 로그
     * POST /quests/{questId}/interaction
     * 퀘스트 관련 사용자 상호작용 기록
     */
    logQuestInteraction: builder.mutation<ApiResponse<void>, {
      quest_id: string;
      event: 'impression' | 'detail_click' | 'start' | 'complete';
      context?: string;
    }>({
      query: ({ quest_id, event, context }) => ({
        url: `/quests/${quest_id}/interaction`,
        method: 'POST',
        body: { event, context },
      }),
    }),
  }),
});

export const {
  useGetQuestsQuery,
  useGetQuestDetailQuery,
  useStartQuestMutation,
  useSubmitQuestMutation,
  useVerifyQuestMutation,
  useGetQuestProgressQuery,
  useGetQuestRecommendationsQuery,
  useLogQuestInteractionMutation,
} = questApi;

