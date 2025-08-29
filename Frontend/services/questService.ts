import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 퀘스트 인증 파라미터 타입 정의
export interface QuestVerifyParams {
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

// 백엔드 QuestListItem 구조에 맞춘 퀘스트 타입
export interface QuestListItem {
  id: string;
  type: 'LIFE' | 'GROWTH' | 'SURPRISE'; // 백엔드 QuestTypeEnum과 정확히 일치
  title: string;
  verify_method: 'GPS' | 'STEPS' | 'LINK' | 'UPLOAD' | 'PAYMENT' | 'ATTENDANCE' | 'CERTIFICATION' | 'CONTEST' | 'QUIZ';
  category: 'STUDY' | 'HEALTH' | 'ECON' | 'LIFE' | 'ENT' | 'SAVING'; // 백엔드 QuestCategoryEnum과 정확히 일치
  verify_params: QuestVerifyParams;
  reward_exp: number;
  target_count: number;
  period_scope: 'ANY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'; // 백엔드 PeriodScopeEnum과 정확히 일치
  active: boolean;
  created_at?: string;
  lat?: number;
  lng?: number;
  link_url?: string; // 백엔드와 일치하도록 link_url로 변경
  
  // 사용자 진행 상태
  attempt_id?: string;
  user_status: 'DEACTIVE' | 'IN_PROGRESS' | 'CLEAR' | 'SUBMITTED' | 'APPROVED'; // 백엔드 QuestAttemptStatusEnum과 정확히 일치
  progress_count: number;
  user_target_count: number;
  started_at?: string;
  submitted_at?: string;
  approved_at?: string;
}

// 프론트엔드에서 사용할 퀘스트 타입 (기존 호환성 유지)
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'daily' | 'surprise';
  expReward: number;
  progress?: number;
  maxProgress?: number;
  isCompleted?: boolean;
  isClaimed?: boolean;
  link_url?: string; // 백엔드와 일치하도록 추가
  user_status?: string; // 원본 상태 정보
}

// 퀘스트 목록 응답 타입
export interface QuestListResponse {
  quests: QuestListItem[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// 새로운 추천 퀘스트 응답 타입
export interface RecommendedQuestsResponse {
  quest_ids: string[];
  message: string;
}

// 기존 추천 퀘스트 타입 (호환성을 위해 유지)
export interface RecommendedQuest {
  id: string; // 백엔드와 일치하도록 string으로 변경
  title: string;
  progress: number;
  maxProgress: number;
  expReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// 퀘스트 진행 내역 타입
export interface QuestHistory {
  id: string; // 백엔드와 일치하도록 string으로 변경
  title: string;
  category: 'growth' | 'daily' | 'surprise';
  progress: number;
  maxProgress: number;
  expReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// 퀘스트 완료 요청 타입 (백엔드 API에 맞춰 수정)
export interface ClaimQuestRequest {
  questId: string; // 백엔드와 일치하도록 string으로 변경
}

// 퀘스트 서비스
export const questService = {
  // 추천 퀘스트 조회 (새로운 응답 형식)
  getRecommendedQuests: async (): Promise<RecommendedQuestsResponse> => {
    console.log('🌐 questService.getRecommendedQuests HTTP 요청 시작');
    try {
      const response = await apiClient.get<RecommendedQuestsResponse>('/api/v1/recommendations/quests/ids-only');
      console.log('🌐 questService.getRecommendedQuests HTTP 요청 완료:', response.status);
      console.log('🌐 questService.getRecommendedQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: unknown) {
      console.error('🌐 questService.getRecommendedQuests 에러:', error);
      if (error instanceof Error) {
        throw new Error(`추천 퀘스트 조회 실패: ${error.message}`);
      }
      throw new Error('추천 퀘스트 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  },

  // 전체 퀘스트 목록 조회 (하나의 API로 모든 퀘스트 가져오기)
  getAllQuests: async (): Promise<QuestListResponse> => {
    console.log('🌐 questService.getAllQuests HTTP 요청 시작');
    console.log('🌐 questService.getAllQuests 요청 URL:', '/api/v1/quests');
    try {
      const response = await apiClient.get<QuestListResponse>('/api/v1/quests');
      console.log('🌐 questService.getAllQuests HTTP 요청 완료:', response.status);
      console.log('🌐 questService.getAllQuests 응답 헤더:', response.headers);
      console.log('🌐 questService.getAllQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      
      // API 응답 구조에 맞게 수정
      if (response.data?.quests) {
        console.log('🌐 questService.getAllQuests 퀘스트 개수:', response.data.quests.length);
        console.log('🌐 questService.getAllQuests 첫 번째 퀘스트:', response.data.quests[0]);
      } else {
        console.log('🌐 questService.getAllQuests 퀘스트 데이터 없음');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('🌐 questService.getAllQuests 에러:', error);
      console.error('🌐 questService.getAllQuests 에러 메시지:', error.message);
      console.error('🌐 questService.getAllQuests 에러 응답:', error.response?.data);
      console.error('🌐 questService.getAllQuests 에러 상태:', error.response?.status);
      throw error;
    }
  },

  // 퀘스트 완료 (백엔드 API에 맞춰 수정)
  claimQuest: async (data: ClaimQuestRequest): Promise<ApiResponse> => {
    console.log('🌐 questService.claimQuest HTTP 요청 시작:', data);
    try {
      const response = await apiClient.post<ApiResponse>(`/api/v1/quests/${data.questId}/complete`);
      console.log('🌐 questService.claimQuest HTTP 요청 완료:', response.status);
      console.log('🌐 questService.claimQuest 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: unknown) {
      console.error('🌐 questService.claimQuest 에러:', error);
      if (error instanceof Error) {
        throw new Error(`퀘스트 완료 실패: ${error.message}`);
      }
      throw new Error('퀘스트 완료 중 알 수 없는 오류가 발생했습니다.');
    }
  },
};

// 퀘스트 카테고리별 분류 함수
export const categorizeQuests = (quests: QuestListItem[]) => {
  console.log('📊 categorizeQuests 시작 - 전체 퀘스트 개수:', quests.length);
  
  if (quests.length === 0) {
    console.log('📊 categorizeQuests - 퀘스트가 없음');
    return {
      growth: [],
      daily: [],
      surprise: []
    };
  }
  
  // 각 퀘스트의 type 필드 확인
  quests.forEach((quest, index) => {
    console.log(`📊 퀘스트 ${index + 1}:`, {
      id: quest.id,
      title: quest.title,
      type: quest.type,
      category: quest.category,
      typeCheck: {
        isGROWTH: quest.type === 'GROWTH',
        isLIFE: quest.type === 'LIFE',
        isSURPRISE: quest.type === 'SURPRISE'
      }
    });
  });
  
  const categorized = {
    growth: quests.filter(quest => quest.type === 'GROWTH'),
    daily: quests.filter(quest => quest.type === 'LIFE'), // 백엔드의 'LIFE'를 프론트의 'daily'로 매핑
    surprise: quests.filter(quest => quest.type === 'SURPRISE')
  };
  
  console.log('📊 퀘스트 카테고리별 분류 결과:', {
    growth: categorized.growth.length,
    daily: categorized.daily.length,
    surprise: categorized.surprise.length,
    total: quests.length
  });
  
  // 각 카테고리의 첫 번째 퀘스트 확인
  if (categorized.growth.length > 0) {
    console.log('📊 GROWTH 퀘스트 예시:', categorized.growth[0]);
  }
  if (categorized.daily.length > 0) {
    console.log('📊 LIFE 퀘스트 예시:', categorized.daily[0]);
  }
  if (categorized.surprise.length > 0) {
    console.log('📊 SURPRISE 퀘스트 예시:', categorized.surprise[0]);
  }
  
  return categorized;
};

// 백엔드 QuestListItem을 프론트엔드 Quest로 변환하는 함수
export const convertQuestListItemToQuest = (questItem: QuestListItem): Quest => {
  // 진행률 계산
  const progress = questItem.progress_count || 0;
  const maxProgress = questItem.user_target_count || 1;
  const progressPercent = maxProgress > 0 ? Math.min((progress / maxProgress) * 100, 100) : 0;
  
  // 완료 상태 판단 (CLEAR 또는 APPROVED 상태면 완료)
  const isCompleted = questItem.user_status === 'APPROVED' || questItem.user_status === 'CLEAR';
  const isClaimed = questItem.user_status === 'APPROVED';
  
  console.log('🔄 convertQuestListItemToQuest 변환 결과:', {
    id: questItem.id,
    title: questItem.title,
    progress,
    maxProgress,
    progressPercent,
    user_status: questItem.user_status,
    isCompleted,
    isClaimed
  });
  
  return {
    id: questItem.id,
    title: questItem.title,
    description: questItem.title, // 백엔드에 description 필드가 없으므로 title 사용
    category: questItem.type === 'LIFE' ? 'daily' : 
              questItem.type === 'GROWTH' ? 'growth' : 'surprise', // 백엔드 enum을 프론트엔드 카테고리로 매핑
    expReward: questItem.reward_exp,
    progress,
    maxProgress,
    isCompleted,
    isClaimed,
    link_url: questItem.link_url, // 백엔드 link_url 필드 매핑
    user_status: questItem.user_status // 원본 상태 정보도 포함
  };
};
