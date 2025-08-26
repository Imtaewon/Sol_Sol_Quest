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

export interface QuestListRequest {
  type?: 'life' | 'growth' | 'surprise';
  category?: 'STUDY' | 'HEALTH' | 'ECON' | 'LIFE' | 'ENT' | 'SAVING';
  page?: number;
  limit?: number;
}

export interface QuestStartRequest {
  quest_id: string;
}

export interface QuestSubmitRequest {
  quest_id: string;
  proof_url?: string;
}

export interface QuestVerifyRequest {
  quest_id: string;
  verify_data: any; // GPS, STEPS, PAYMENT 등 인증 데이터
}

export const questApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 퀘스트 목록 조회
    getQuests: builder.query<PaginatedResponse<QuestWithAttempt>, QuestListRequest>({
      query: (params) => ({
        url: '/quests',
        method: 'GET',
        params,
      }),
    }),

    // 퀘스트 상세 조회
    getQuestDetail: builder.query<QuestWithAttempt, string>({
      query: (questId) => ({
        url: `/quests/${questId}`,
        method: 'GET',
      }),
    }),

    // 퀘스트 시작
    startQuest: builder.mutation<ApiResponse<QuestAttempt>, QuestStartRequest>({
      query: (data) => ({
        url: '/quests/start',
        method: 'POST',
        data,
      }),
    }),

    // 퀘스트 제출
    submitQuest: builder.mutation<ApiResponse<QuestAttempt>, QuestSubmitRequest>({
      query: (data) => ({
        url: '/quests/submit',
        method: 'POST',
        data,
      }),
    }),

    // 퀘스트 인증 (GPS, STEPS, PAYMENT 등)
    verifyQuest: builder.mutation<ApiResponse<QuestAttempt>, QuestVerifyRequest>({
      query: (data) => ({
        url: '/quests/verify',
        method: 'POST',
        data,
      }),
    }),

    // 내 퀘스트 진행 상황
    getMyQuestProgress: builder.query<QuestProgress[], void>({
      query: () => ({
        url: '/quests/my-progress',
        method: 'GET',
      }),
    }),

    // 추천 퀘스트 조회
    getRecommendedQuests: builder.query<QuestWithAttempt[], void>({
      query: () => ({
        url: '/quests/recommended',
        method: 'GET',
      }),
    }),

    // 퀘스트 추천 클릭 로그
    logQuestClick: builder.mutation<void, { quest_id: string; context?: string }>({
      query: (data) => ({
        url: '/quests/log-click',
        method: 'POST',
        data,
      }),
    }),

    // 퀘스트 상호작용 로그
    logQuestInteraction: builder.mutation<void, {
      quest_id: string;
      event: 'impression' | 'detail_click' | 'start' | 'complete';
      context?: string;
    }>({
      query: (data) => ({
        url: '/quests/log-interaction',
        method: 'POST',
        data,
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
  useGetMyQuestProgressQuery,
  useGetRecommendedQuestsQuery,
  useLogQuestClickMutation,
  useLogQuestInteractionMutation,
} = questApi;

