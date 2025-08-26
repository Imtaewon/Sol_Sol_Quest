import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { AppHeader } from '../../components/common/AppHeader';
import locationService, { LocationData, QuestLocation } from '../../services/locationService';
import stepCounterService, { StepData } from '../../services/stepCounterService';

// 신한은행/신한카드 스타일 색상
const SHINHAN_COLORS = {
  primary: '#1428A0', // 신한 블루
  secondary: '#FF6B35', // 신한 오렌지
  accent: '#00A3E0', // 신한 라이트 블루
  success: '#00C851',
  error: '#FF4444',
  background: '#F8F9FA',
  white: '#FFFFFF',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
  },
};

const { width } = Dimensions.get('window');

// 샘플 퀘스트 위치 데이터
const SAMPLE_QUEST_LOCATIONS: QuestLocation[] = [
  {
    id: 'library',
    name: '중앙도서관',
    latitude: 37.5665,
    longitude: 126.9780,
    radius: 100, // 100미터 반경
    description: '도서관에 방문하여 독서 퀘스트 완료',
  },
  {
    id: 'park',
    name: '한강공원',
    latitude: 37.5215,
    longitude: 126.9240,
    radius: 150,
    description: '공원에서 산책하며 운동 퀘스트 완료',
  },
  {
    id: 'cafe',
    name: '스타벅스 강남점',
    latitude: 37.4980,
    longitude: 127.0276,
    radius: 50,
    description: '카페에서 공부 퀘스트 완료',
  },
];

export const QuestTrackerScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [stepData, setStepData] = useState<StepData>({
    totalSteps: 0,
    todaySteps: 0,
    weeklySteps: 0,
    monthlySteps: 0,
    lastUpdated: Date.now(),
  });
  const [nearbyQuests, setNearbyQuests] = useState<QuestLocation[]>([]);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [isStepTracking, setIsStepTracking] = useState(false);

  useEffect(() => {
    initializeServices();
    return () => {
      cleanupServices();
    };
  }, []);

  const initializeServices = async () => {
    // 위치 서비스 초기화
    const locationPermission = await locationService.requestPermissions();
    if (locationPermission) {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      updateNearbyQuests(location);
    }

    // 만보기 서비스 초기화
    const stepData = stepCounterService.getStepData();
    setStepData(stepData);
  };

  const cleanupServices = () => {
    locationService.stopLocationTracking();
    stepCounterService.stopStepTracking();
  };

  const updateNearbyQuests = (location: LocationData | null) => {
    if (location) {
      const nearby = locationService.findNearbyQuestLocations(
        location,
        SAMPLE_QUEST_LOCATIONS
      );
      setNearbyQuests(nearby);
    }
  };

  const startLocationTracking = async () => {
    const success = await locationService.startLocationTracking(
      (location) => {
        setCurrentLocation(location);
        updateNearbyQuests(location);
      }
    );

    if (success) {
      setIsLocationTracking(true);
      Alert.alert('알림', '위치 추적이 시작되었습니다.');
    } else {
      Alert.alert('오류', '위치 추적을 시작할 수 없습니다.');
    }
  };

  const stopLocationTracking = () => {
    locationService.stopLocationTracking();
    setIsLocationTracking(false);
    Alert.alert('알림', '위치 추적이 중지되었습니다.');
  };

  const startStepTracking = async () => {
    const success = await stepCounterService.startStepTracking(
      (data) => {
        setStepData(data);
      }
    );

    if (success) {
      setIsStepTracking(true);
      Alert.alert('알림', '만보기 추적이 시작되었습니다.');
    } else {
      Alert.alert('오류', '만보기 추적을 시작할 수 없습니다.');
    }
  };

  const stopStepTracking = () => {
    stepCounterService.stopStepTracking();
    setIsStepTracking(false);
    Alert.alert('알림', '만보기 추적이 중지되었습니다.');
  };

  const handleQuestComplete = (quest: QuestLocation) => {
    Alert.alert(
      '퀘스트 완료!',
      `${quest.name} 퀘스트를 완료했습니다!\n보상: 500 EXP`,
      [
        {
          text: '확인',
          onPress: () => {
            // 실제로는 서버에 퀘스트 완료 요청
            console.log('퀘스트 완료:', quest.id);
          },
        },
      ]
    );
  };

  const addTestSteps = () => {
    stepCounterService.addSteps(100);
    const newStepData = stepCounterService.getStepData();
    setStepData(newStepData);
  };

  const renderLocationCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="location" size={24} color={SHINHAN_COLORS.primary} />
        <Text style={styles.cardTitle}>현재 위치</Text>
      </View>
      
      {currentLocation ? (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            위도: {currentLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            경도: {currentLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            정확도: {currentLocation.accuracy.toFixed(1)}m
          </Text>
        </View>
      ) : (
        <Text style={styles.noDataText}>위치 정보를 가져올 수 없습니다</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.trackingButton,
          isLocationTracking ? styles.stopButton : styles.startButton,
        ]}
        onPress={isLocationTracking ? stopLocationTracking : startLocationTracking}
      >
        <Text style={styles.trackingButtonText}>
          {isLocationTracking ? '위치 추적 중지' : '위치 추적 시작'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="footsteps" size={24} color={SHINHAN_COLORS.secondary} />
        <Text style={styles.cardTitle}>오늘의 걸음</Text>
      </View>
      
      <View style={styles.stepInfo}>
        <Text style={styles.stepCount}>{stepData.todaySteps.toLocaleString()}</Text>
        <Text style={styles.stepLabel}>걸음</Text>
      </View>
      
      <View style={styles.stepStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stepCounterService.stepsToDistance(stepData.todaySteps).toFixed(1)}m</Text>
          <Text style={styles.statLabel}>거리</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stepCounterService.stepsToCalories(stepData.todaySteps).toFixed(1)}kcal</Text>
          <Text style={styles.statLabel}>칼로리</Text>
        </View>
      </View>
      
      <View style={styles.stepProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min((stepData.todaySteps / 10000) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          목표: {stepData.todaySteps.toLocaleString()}/10,000 걸음
        </Text>
      </View>
      
      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[
            styles.trackingButton,
            isStepTracking ? styles.stopButton : styles.startButton,
          ]}
          onPress={isStepTracking ? stopStepTracking : startStepTracking}
        >
          <Text style={styles.trackingButtonText}>
            {isStepTracking ? '만보기 중지' : '만보기 시작'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={addTestSteps}
        >
          <Text style={styles.testButtonText}>테스트 +100걸음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNearbyQuests = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="map" size={24} color={SHINHAN_COLORS.accent} />
        <Text style={styles.cardTitle}>주변 퀘스트</Text>
      </View>
      
      {nearbyQuests.length > 0 ? (
        nearbyQuests.map((quest) => (
          <TouchableOpacity
            key={quest.id}
            style={styles.questItem}
            onPress={() => handleQuestComplete(quest)}
          >
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{quest.name}</Text>
              <Text style={styles.questDescription}>{quest.description}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={SHINHAN_COLORS.success} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noDataText}>주변에 완료 가능한 퀘스트가 없습니다</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="퀘스트 추적기" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderLocationCard()}
        {renderStepCard()}
        {renderNearbyQuests()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHINHAN_COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: SHINHAN_COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: SHINHAN_COLORS.gray[800],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
    marginLeft: SPACING.sm,
  },
  locationInfo: {
    marginBottom: SPACING.lg,
  },
  locationText: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  noDataText: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[500],
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepCount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: SHINHAN_COLORS.secondary,
  },
  stepLabel: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  stepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: SHINHAN_COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  stepProgress: {
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: SHINHAN_COLORS.gray[200],
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: SHINHAN_COLORS.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: SHINHAN_COLORS.gray[600],
    textAlign: 'center',
  },
  trackingButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  startButton: {
    backgroundColor: SHINHAN_COLORS.primary,
  },
  stopButton: {
    backgroundColor: SHINHAN_COLORS.error,
  },
  trackingButtonText: {
    color: SHINHAN_COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  testButton: {
    flex: 1,
    backgroundColor: SHINHAN_COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  testButtonText: {
    color: SHINHAN_COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: SHINHAN_COLORS.gray[200],
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  questDescription: {
    fontSize: FONT_SIZES.sm,
    color: SHINHAN_COLORS.gray[600],
  },
});
