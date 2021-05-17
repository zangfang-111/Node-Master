import { PaymentStatus, SupportedOrderType } from "./index";

export interface TransactionSum {
  status?: string;
  amount?: number;
}

export interface TransactionStatistics {
  status?: string;
  current?: number;
  percent?: number;
  history?: any[];
}

export interface TransactionFilter {
  id?: number;
  status?: PaymentStatus;
  orderType?: SupportedOrderType;
}

export interface UserFilter {
  id?: string;
}

export interface UserResponse {
  id?: number;
  name?: string;
  uuid?: string;
  email?: string;
  walletAddress?: string;
  phoneNumber?: string;
  verified?: boolean;
  location?: string;
  createdAt?: Date;
  transactions?: number;
}

export enum UserStatus {
  Active = 1,
  Suspended = 0,
}

export interface SentTransaction {
  txid: string;
  network: string;
  chain: string;
  blockHash: string;
  blockTime: string;
  fee: number;
  value: number;
  confirmations: number;
  recipient?: string;
}
