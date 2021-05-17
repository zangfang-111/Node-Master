export enum PaymentStatus {
  SUBMITTED = "Submitted",
  PENDING = "Pending",
  DECLINED = "Declined",
  APPROVED = "Approved",
  REFUNDED = "Refunded",
}

export enum SupportedOrderType {
  SEND = "SEND",
  BUY = "BUY",
}

export enum VerificationType {
  PHONENUMBER = "PhoneNumber",
  EMAIL = "Email",
}

export enum SupportedDigitalCurrenciesType {
  BTC = "BTC",
  ETH = "ETH",
  BUSD = "BUSD",
  NANO = "NANO",
  DASH = "DASH",
  EOS = "EOS",
  DAI = "DAI",
  LTC = "LTC",
  XRP = "XRP",
  XLM = "XLM",
  BNB = "BNB",
  ATOM = "ATOM",
  TRX = "TRX",
  USDT = "USDT",
  SGA = "SGA",
  CEL = "CEL",
  PAX = "PAX",
  LUNA = "LUNA",
  SDT = "SDT",
  XAUT = "XAUT",
}

export enum SupportedFiatCurrenciesType {
  USD = "USD",
  EUR = "EUR",
  JPY = "JPY",
  CAD = "CAD",
  GBP = "GBP",
  RUB = "RUB",
  AUD = "AUD",
  KRW = "KRW",
  CHF = "CHF",
  CZK = "CZK",
  DKK = "DKK",
  NOK = "NOK",
  NZD = "NZD",
  PLN = "PLN",
  SEK = "SEK",
  TRY = "TRY",
  ZAR = "ZAR",
  HUF = "HUF",
  ILS = "ILS",
  AED = "AED",
  INR = "INR",
  HKD = "HKD",
  MYR = "MYR",
  NGN = "NGN",
  SGD = "SGD",
  TWD = "TWD",
  BGN = "BGN",
  BRL = "BRL",
  MAD = "MAD",
  RON = "RON",
  MXN = "MXN",
  AZN = "AZN",
  NAD = "NAD",
  UAH = "UAH",
  IDR = "IDR",
  VND = "VND",
  KZT = "KZT",
  PHP = "PHP",
  DOP = "DOP",
  PEN = "PEN",
  ARS = "ARS",
  COP = "COP",
  MDL = "MDL",
  QAR = "QAR",
  UZS = "UZS",
  GEL = "GEL",
  UYU = "UYU",
  CLP = "CLP",
  CRC = "CRC",
  CNY = "CNY",
}

export interface PaymentRequestAttributes {
  userId: string;
  createdAt: Date;
  email: string;
  phone: string;
  quoteId: string;
  paymentId: string;
  orderId: string;
  clientIp: string;
  clientLocation: string;
  uaid: string;
  acceptLanguage: string;
  httpAcceptLanguage: string;
  userAgent: string;
  cookieSessionId: string;
  walletAddress: string;
  requestedCurrency: SupportedDigitalCurrenciesType | SupportedFiatCurrenciesType;
  tags: string;
}
export interface QuoteRequestAttributes {
  userId: string;
  digitalCurrency: SupportedDigitalCurrenciesType;
  fiatCurrency: SupportedFiatCurrenciesType;
  requestedCurrency: SupportedDigitalCurrenciesType | SupportedFiatCurrenciesType;
  requestedAmount: number;
  clientIp: string;
}
export interface UserEntity {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  zipcode?: string;
  homeAddress?: string;
  dob?: string;
  phoneNumber?: string;
  email?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
}
export interface AdminEntity {
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  role?: number;
}

export interface TransactionResponse {
  accountName?: string;
  transactionId?: string;
  paymentId?: string;
  orderId?: string;
  status?: string;
  fiatAmount?: number;
  fiatCurrency?: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  toWalletAddress?: string;
  updatedAt?: Date;
}

export interface SimplexEvent {
  event_id: string;
  name: string;
  payment: any;
  timestamp: string;
}
