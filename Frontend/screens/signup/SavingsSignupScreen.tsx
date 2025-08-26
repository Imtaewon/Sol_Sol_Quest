import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormTextInput } from '../../components/common/FormTextInput';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { RootState } from '../../store';

type SavingsSignupScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SavingsSignup'>;

// 설문조사 문제 데이터
const SURVEY_QUESTIONS = [
  {
    id: 1,
    category: '학업/취업/알바',
    question: '평일 주 활동 패턴을 고르세요.',
    options: [
      '캠퍼스/강의 위주',
      '자격·시험 준비 위주',
      '직장/알바 위주',
      '일정이 불규칙/그 외'
    ]
  },
  {
    id: 2,
    category: '학업/취업/알바',
    question: '월 고정 수입/용돈 수준을 고르세요.',
    options: [
      '없음',
      '20만원 이하',
      '21–50만원',
      '51–100만원',
      '101–200만원',
      '200만원 이상'
    ]
  },
  {
    id: 3,
    category: '건강/생활',
    question: '지난 한 달 소비 습관에 가장 가까운 것은?',
    options: [
      '계획 소비 위주',
      '할인·쿠폰을 자주 활용',
      '필요 위주 최소 지출',
      '즉흥적/경험 소비 선호',
      '지출 기록/가계부 습관'
    ]
  },
  {
    id: 4,
    category: '건강/생활',
    question: '한 주 중 가장 여유로운 시간대는?',
    options: [
      '평일 낮',
      '평일 저녁',
      '주말 낮',
      '주말 저녁'
    ]
  },
  {
    id: 5,
    category: '경제/정보/뉴스',
    question: '관심 있게 보는 정보 유형은?',
    options: [
      '생활 혜택/이벤트',
      '송금·환전 등 편의 기능',
      '금융/투자 리서치',
      '필요할 때만 찾아봄'
    ]
  },
  {
    id: 6,
    category: '라이프스타일',
    question: '목표를 달성할 때 선호하는 방식은?',
    options: [
      '루틴을 꾸준히 유지',
      '마감 직전 몰아치기',
      '상황에 따라 유연하게',
      '체크리스트/달력 등으로 기록 관리'
    ]
  },
  {
    id: 7,
    category: '라이프스타일',
    question: '활동/탐색 취향에 더 가까운 것은?',
    options: [
      '근처 카페/맛집 등 생활형 탐색',
      '야구/공연/축제 등 행사형 활동',
      '여행/교통 정보 탐색',
      '건강관리'
    ]
  },
  {
    id: 8,
    category: '엔터테인먼트',
    question: '다른 앱에서 흥미롭게 사용해본 콘텐츠는?',
    options: [
      '랭킹/배지 등 도전 요소',
      '커뮤니티',
      '운세/타로',
      '정보/인사이트형 카드'
    ]
  },
  {
    id: 9,
    category: '저축성향',
    question: '이번 시즌의 저축 목표는?',
    options: [
      '비상금 마련',
      '기간형 목표(여행/자격/학비 등)',
      '장기 종잣돈',
      '저축 습관 만들기'
    ]
  },
  {
    id: 10,
    category: '저축성향',
    question: '선호하는 납입 방식은?',
    options: [
      '매달 정액 자동이체',
      '여유 있을 때 자유 적립',
      '급여일+1일 자동이체',
      '잔돈 모으기(라운드업)',
      '월마다 금액을 조정'
    ]
  },
  {
    id: 11,
    category: '저축성향',
    question: '예치 중 현금이 필요해질 가능성은?',
    options: [
      '낮음',
      '중간',
      '높음'
    ]
  },
  {
    id: 12,
    category: '저축성향',
    question: '과제/알림이 오면 가장 눌러볼 것 같은 건?',
    options: [
      '혜택/이벤트 알림',
      '순위/배지 업데이트',
      '절약/인사이트 코칭',
      '최소 알림만'
    ]
  }
];

export const SavingsSignupScreen: React.FC = () => {
  const navigation = useNavigation<SavingsSignupScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [currentStep, setCurrentStep] = useState<'info' | 'survey'>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  
  // 개인정보 입력 상태
  const [formData, setFormData] = useState({
    name: user?.name || '',
    birthYear: user?.birthYear || 2000,
    autoTransferAmount: '',
    transferAccount: '',
    school: user?.school || '',
  });

  // 만료일 계산 (2024년 12월 31일)
  const calculateRemainingMonths = () => {
    const today = new Date();
    const expiryDate = new Date('2024-12-31');
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths);
  };

  const remainingMonths = calculateRemainingMonths();
  const canJoin = remainingMonths >= 1;

  const handleNext = () => {
    if (currentStep === 'info') {
      // 개인정보 유효성 검사
      if (!formData.autoTransferAmount || !formData.transferAccount) {
        Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
        return;
      }
      setCurrentStep('survey');
    }
  };

  const handleSurveyAnswer = (answerIndex: number) => {
    const newAnswers = [...surveyAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSurveyAnswers(newAnswers);
  };

  const handleSurveyNext = () => {
    if (surveyAnswers[currentQuestion] === undefined) {
      Alert.alert('선택 오류', '답변을 선택해주세요.');
      return;
    }

    if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 설문 완료 - API 호출
      handleSubmitSurvey();
    }
  };

  const handleSubmitSurvey = () => {
    // API 호출 (주석 처리)
    /*
    const surveyData = {
      userId: user?.id,
      answers: surveyAnswers,
      formData: formData
    };
    
    // API 호출 함수
    submitSurveyAPI(surveyData);
    */
    
    Alert.alert(
      '가입 완료',
      '적금 가입이 완료되었습니다!',
      [
        {
          text: '확인',
          onPress: () => {
            // 홈 화면으로 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>개인정보 입력</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>이름</Text>
          <Text style={styles.infoValue}>{formData.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>출생년도</Text>
          <Text style={styles.infoValue}>{formData.birthYear}년</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>학교</Text>
          <Text style={styles.infoValue}>{formData.school}</Text>
        </View>
      </View>

      <View style={styles.periodCard}>
        <Text style={styles.periodTitle}>가입 가능 기간</Text>
        <Text style={styles.periodText}>
          만료일: 2024년 12월 31일
        </Text>
        <Text style={[styles.periodText, { color: canJoin ? COLORS.primary : COLORS.red[500] }]}>
          남은 기간: {remainingMonths}개월
        </Text>
        {!canJoin && (
          <Text style={styles.warningText}>
            1개월 미만 남으면 가입이 불가능합니다
          </Text>
        )}
      </View>

      <FormTextInput
        label="자동이체 금액"
        placeholder="월 납입 금액을 입력하세요 (최소 50,000원)"
        value={formData.autoTransferAmount}
        onChangeText={(text) => setFormData({ ...formData, autoTransferAmount: text })}
        keyboardType="numeric"
      />

      <FormTextInput
        label="자동이체 계좌"
        placeholder="이체될 계좌번호를 입력하세요"
        value={formData.transferAccount}
        onChangeText={(text) => setFormData({ ...formData, transferAccount: text })}
      />

      <PrimaryButton
        title="다음"
        onPress={handleNext}
        disabled={!canJoin}
        style={styles.nextButton}
      />
    </View>
  );

  const renderSurvey = () => (
    <View style={styles.stepContainer}>
      <View style={styles.surveyHeader}>
        <Text style={styles.surveyProgress}>
          {currentQuestion + 1} / {SURVEY_QUESTIONS.length}
        </Text>
        <Text style={styles.surveyCategory}>
          {SURVEY_QUESTIONS[currentQuestion].category}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          {SURVEY_QUESTIONS[currentQuestion].question}
        </Text>
        
        <View style={styles.optionsContainer}>
          {SURVEY_QUESTIONS[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                surveyAnswers[currentQuestion] === index && styles.optionButtonSelected
              ]}
              onPress={() => handleSurveyAnswer(index)}
            >
              <Text style={[
                styles.optionText,
                surveyAnswers[currentQuestion] === index && styles.optionTextSelected
              ]}>
                {index + 1}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <PrimaryButton
        title={currentQuestion === SURVEY_QUESTIONS.length - 1 ? '제출하기' : '다음'}
        onPress={handleSurveyNext}
        style={styles.nextButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="적금 가입" 
        showBack 
        onBackPress={() => {
          if (currentStep === 'survey') {
            setCurrentStep('info');
            setCurrentQuestion(0);
          } else {
            navigation.goBack();
          }
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {currentStep === 'info' ? renderPersonalInfo() : renderSurvey()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  stepContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
  },
  periodCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  periodText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.red[500],
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  surveyHeader: {
    marginBottom: SPACING.lg,
  },
  surveyProgress: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  surveyCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: SPACING.lg,
  },
});
