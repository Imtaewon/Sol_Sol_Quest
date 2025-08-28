import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  gender: z.enum(['M', 'F', 'X'] as const).refine((val) => val !== undefined, {
    message: '성별을 선택해주세요',
  }),
  birthYear: z.number().min(1990, '1990년 이후 출생자만 가입 가능합니다').max(2010, '2010년 이전 출생자만 가입 가능합니다'),
  username: z.string().min(3, '아이디는 3자 이상이어야 합니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  passwordConfirm: z.string(),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  school: z.string().min(1, '학교를 선택해주세요'),
  department: z.string().min(1, '학과를 입력해주세요'),
  grade: z.number().min(1, '학년을 선택해주세요').max(4, '학년은 1-4학년 사이여야 합니다'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

export const loginSchema = z.object({
  login_id: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  school: z.string().min(1, '학교를 선택해주세요').optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

