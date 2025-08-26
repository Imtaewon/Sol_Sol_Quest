import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // 실제 카메라 권한 요청 대신 placeholder
    setHasPermission(true);
  }, []);

  const handleTestScan = () => {
    setScanned(true);
    Alert.alert(
      'QR 코드 스캔 완료',
      '테스트 QR 코드가 스캔되었습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: '확인',
          onPress: () => {
            onScan('test-qr-data');
            setScanned(false);
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한을 요청 중입니다...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 접근 권한이 없습니다.</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title}>QR 코드 스캔</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            <Ionicons name="camera" size={64} color={COLORS.white} style={styles.cameraIcon} />
            <Text style={styles.cameraText}>카메라 기능은 개발 중입니다</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.instruction}>
              QR 코드를 프레임 안에 맞춰주세요
            </Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestScan}
            >
              <Text style={styles.testButtonText}>테스트 QR 스캔</Text>
            </TouchableOpacity>
            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanText}>다시 스캔</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
    backgroundColor: COLORS.gray[800],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
    marginBottom: SPACING.lg,
  },
  cameraIcon: {
    marginBottom: SPACING.md,
  },
  cameraText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
    alignItems: 'center',
  },
  instruction: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  testButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  rescanButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  rescanText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  text: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
});
