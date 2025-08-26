import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

interface Question {
  id: number;
  category: string;
  question: string;
  options: {
    text: string;
    value: string;
  }[];
}

const questions: Question[] = [
  // 금융 지식 관련 질문
  {
    id: 1,
    category: '금융 지식',
    question: '예금과 적금의 차이점을 알고 계신가요?',
    options: [
      { text: '매우 잘 알고 있다', value: 'expert' },
      { text: '대략적으로 알고 있다', value: 'intermediate' },
      { text: '조금 알고 있다', value: 'beginner' },
      { text: '모르겠다', value: 'novice' },
    ],
  },
  {
    id: 2,
    category: '금융 지식',
    question: '복리 효과에 대해 얼마나 알고 계신가요?',
    options: [
      { text: '자세히 설명할 수 있다', value: 'expert' },
      { text: '개념을 이해하고 있다', value: 'intermediate' },
      { text: '들어본 적이 있다', value: 'beginner' },
      { text: '처음 듣는다', value: 'novice' },
    ],
  },
  {
    id: 3,
    category: '금융 지식',
    question: '투자 상품(주식, 펀드 등)에 투자해본 경험이 있나요?',
    options: [
      { text: '여러 상품에 투자 중', value: 'expert' },
      { text: '1-2개 상품 경험', value: 'intermediate' },
      { text: '관심은 있지만 경험 없음', value: 'beginner' },
      { text: '전혀 관심 없음', value: 'novice' },
    ],
  },
  // 학교 생활 관련 질문
  {
    id: 4,
    category: '학교 생활',
    question: '현재 학년은 어떻게 되시나요?',
    options: [
      { text: '1학년', value: 'freshman' },
      { text: '2학년', value: 'sophomore' },
      { text: '3학년', value: 'junior' },
      { text: '4학년 이상', value: 'senior' },
    ],
  },
  {
    id: 5,
    category: '학교 생활',
    question: '평소 용돈을 어떻게 관리하시나요?',
    options: [
      { text: '계획적으로 저축한다', value: 'planner' },
      { text: '필요할 때만 사용한다', value: 'moderate' },
      { text: '즉흥적으로 사용한다', value: 'spontaneous' },
      { text: '관리하지 않는다', value: 'unmanaged' },
    ],
  },
  {
    id: 6,
    category: '학교 생활',
    question: '알바나 인턴 경험이 있나요?',
    options: [
      { text: '정기적으로 하고 있다', value: 'regular' },
      { text: '가끔 한다', value: 'occasional' },
      { text: '해본 적 있다', value: 'experience' },
      { text: '해본 적 없다', value: 'none' },
    ],
  },
  // 생활 패턴 관련 질문
  {
    id: 7,
    category: '생활 패턴',
    question: '평소 월 생활비는 얼마나 되시나요?',
    options: [
      { text: '50만원 이상', value: 'high' },
      { text: '30-50만원', value: 'medium' },
      { text: '20-30만원', value: 'low' },
      { text: '20만원 미만', value: 'very_low' },
    ],
  },
  {
    id: 8,
    category: '생활 패턴',
    question: '저축 목표가 있나요?',
    options: [
      { text: '명확한 목표가 있다', value: 'clear' },
      { text: '대략적인 목표가 있다', value: 'vague' },
      { text: '생각해보고 있다', value: 'thinking' },
      { text: '목표가 없다', value: 'none' },
    ],
  },
  {
    id: 9,
    category: '생활 패턴',
    question: '앱이나 게임을 통해 목표 달성 경험이 있나요?',
    options: [
      { text: '자주 사용한다', value: 'frequent' },
      { text: '가끔 사용한다', value: 'occasional' },
      { text: '해본 적 있다', value: 'experience' },
      { text: '해본 적 없다', value: 'none' },
    ],
  },
];

export const SavingsTestScreen: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  console.log('SavingsTestScreen 렌더링됨');

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 모든 질문 완료
      if (Object.keys(answers).length === questions.length) {
        setShowResults(true);
      } else {
        Alert.alert('완료', '모든 질문에 답변해주세요.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getRecommendation = () => {
    // 간단한 추천 로직 (실제로는 더 복잡한 알고리즘 사용)
    const financialScores = Object.entries(answers)
      .filter(([id]) => questions[parseInt(id) - 1]?.category === '금융 지식')
      .map(([, value]) => {
        switch (value) {
          case 'expert': return 4;
          case 'intermediate': return 3;
          case 'beginner': return 2;
          case 'novice': return 1;
          default: return 0;
        }
      });

    const avgFinancialScore = financialScores.length > 0 ? financialScores.reduce((a: number, b: number) => a + b, 0) / financialScores.length : 0;

    if (avgFinancialScore >= 3.5) {
      return {
        type: '고급형',
        description: '금융 지식이 풍부하시네요! SOL 티어 달성을 목표로 해보세요.',
        features: ['높은 금리 상품 추천', '복잡한 퀘스트 제공', 'SOL 티어 우선 지원']
      };
    } else if (avgFinancialScore >= 2.5) {
      return {
        type: '중급형',
        description: '적당한 금융 지식을 가지고 계시네요. 단계적으로 성장해보세요.',
        features: ['균형잡힌 퀘스트 제공', '골드 티어 목표', '교육 콘텐츠 제공']
      };
    } else {
      return {
        type: '입문형',
        description: '금융을 처음 접하시는군요! 차근차근 배워가보세요.',
        features: ['기초 퀘스트 제공', '브론즈 티어부터 시작', '많은 가이드 제공']
      };
    }
  };

  const handleComplete = () => {
    Alert.alert(
      '테스트 완료',
      '추천 알고리즘 테스트가 완료되었습니다!\n적금 가입을 진행합니다.',
      [{ text: '확인', onPress: () => console.log('테스트 완료, 적금 가입 진행') }]
    );
  };

  if (showResults) {
    const recommendation = getRecommendation();
    
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="추천 결과" showBack />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="star" size={48} color={COLORS.secondary} />
              <Text style={styles.resultTitle}>추천 결과</Text>
            </View>
            
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationType}>{recommendation.type}</Text>
              <Text style={styles.recommendationDescription}>
                {recommendation.description}
              </Text>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>맞춤 서비스</Text>
              {recommendation.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.completeSection}>
            <PrimaryButton
              title="적금 가입 완료하기"
              onPress={handleComplete}
              size="large"
              style={styles.completeButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="추천 알고리즘 테스트" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {currentQuestion + 1} / {questions.length}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{question.category}</Text>
          </View>
          
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[question.id] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswer(question.id, option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[question.id] === option.value && styles.optionTextSelected
                ]}>
                  {option.text}
                </Text>
                {answers[question.id] === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navigationSection}>
          {currentQuestion > 0 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrevious}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
              <Text style={styles.navButtonText}>이전</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              !answers[question.id] && styles.navButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!answers[question.id]}
          >
            <Text style={[
              styles.navButtonText,
              styles.nextButtonText,
              !answers[question.id] && styles.navButtonTextDisabled
            ]}>
              {currentQuestion === questions.length - 1 ? '완료' : '다음'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={answers[question.id] ? COLORS.white : COLORS.gray[400]} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.dark,
  },
  progressPercentage: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.white,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  navButtonDisabled: {
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
  },
  navButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.primary,
    marginHorizontal: SPACING.xs,
  },
  nextButtonText: {
    color: COLORS.white,
  },
  navButtonTextDisabled: {
    color: COLORS.gray[400],
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resultTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.sm,
  },
  recommendationSection: {
    marginBottom: SPACING.xl,
  },
  recommendationType: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  recommendationDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  featuresTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  completeSection: {
    marginBottom: SPACING.xl,
  },
  completeButton: {
    marginTop: SPACING.lg,
  },
});
