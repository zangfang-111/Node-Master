import jwt from "jsonwebtoken";

const secret = "JwT_SeCREt1";
/**
 * Generate JWT Token
 * @param tokenData
 */
export const generateJWTToken = (tokenData: any, exp: string): string =>
  jwt.sign(tokenData, secret, { expiresIn: exp });

/**
 * Verify JWT Token
 * @param string
 */
export const verifyJWTToken = (token: string): any => jwt.verify(token, secret);
