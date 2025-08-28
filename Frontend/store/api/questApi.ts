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
  type?: 'life' | 'growth' | 'surprise';  // 퀘스트 타입 필터
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
 * 퀘스트 인증 요청 인터페이스
 */
export interface QuestVerifyRequest {
  quest_id: string;  // 퀘스트 ID
  verify_data: any;  // GPS, STEPS, PAYMENT 등 인증 데이터
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




  }),
});

export const {
  useGetQuestsQuery,
} = questApi;

