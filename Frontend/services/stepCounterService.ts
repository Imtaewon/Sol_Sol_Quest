import { Accelerometer } from 'expo-sensors';

export interface StepData {
  totalSteps: number;
  todaySteps: number;
  weeklySteps: number;
  monthlySteps: number;
  lastUpdated: number;
}

export interface StepGoal {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface AccelerometerSubscription {
  remove: () => void;
}

export class StepCounterService {
  private static instance: StepCounterService;
  private subscription: AccelerometerSubscription | null = null;
  private isTracking = false;
  private stepData: StepData = {
    totalSteps: 0,
    todaySteps: 0,
    weeklySteps: 0,
    monthlySteps: 0,
    lastUpdated: Date.now(),
  };
  private stepGoal: StepGoal = {
    daily: 10000,
    weekly: 70000,
    monthly: 300000,
  };
  private stepCount = 0;
  private lastAcceleration = { x: 0, y: 0, z: 0 };
  private stepThreshold = 1.2; // 걸음 감지 임계값
  private stepCooldown = 300; // 걸음 간 최소 시간 (밀리초)
  private lastStepTime = 0;

  static getInstance(): StepCounterService {
    if (!StepCounterService.instance) {
      StepCounterService.instance = new StepCounterService();
    }
    return StepCounterService.instance;
  }

  async startStepTracking(
    onStepUpdate: (stepData: StepData) => void
  ): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    try {
      // 기존 데이터 로드
      await this.loadStepData();

      this.subscription = Accelerometer.addListener((data) => {
        this.processAccelerometerData(data, onStepUpdate);
      });

      Accelerometer.setUpdateInterval(100); // 100ms마다 업데이트
      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('만보기 추적을 시작하는데 실패했습니다:', error);
      return false;
    }
  }

  stopStepTracking(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isTracking = false;
    this.saveStepData();
  }

  private processAccelerometerData(
    data: { x: number; y: number; z: number },
    onStepUpdate: (stepData: StepData) => void
  ) {
    const now = Date.now();
    const acceleration = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    // 걸음 감지 로직
    if (
      acceleration > this.stepThreshold &&
      now - this.lastStepTime > this.stepCooldown
    ) {
      this.stepCount++;
      this.lastStepTime = now;
      this.updateStepData();
      onStepUpdate(this.stepData);
    }

    this.lastAcceleration = data;
  }

  private updateStepData(): void {
    const now = Date.now();
    const today = new Date().toDateString();

    this.stepData.totalSteps++;
    this.stepData.todaySteps++;
    this.stepData.lastUpdated = now;

    // 주간/월간 통계 업데이트 (실제로는 더 정교한 로직 필요)
    this.stepData.weeklySteps = this.stepData.todaySteps * 7; // 간단한 예시
    this.stepData.monthlySteps = this.stepData.todaySteps * 30; // 간단한 예시
  }

  getStepData(): StepData {
    return { ...this.stepData };
  }

  getStepGoal(): StepGoal {
    return { ...this.stepGoal };
  }

  setStepGoal(goal: Partial<StepGoal>): void {
    this.stepGoal = { ...this.stepGoal, ...goal };
  }

  getStepProgress(): {
    daily: number;
    weekly: number;
    monthly: number;
  } {
    return {
      daily: (this.stepData.todaySteps / this.stepGoal.daily) * 100,
      weekly: (this.stepData.weeklySteps / this.stepGoal.weekly) * 100,
      monthly: (this.stepData.monthlySteps / this.stepGoal.monthly) * 100,
    };
  }

  isStepGoalAchieved(type: 'daily' | 'weekly' | 'monthly'): boolean {
    switch (type) {
      case 'daily':
        return this.stepData.todaySteps >= this.stepGoal.daily;
      case 'weekly':
        return this.stepData.weeklySteps >= this.stepGoal.weekly;
      case 'monthly':
        return this.stepData.monthlySteps >= this.stepGoal.monthly;
      default:
        return false;
    }
  }

  // 걸음 수 수동 추가 (테스트용)
  addSteps(steps: number): void {
    this.stepCount += steps;
    this.updateStepData();
  }

  // 걸음 수 리셋
  resetSteps(): void {
    this.stepCount = 0;
    this.stepData = {
      totalSteps: 0,
      todaySteps: 0,
      weeklySteps: 0,
      monthlySteps: 0,
      lastUpdated: Date.now(),
    };
    this.saveStepData();
  }

  isStepTracking(): boolean {
    return this.isTracking;
  }

  // 데이터 저장 (AsyncStorage 사용)
  private async saveStepData(): Promise<void> {
    try {
      // 실제 구현에서는 AsyncStorage 사용
      // await AsyncStorage.setItem('stepData', JSON.stringify(this.stepData));
      // await AsyncStorage.setItem('stepGoal', JSON.stringify(this.stepGoal));
      console.log('걸음 데이터 저장됨:', this.stepData);
    } catch (error) {
      console.error('걸음 데이터 저장 실패:', error);
    }
  }

  // 데이터 로드 (AsyncStorage 사용)
  private async loadStepData(): Promise<void> {
    try {
      // 실제 구현에서는 AsyncStorage 사용
      // const stepDataStr = await AsyncStorage.getItem('stepData');
      // const stepGoalStr = await AsyncStorage.getItem('stepGoal');
      
      // if (stepDataStr) {
      //   this.stepData = JSON.parse(stepDataStr);
      // }
      // if (stepGoalStr) {
      //   this.stepGoal = JSON.parse(stepGoalStr);
      // }
      
      console.log('걸음 데이터 로드됨:', this.stepData);
    } catch (error) {
      console.error('걸음 데이터 로드 실패:', error);
    }
  }

  // 걸음 수를 거리로 변환 (미터)
  stepsToDistance(steps: number): number {
    // 평균 보폭 0.7미터로 계산
    return steps * 0.7;
  }

  // 거리를 걸음 수로 변환
  distanceToSteps(distance: number): number {
    return Math.round(distance / 0.7);
  }

  // 걸음 수를 칼로리로 변환
  stepsToCalories(steps: number): number {
    // 평균적으로 1걸음당 0.04칼로리 소모
    return steps * 0.04;
  }
}

export default StepCounterService.getInstance();
