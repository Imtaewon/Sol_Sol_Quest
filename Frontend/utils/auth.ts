/**
 * auth.ts
 * 
 * 인증 관련 유틸리티 함수들
 * 
 * 주요 기능:
 * - 토큰 저장/조회/삭제
 * - 인증 상태 확인
 * - 토큰 유효성 검증
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// AsyncStorage fallback 함수들
const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage 읽기 실패:', error);
      return null;
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage 읽기 실패:', error);
      return null;
    }
  }
};

/**
 * 저장된 인증 토큰을 가져옵니다.
 * @returns Promise<string | null> - 토큰이 있으면 토큰 문자열, 없으면 null
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await getStorageItem('access_token');
    return token;
  } catch (error) {
    console.error('토큰 조회 실패:', error);
    return null;
  }
};

/**
 * 현재 인증 상태를 확인합니다.
 * @returns Promise<boolean> - 토큰이 있으면 true, 없으면 false
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

/**
 * 토큰을 저장합니다.
 * @param token - 저장할 토큰
 */
export const setAuthToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.error('localStorage 토큰 저장 실패:', error);
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('AsyncStorage 토큰 저장 실패:', error);
    }
  }
};

/**
 * 저장된 토큰을 삭제합니다.
 */
export const removeAuthToken = async (): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      localStorage.removeItem('access_token');
    } catch (error) {
      console.error('localStorage 토큰 삭제 실패:', error);
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      console.error('AsyncStorage 토큰 삭제 실패:', error);
    }
  }
};
