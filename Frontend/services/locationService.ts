import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface QuestLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // 미터 단위
  description: string;
}

export class LocationService {
  private static instance: LocationService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentLocation: LocationData | null = null;
  private isTracking = false;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('위치를 가져오는데 실패했습니다:', error);
      return null;
    }
  }

  async startLocationTracking(
    onLocationUpdate: (location: LocationData) => void,
    distanceFilter: number = 10 // 10미터마다 업데이트
  ): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5초마다
          distanceInterval: distanceFilter, // 10미터마다
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;
          onLocationUpdate(locationData);
        }
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('위치 추적을 시작하는데 실패했습니다:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
  }

  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }

  // 두 지점 간의 거리 계산 (미터 단위)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // 특정 위치에 도달했는지 확인
  isNearLocation(
    currentLat: number,
    currentLon: number,
    targetLat: number,
    targetLon: number,
    radius: number
  ): boolean {
    const distance = this.calculateDistance(
      currentLat,
      currentLon,
      targetLat,
      targetLon
    );
    return distance <= radius;
  }

  // 퀘스트 위치에 도달했는지 확인
  checkQuestLocationReached(
    currentLocation: LocationData,
    questLocation: QuestLocation
  ): boolean {
    return this.isNearLocation(
      currentLocation.latitude,
      currentLocation.longitude,
      questLocation.latitude,
      questLocation.longitude,
      questLocation.radius
    );
  }

  // 주변 퀘스트 위치 찾기
  findNearbyQuestLocations(
    currentLocation: LocationData,
    questLocations: QuestLocation[]
  ): QuestLocation[] {
    return questLocations.filter((quest) =>
      this.checkQuestLocationReached(currentLocation, quest)
    );
  }
}

export default LocationService.getInstance();
