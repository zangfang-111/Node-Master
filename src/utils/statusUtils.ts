import { PaymentStatus } from "../types";
export const getStatus = (value: string): string => {
  let status: string = PaymentStatus.SUBMITTED;
  if (value === "payment_request_submitted") {
    status = PaymentStatus.PENDING;
  }

  if (value === "payment_simplexcc_approved") {
    status = PaymentStatus.APPROVED;
  }

  if (value === "payment_simplexcc_declined") {
    status = PaymentStatus.DECLINED;
  }

  if (value === "payment_simplexcc_refunded") {
    status = PaymentStatus.REFUNDED;
  }
  return status;
};
