import { Request } from "express";

export const getIpFromReq = (req: Request): string => {
  if (req.headers) {
    if (req.headers["x-forwarded-for"]) {
      return Array.isArray(req.headers["x-forwarded-for"])
        ? req.headers["x-forwarded-for"][0].split(",")[0]
        : req.headers["x-forwarded-for"].split(",")[0];
    }
    if (req.headers["x-real-ip"]) {
      return Array.isArray(req.headers["x-real-ip"])
        ? req.headers["x-real-ip"][0].split(",")[0]
        : req.headers["x-real-ip"].split(",")[0];
    }
  }
  if (req.ip) return req.ip;
  if (req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
  return "";
};
