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
import { QuestsStackParamList } from '../../navigation/QuestsStack';

type QuestUploadScreenNavigationProp = StackNavigationProp<QuestsStackParamList, 'QuestUpload'>;

interface RouteParams {
  quest: {
    id: string;
    title: string;
    description: string;
  };
}

export const QuestUploadScreen: React.FC = () => {
  const navigation = useNavigation<QuestUploadScreenNavigationProp>();
  const route = useRoute();
  const { quest } = route.params as RouteParams;

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
      if (Platform.OS === 'web') {
        // 웹 환경에서는 input file을 사용
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx';
        input.multiple = false;
        
        input.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          
          if (file) {
            setSelectedFile({
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              size: file.size,
            });
          }
        };
        
        input.click();
      } else {
        // 모바일 환경에서는 기존 방식 사용
        Alert.alert(
          '파일 선택',
          '어떤 타입의 파일을 선택하시겠습니까?',
          [
            {
              text: '이미지',
              onPress: async () => {
                try {
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
                                 } catch (error) {
                   console.error('이미지 선택 에러:', error);
                   Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
                 }
              },
            },
            {
              text: '문서',
              onPress: async () => {
                try {
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
                                 } catch (error) {
                   console.error('문서 선택 에러:', error);
                   Alert.alert('오류', '문서를 선택하는 중 오류가 발생했습니다.');
                 }
              },
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ]
        );
      }
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
    try {
      // 실제 파일 업로드 없이 파일명으로 URL 생성
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      
      // 파일명을 기반으로 현실적인 URL 생성
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // 특수문자 제거
      const safeFileName = `${timestamp}_${randomId}_${fileName}`;
      
      const fakeUrl = `https://sol-sol-quest-uploads.s3.amazonaws.com/quest-proofs/${safeFileName}`;
      
      return fakeUrl;
      
    } catch (error) {
      console.error('URL 생성 에러:', error);
      
      // 에러 발생 시 기본 URL 생성
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      return `https://temp-uploads.example.com/quest-proofs/${timestamp}_${randomId}.${fileExtension}`;
    }
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
      const proofUrl = await uploadFileToServer(selectedFile);

      // 2. 퀘스트 제출 API 호출
      await uploadQuestProof({
        quest_id: quest.id,
        proof_url: proofUrl,
      }).unwrap();

             Alert.alert(
         '제출 완료',
         '파일이 성공적으로 제출되었습니다.',
         [
           {
             text: '확인',
             onPress: () => {
               // 퀘스트 페이지로 리디렉트
               navigation.reset({
                 index: 0,
                 routes: [
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
      <AppHeader 
        title="파일 제출" 
        showBackButton 
        onBackPress={() => {
          try {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // 스택에 이전 화면이 없으면 퀘스트 목록으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Quests' }],
              });
            }
          } catch (error) {
            console.error('뒤로가기 에러:', error);
            // 에러 발생 시 퀘스트 목록으로 강제 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'Quests' }],
            });
          }
        }}
      />
      
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
                               onPress={() => {
                  handleFileSelect();
                }}
               disabled={isUploading}
             >
               <Ionicons name="cloud-upload-outline" size={48} color={COLORS.primary} />
               <Text style={styles.fileSelectText}>파일 선택하기</Text>
               <Text style={styles.fileSelectSubtext}>
                 {Platform.OS === 'web' ? '클릭하여 파일을 선택하세요' : '이미지, PDF, 문서 파일을 선택할 수 있습니다'}
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
    backgroundColor: COLORS.primary + '05',
    minHeight: 120,
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
