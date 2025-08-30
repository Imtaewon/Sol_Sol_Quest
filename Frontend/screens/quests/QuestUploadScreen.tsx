/**
 * QuestUploadScreen.tsx
 * 
 * 퀘스트 파일 업로드 화면
 * 
 * 주요 기능:
 * - 파일 선택 (이미지, PDF 등)
 * - 파일 미리보기
 * - 파일 업로드 및 제출
 * - 업로드 진행률 표시
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useUploadQuestProofMutation } from '../../store/api/baseApi';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestUploadScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'QuestUpload'>;

interface RouteParams {
  quest: {
    id: string;
    title: string;
    description: string;
  };
}

export const QuestUploadScreen: React.FC = () => {
  console.log('📁 QuestUploadScreen 렌더링 시작');
  
  const navigation = useNavigation<QuestUploadScreenNavigationProp>();
  const route = useRoute();
  const { quest } = route.params as RouteParams;
  
  console.log('📁 QuestUploadScreen route params:', route.params);
  console.log('📁 QuestUploadScreen quest:', quest);

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadQuestProof] = useUploadQuestProofMutation();

  /**
   * 파일 선택 함수
   * 이미지 또는 문서 파일을 선택할 수 있음
   */
  const handleFileSelect = async () => {
    try {
      Alert.alert(
        '파일 선택',
        '어떤 타입의 파일을 선택하시겠습니까?',
        [
          {
            text: '이미지',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedFile({
                  uri: result.assets[0].uri,
                  name: result.assets[0].fileName || 'image.jpg',
                  type: result.assets[0].type || 'image/jpeg',
                  size: result.assets[0].fileSize || 0,
                });
              }
            },
          },
          {
            text: '문서',
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: [
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'image/*',
                ],
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedFile({
                  uri: result.assets[0].uri,
                  name: result.assets[0].name,
                  type: result.assets[0].mimeType || 'application/octet-stream',
                  size: result.assets[0].size || 0,
                });
              }
            },
          },
          {
            text: '취소',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('파일 선택 중 오류:', error);
      Alert.alert('오류', '파일을 선택하는 중 오류가 발생했습니다.');
    }
  };

  /**
   * 파일 업로드 함수
   * 실제 구현에서는 서버에 파일을 업로드하고 URL을 받아옴
   */
  const uploadFileToServer = async (file: any): Promise<string> => {
    // 실제 구현에서는 FormData를 사용하여 파일을 서버에 업로드
    // 여기서는 시뮬레이션을 위해 가짜 URL을 반환
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          // 실제로는 서버에서 반환된 URL을 사용
          resolve(`https://example.com/uploads/${Date.now()}_${file.name}`);
        }
      }, 200);
    });
  };

  /**
   * 파일 제출 함수
   */
  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('알림', '파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. 파일을 서버에 업로드하고 URL 받기
      console.log('📁 파일 업로드 시작:', selectedFile.name);
      const proofUrl = await uploadFileToServer(selectedFile);
      console.log('📁 파일 업로드 완료, URL:', proofUrl);

      // 2. 퀘스트 제출 API 호출
      console.log('🎯 퀘스트 제출 API 호출 시작');
      await uploadQuestProof({
        quest_id: quest.id,
        proof_url: proofUrl,
      }).unwrap();
      console.log('🎯 퀘스트 제출 API 호출 완료');

             Alert.alert(
         '제출 완료',
         '파일이 성공적으로 제출되었습니다.',
         [
           {
             text: '확인',
             onPress: () => {
               // 퀘스트 페이지로 리디렉트
               navigation.reset({
                 index: 1,
                 routes: [
                   { name: 'Home' },
                   { name: 'Quests' }
                 ],
               });
             },
           },
         ]
       );
    } catch (error) {
      console.error('파일 제출 실패:', error);
      Alert.alert('오류', '파일 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * 파일 크기 포맷팅 함수
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <AppHeader title="파일 제출" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 퀘스트 정보 */}
        <View style={styles.questInfo}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>

        {/* 파일 선택 영역 */}
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>증빙 파일</Text>
          
          {!selectedFile ? (
            <TouchableOpacity
              style={styles.fileSelectButton}
              onPress={handleFileSelect}
              disabled={isUploading}
            >
              <Ionicons name="cloud-upload-outline" size={48} color={COLORS.primary} />
              <Text style={styles.fileSelectText}>파일 선택하기</Text>
              <Text style={styles.fileSelectSubtext}>
                이미지, PDF, 문서 파일을 선택할 수 있습니다
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Ionicons name="document" size={24} color={COLORS.primary} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.gray[400]} />
                </TouchableOpacity>
              </View>
              
              {/* 이미지 미리보기 */}
              {selectedFile.type.startsWith('image/') && (
                <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
              )}
            </View>
          )}
        </View>

        {/* 업로드 진행률 */}
        {isUploading && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>파일 업로드 중... {uploadProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}

        {/* 제출 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedFile || isUploading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedFile || isUploading}
        >
          <Text style={styles.submitButtonText}>
            {isUploading ? '제출 중...' : '파일 제출하기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  questInfo: {
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
  questTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  questDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  fileSection: {
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
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  fileSelectButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileSelectText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  fileSelectSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  selectedFileContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  fileDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  fileName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.dark,
  },
  fileSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
  },
  progressSection: {
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
  progressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
