/**
 * MyPageScreen.tsx
 * 
 * 사용자 마이페이지 화면
 * 
 * 주요 기능:
 * - 적금 가입 여부에 따른 조건부 렌더링
 * - 개인정보 표시 (이름, 학교, 학과, 학년, 티어, EXP)
 * - 내 적금/예금 정보 표시
 * - 서비스 메뉴 (출석체크, GPS.만보기)
 * - 로그아웃 기능
 * 
 * 화면 구성:
 * - 개인정보 섹션: 사용자 기본 정보 및 티어 정보
 * - 내 적금/예금 섹션: 계좌 정보 또는 가입하기 버튼
 * - 서비스 섹션: 출석체크, GPS.만보기 버튼
 * - 로그아웃 버튼
 * 
 * 조건부 렌더링:
 * - 적금 미가입자: 가입하기 버튼 표시
 * - 적금 가입자: 실제 계좌 정보 표시
 * - 서비스 접근 제한: 적금 미가입 시 알림 표시
 * 
 * 상태 관리:
 * - Redux를 통한 사용자 정보 관리
 * - 로그아웃 시 토큰 삭제 및 인증 상태 초기화
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { logout } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { MyPageStackParamList } from '../../navigation/MyPageStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLogoutMutation } from '../../store/api/baseApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 카드 너비를 고정값으로 설정 (Dimensions 제거)
const CARD_WIDTH = 300;

type MyPageScreenNavigationProp = StackNavigationProp<MyPageStackParamList, 'MyPage'>;

// 티어별 색상
const TIER_COLORS = {
  BASIC: COLORS.gray[400],
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  SOL: '#FF6B35',
};

// 티어별 이름
const TIER_NAMES = {
  BASIC: '기본',
  BRONZE: '브론즈',
  SILVER: '실버',
  GOLD: '골드',
  SOL: '솔',
};

export const MyPageScreen: React.FC = () => {
  const navigation = useNavigation<MyPageScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutMutation] = useLogoutMutation();

  // 더미 데이터 (실제로는 API에서 가져올 데이터)
  const userStats = {
    total_exp: 1250,
    current_tier: 'SILVER' as const,
    savings_accounts: [
      {
        id: '1',
        product_name: '솔 적금',
        balance: 500000,
        monthly_amount: 100000,
        interest_rate: 3.5,
        maturity_date: '2024-12-31',
        status: 'active' as const,
      },
    ],
    deposit_accounts: [
      {
        id: '2',
        account_name: '솔 입출금',
        balance: 1500000,
        interest_rate: 1.2,
      },
    ],
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // 백엔드 API 호출
              await logoutMutation().unwrap();
              
              // 로컬 토큰 삭제
              await AsyncStorage.removeItem('auth_token');
              
              // Redux 상태 초기화
              dispatch(logout());
              dispatch(clearUser());
              
              // 로그인 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              console.error('로그아웃 실패:', error);
              // API 실패해도 로컬 로그아웃은 진행
              await AsyncStorage.removeItem('auth_token');
              dispatch(logout());
              dispatch(clearUser());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            }
          },
        },
      ]
    );
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>개인정보</Text>
      <View style={styles.personalInfoCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={24} color={COLORS.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.real_name || '사용자'}</Text>
            <Text style={styles.userDetails}>
              {user?.school_id ? '대학생' : '게스트'} • {user?.department || '학과 미설정'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {/* 티어 정보 */}
        <View style={styles.tierSection}>
          <View style={styles.tierHeader}>
            <View style={[
              styles.tierBadge,
              { backgroundColor: TIER_COLORS[userStats.current_tier] + '20' }
            ]}>
              <Text style={[
                styles.tierName,
                { color: TIER_COLORS[userStats.current_tier] }
              ]}>
                {TIER_NAMES[userStats.current_tier]}
              </Text>
            </View>
            <Text style={styles.tierExp}>{userStats.total_exp.toLocaleString()} EXP</Text>
          </View>
          
          <View style={styles.tierProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: '60%',
                    backgroundColor: TIER_COLORS[userStats.current_tier]
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>다음 티어까지 750 EXP 남음</Text>
          </View>
          
          <View style={styles.tierBenefits}>
            <Text style={styles.benefitsTitle}>티어 혜택</Text>
            <Text style={styles.benefitsText}>
              적금 우대금리 {userStats.current_tier === 'SILVER' ? '0.5%' : '0.3%'} 추가
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAccountCarousel = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>내 적금/예금</Text>
      
      {/* 적금/예금 통합 캐러셀 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.accountCarousel}
      >
        {/* 적금 카드 */}
        {userStats.savings_accounts.length > 0 ? (
          userStats.savings_accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountTypeContainer}>
                  <Text style={styles.accountTypeLabel}>적금</Text>
                  <Text style={styles.accountName}>{account.product_name}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: account.status === 'active' ? COLORS.success + '20' : COLORS.gray[200] }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: account.status === 'active' ? COLORS.success : COLORS.gray[600] }
                  ]}>
                    {account.status === 'active' ? '진행중' : '만기'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.accountBalance}>
                <Text style={styles.balanceLabel}>현재 잔액</Text>
                <Text style={styles.balanceAmount}>
                  {account.balance.toLocaleString()}원
                </Text>
              </View>
              
              <View style={styles.accountDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>월 납입금</Text>
                  <Text style={styles.detailValue}>
                    {account.monthly_amount.toLocaleString()}원
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>금리</Text>
                  <Text style={styles.detailValue}>{account.interest_rate}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>만기일</Text>
                  <Text style={styles.detailValue}>{account.maturity_date}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <TouchableOpacity style={[styles.accountCard, styles.newAccountCard]}>
            <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
            <Text style={styles.newAccountText}>새 적금 개설</Text>
          </TouchableOpacity>
        )}

        {/* 예금 카드 */}
        {userStats.deposit_accounts.length > 0 ? (
          userStats.deposit_accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountTypeContainer}>
                  <Text style={styles.accountTypeLabel}>예금</Text>
                  <Text style={styles.accountName}>{account.account_name}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>활성</Text>
                </View>
              </View>
              
              <View style={styles.accountBalance}>
                <Text style={styles.balanceLabel}>현재 잔액</Text>
                <Text style={styles.balanceAmount}>
                  {account.balance.toLocaleString()}원
                </Text>
              </View>
              
              <View style={styles.accountDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>금리</Text>
                  <Text style={styles.detailValue}>{account.interest_rate}%</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <TouchableOpacity style={[styles.accountCard, styles.newAccountCard]}>
            <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
            <Text style={styles.newAccountText}>새 예금 개설</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );



  const renderMenuItems = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>서비스</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Attendance')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="calendar" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuItemText}>출석 관리</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications" size={24} color={COLORS.gray[600]} />
            <Text style={styles.menuItemText}>알림 설정</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLogoutButton = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="마이페이지" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPersonalInfo()}
        {renderAccountCarousel()}
        {renderMenuItems()}
        {renderLogoutButton()}
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  personalInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  userDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  editButton: {
    padding: SPACING.sm,
  },
  tierSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  accountCarousel: {
    paddingRight: SPACING.lg,
  },
  accountCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newAccountCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
  },
  newAccountText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  accountTypeContainer: {
    flex: 1,
  },
  accountTypeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  accountName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  accountBalance: {
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  accountDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.dark,
  },
  tierCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tierName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  tierExp: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
  },
  tierProgress: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  tierBenefits: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  benefitsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  benefitsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    marginLeft: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
});

