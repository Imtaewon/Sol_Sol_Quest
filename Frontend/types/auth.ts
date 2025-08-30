// 인증 관련 타입 정의

export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface LoginResponseData {
  success: boolean;
  data?: {
    access_token: string;
    user: {
      user_id: string;
      name: string;
      login_id: string;
      email: string;
      university_name?: string;
      current_tier?: string;
      total_exp?: number;
      has_savings?: boolean;
    };
  };
  access_token?: string;
  user?: {
    user_id: string;
    name: string;
    login_id: string;
    email: string;
    university_name?: string;
    current_tier?: string;
    total_exp?: number;
    has_savings?: boolean;
  };
}

export interface SignupRequest {
  login_id: string;
  email: string;
  password: string;
  password_confirm: string;
  real_name: string;
  gender?: 'M' | 'F' | 'X';
  birth_year?: number;
  university_code: string;
  university_name: string;
  department?: string;
  grade?: number;
}

export interface SignupResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      user_id: string;
      name: string;
      email: string;
      university_name: string;
      current_tier: string;
      total_exp: number;
      has_savings: boolean;
    };
  };
  message: string;
}
