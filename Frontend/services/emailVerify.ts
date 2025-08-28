// Mock 이메일 인증 서비스
// FastAPI 백엔드가 준비되기 전까지 사용

interface EmailVerificationRequest {
  email: string;
}

interface EmailVerificationResponse {
  success: boolean;
  message: string;
  code?: string;
}

interface EmailVerifyRequest {
  email: string;
  code: string;
}

interface EmailVerifyResponse {
  success: boolean;
  message: string;
  verified: boolean;
}

// Mock 데이터 저장소
const mockEmailCodes = new Map<string, { code: string; expiresAt: number }>();

// 이메일 인증 코드 발송
export const sendEmailVerificationCode = async (
  request: EmailVerificationRequest
): Promise<EmailVerificationResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 오류 발생
      if (Math.random() < 0.1) {
        reject(new Error('이메일 발송 중 오류가 발생했습니다.'));
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5분 후 만료

      mockEmailCodes.set(request.email, { code, expiresAt });

      console.log(`[Mock] 이메일 인증 코드 발송: ${request.email} -> ${code}`);

      resolve({
        success: true,
        message: '인증 코드가 이메일로 발송되었습니다.',
        code, // 실제로는 클라이언트에 전송하지 않음
      });
    }, 500 + Math.random() * 300); // 500-800ms 지연
  });
};

// 이메일 인증 코드 확인
export const verifyEmailCode = async (
  request: EmailVerifyRequest
): Promise<EmailVerifyResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 오류 발생
      if (Math.random() < 0.1) {
        reject(new Error('인증 확인 중 오류가 발생했습니다.'));
        return;
      }

      const storedData = mockEmailCodes.get(request.email);

      if (!storedData) {
        resolve({
          success: false,
          message: '인증 코드가 발송되지 않았습니다.',
          verified: false,
        });
        return;
      }

      if (Date.now() > storedData.expiresAt) {
        mockEmailCodes.delete(request.email);
        resolve({
          success: false,
          message: '인증 코드가 만료되었습니다.',
          verified: false,
        });
        return;
      }

      if (storedData.code !== request.code) {
        resolve({
          success: false,
          message: '인증 코드가 일치하지 않습니다.',
          verified: false,
        });
        return;
      }

      // 인증 성공 시 저장된 코드 삭제
      mockEmailCodes.delete(request.email);

      console.log(`[Mock] 이메일 인증 성공: ${request.email}`);

      resolve({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
        verified: true,
      });
    }, 300 + Math.random() * 200); // 300-500ms 지연
  });
};

// Mock API 함수들 (FastAPI 스타일)
export const mockEmailAPI = {
  // POST /api/email/send-code
  sendCode: sendEmailVerificationCode,
  
  // POST /api/email/verify
  verify: verifyEmailCode,
};




