import express, { Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";

if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
}

import * as middlewares from "../middlewares";
import * as userController from "../controllers/user";
import * as notificationController from "../controllers/notification";
import * as historyController from "../controllers/history";
import * as paymentController from "../controllers/payment";
import * as transactionController from "../controllers/transactions";

const router = express.Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({ message: "Service is up!!!" });
});

// User Routes
router.post("/auth", userController.login);

router.post("/user", middlewares.verifyToken, userController.createUserEntity);
router.get("/user", [middlewares.verifyToken, middlewares.checkIfUserExisting], userController.getUserEntity);
router.put("/user", [middlewares.verifyToken, middlewares.checkIfUserExisting], userController.updateUserEntity);

// Store user's wallet address
router.post(
  "/user/walletAddress",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.storeWallet
);

router.post(
  "/user/avatar",
  multer({ dest: "temp/", limits: { fieldSize: 16 * 1024 * 1024 } }).single("avatar"),
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.uploadAvatar
);

/**
 * Phone Number Verification
 */
router.post(
  "/user/verifyPhone",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.sendSmsCode
);
router.post(
  "/user/confirmPhoneCode",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.confirmPhoneCode
);

/**
 * Email Verification
 */
router.post(
  "/user/verifyEmail",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.sendEmailCode
);
router.post(
  "/user/confirmEmailCode",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  userController.confirmEmailCode
);

/**
 * Payments router (Simplex)
 */
router.post(
  "/payments/quote",
  [middlewares.verifyToken, middlewares.checkIfUserExisting, middlewares.quoteRequestValidate],
  paymentController.quote
);
router.post(
  "/payments/request",
  [middlewares.verifyToken, middlewares.checkIfUserExisting, middlewares.paymentRequestValidate],
  paymentController.request
);
router.get("/payments/events", [middlewares.verifyToken, middlewares.checkIfUserExisting], paymentController.getEvents);
router.delete(
  "/payments/events/:id",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  paymentController.deleteEvent
);

/**
 * Transactions router
 */
router.get(
  "/transactions",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  transactionController.getTransactions
);
router.get(
  "/transactions/:id",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  transactionController.getTransactionById
);

/**
 * Notifications router
 */
router.get(
  "/notifications",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  notificationController.getNotifications
);
router.post(
  "/notifications",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  notificationController.updateNotifications
);

/**
 * BTC History
 */
router.post(
  "/btc/history",
  [middlewares.verifyToken, middlewares.checkIfUserExisting],
  historyController.getBTCHistory
);

export default router;
