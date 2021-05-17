import sgMail from "@sendgrid/mail";

const templates = {
  email_verification: process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
  admin_invitation: process.env.SENDGRID_EMAIL_ADMIN_INVITATION_TEMPLATE_ID,
  password_reset: process.env.SENDGRID_EMAIL_RESET_PASSWORD_TEMPLATE_ID,
  transaction_request: process.env.SENDGRID_EMAIL_TRANSACTION_REQUEST_TEMPLATE_ID,
  transaction_approve: process.env.SENDGRID_EMAIL_TRANSACTION_APPROVE_TEMPLATE_ID,
};

/**
 * Send Email Verification
 * @param username
 * @param email
 * @param code
 */
export const sendVerificationEmail = async (username: string, email: string, code: string) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const data = {
    from: process.env.SENDER_EMAIL,
    to: email,
    templateId: templates["email_verification"],
    dynamic_template_data: {
      code,
      username,
    },
  };

  await sgMail.send(data);
};

/**
 * Send Admin Invitation Email
 * @param username
 * @param email
 */
export const sendAdminInvitationEmail = async (username: string, email: string, link: string) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const data = {
    from: process.env.SENDER_EMAIL,
    to: email,
    templateId: templates["admin_invitation"],
    dynamic_template_data: {
      link,
      username,
    },
  };

  await sgMail.send(data);
};

/**
 * Send Reset Password Email
 * @param username
 * @param email
 * @param url
 */
export const sendResetPasswordEmail = async (username: string, email: string, url: string) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const data = {
    from: process.env.SENDER_EMAIL,
    to: email,
    templateId: templates["password_reset"],
    dynamic_template_data: {
      url,
      username,
    },
  };

  await sgMail.send(data);
};

/**
 * Send Transaction Request Email
 * @param username
 * @param email
 * @param link
 * @param transactionId
 */
export const sendTransactionRequestEmail = async (
  username: string,
  email: string,
  link: string,
  transactionId: string
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const data = {
    from: process.env.SENDER_EMAIL,
    to: email,
    templateId: templates["transaction_request"],
    dynamic_template_data: {
      transactionId,
      username,
      link,
    },
  };

  await sgMail.send(data);
};

/**
 * Send Transaction Approved Email
 * @param username
 * @param email
 * @param link
 * @param walletAddress
 * @param cryptoAmount
 */
export const sendTransactionApproveEmail = async (
  username: string,
  email: string,
  link: string,
  walletAddress: string,
  cryptoAmount: number
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const data = {
    from: process.env.SENDER_EMAIL,
    to: email,
    templateId: templates["transaction_approve"],
    dynamic_template_data: {
      link,
      username,
      walletAddress,
      cryptoAmount,
    },
  };

  await sgMail.send(data);
};
