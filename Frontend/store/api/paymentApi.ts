import { baseApi } from './baseApi';

export interface PaymentRequest {
  amount: number;
  merchantId?: string;
  description?: string;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  qrCode?: string;
  createdAt: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  status: 'completed' | 'failed';
  merchantName?: string;
  description?: string;
  createdAt: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentResponse, PaymentRequest>({
      query: (paymentData) => ({
        url: '/payments',
        method: 'POST',
        body: paymentData,
      }),
    }),
    
    getPaymentHistory: builder.query<PaymentHistory[], void>({
      query: () => '/payments/history',
    }),
    
    getPaymentStatus: builder.query<PaymentResponse, string>({
      query: (paymentId) => `/payments/${paymentId}/status`,
    }),
    
    cancelPayment: builder.mutation<void, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/cancel`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentStatusQuery,
  useCancelPaymentMutation,
} = paymentApi;
