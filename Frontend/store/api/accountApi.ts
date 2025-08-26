import { baseApi } from './baseApi';
import { 
  DemandDepositAccount,
  InstallmentSavingsAccount,
  AccountTransaction,
  Transfer,
  AccountSummary,
  ApiResponse,
  PaginatedResponse
} from '../../types/database';

export interface CreateDemandDepositRequest {
  account_no: string;
  balance?: number;
}

export interface CreateSavingsRequest {
  product_code: string;
  linked_dd_account_id: string;
  term_months: number;
  monthly_amount: number;
}

export interface TransferRequest {
  from_dd_account_id: string;
  to_savings_account_id: string;
  amount: number;
}

export interface AccountTransactionRequest {
  account_type: 'DEMAND' | 'SAVINGS';
  account_id: string;
  direction: 'credit' | 'debit';
  amount: number;
  memo?: string;
  related_payment_id?: string;
}

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 계좌 요약 정보
    getAccountSummary: builder.query<AccountSummary, void>({
      query: () => ({
        url: '/accounts/summary',
        method: 'GET',
      }),
    }),

    // 수시입출금 계좌 조회
    getDemandDepositAccounts: builder.query<DemandDepositAccount[], void>({
      query: () => ({
        url: '/accounts/demand-deposit',
        method: 'GET',
      }),
    }),

    // 적금 계좌 조회
    getSavingsAccounts: builder.query<InstallmentSavingsAccount[], void>({
      query: () => ({
        url: '/accounts/savings',
        method: 'GET',
      }),
    }),

    // 수시입출금 계좌 생성
    createDemandDepositAccount: builder.mutation<ApiResponse<DemandDepositAccount>, CreateDemandDepositRequest>({
      query: (data) => ({
        url: '/accounts/demand-deposit',
        method: 'POST',
        data,
      }),
    }),

    // 적금 계좌 생성
    createSavingsAccount: builder.mutation<ApiResponse<InstallmentSavingsAccount>, CreateSavingsRequest>({
      query: (data) => ({
        url: '/accounts/savings',
        method: 'POST',
        data,
      }),
    }),

    // 이체 실행
    createTransfer: builder.mutation<ApiResponse<Transfer>, TransferRequest>({
      query: (data) => ({
        url: '/accounts/transfer',
        method: 'POST',
        data,
      }),
    }),

    // 거래 내역 조회
    getTransactions: builder.query<PaginatedResponse<AccountTransaction>, {
      account_type?: 'DEMAND' | 'SAVINGS';
      account_id?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/accounts/transactions',
        method: 'GET',
        params,
      }),
    }),

    // 계좌 잔액 업데이트
    updateAccountBalance: builder.mutation<ApiResponse<DemandDepositAccount | InstallmentSavingsAccount>, {
      account_type: 'DEMAND' | 'SAVINGS';
      account_id: string;
      balance: number;
    }>({
      query: (data) => ({
        url: '/accounts/balance',
        method: 'PATCH',
        data,
      }),
    }),

    // 거래 내역 생성
    createTransaction: builder.mutation<ApiResponse<AccountTransaction>, AccountTransactionRequest>({
      query: (data) => ({
        url: '/accounts/transactions',
        method: 'POST',
        data,
      }),
    }),

    // 적금 만기 처리
    processSavingsMaturity: builder.mutation<ApiResponse<InstallmentSavingsAccount>, string>({
      query: (accountId) => ({
        url: `/accounts/savings/${accountId}/maturity`,
        method: 'POST',
      }),
    }),

    // 계좌 해지
    closeAccount: builder.mutation<ApiResponse<void>, {
      account_type: 'DEMAND' | 'SAVINGS';
      account_id: string;
    }>({
      query: (data) => ({
        url: `/accounts/${data.account_type.toLowerCase()}/${data.account_id}/close`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetAccountSummaryQuery,
  useGetDemandDepositAccountsQuery,
  useGetSavingsAccountsQuery,
  useCreateDemandDepositAccountMutation,
  useCreateSavingsAccountMutation,
  useCreateTransferMutation,
  useGetTransactionsQuery,
  useUpdateAccountBalanceMutation,
  useCreateTransactionMutation,
  useProcessSavingsMaturityMutation,
  useCloseAccountMutation,
} = accountApi;
