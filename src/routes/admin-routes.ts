import express from "express";
import multer from "multer";

import * as middlewares from "../middlewares";
import * as authController from "../controllers/admin/auth";
import * as dashboardController from "../controllers/admin/dashboard";
import * as transactionsController from "../controllers/admin/transactions";
import * as usersController from "../controllers/admin/users";
import * as adminsController from "../controllers/admin/admins";

const router = express.Router();

router.post("/auth", authController.login);
router.post(
  "/invitation",
  [middlewares.verifyToken, middlewares.checkIsSuperAdmin],
  authController.sendInvitationEmail
);
router.post("/verifyInvitation", authController.verifyInvitation);
router.post("/complete", authController.completeSignup);
router.post("/sendResetEmail", authController.sendResetEmail);
// Enable this route when using no longer firebase reset email template
// router.post("/resetPassword", authController.resetPassword);

router.get("/dashboard/users", [middlewares.verifyToken, middlewares.checkIsAdmin], dashboardController.getUsersInfo);
router.get(
  "/dashboard/transactions",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  dashboardController.getTransactionsInfo
);
router.get(
  "/dashboard/stats/:type",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  dashboardController.getStatsInfo
);

router.get(
  "/transactions/statistics",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  transactionsController.getTransactionsStatistics
);
router.get(
  "/transactions/:id",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  transactionsController.getTransactionDetail
);
// Get all transactions
router.post(
  "/transactions",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  transactionsController.getTransactionList
);

/**
 * Router for getting all users
 */
router.get("/users", [middlewares.verifyToken, middlewares.checkIsAdmin], usersController.getUserList);
/**
 * Route for getting a user by id
 */
router.get("/users/:id", [middlewares.verifyToken, middlewares.checkIsAdmin], usersController.getUserById);
/**
 * Route for getting a user's transactions by userid
 */
router.get(
  "/users/:id/transactions",
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  usersController.getUserTransactions
);
/**
 * Route for editing the user details
 */
router.put("/users/:id/edit", [middlewares.verifyToken, middlewares.checkIsAdmin], usersController.updateUser);
/**
 * Route for suspending a user
 */
router.put("/users/:id/suspend", [middlewares.verifyToken, middlewares.checkIsAdmin], usersController.suspendUser);
/**
 * Route for deleting a user
 */
router.delete("/users/:id", [middlewares.verifyToken, middlewares.checkIsAdmin], usersController.deleteUser);

/**
 * Admin users routers
 */
router.get("/me", [middlewares.verifyToken, middlewares.checkIsAdmin], adminsController.getMe);
router.post(
  "/me/avatar",
  multer({ dest: "temp/", limits: { fieldSize: 16 * 1024 * 1024 } }).single("avatar"),
  [middlewares.verifyToken, middlewares.checkIsAdmin],
  adminsController.uploadAvatar
);
router.get("/admins", [middlewares.verifyToken, middlewares.checkIsAdmin], adminsController.getAdminList);
router.get("/admins/:id", [middlewares.verifyToken, middlewares.checkIsAdmin], adminsController.getAdminById);
router.put("/admins/:id", [middlewares.verifyToken, middlewares.checkIsAdmin], adminsController.updateAdmin);
router.delete("/admins/:id", [middlewares.verifyToken, middlewares.checkIsAdmin], adminsController.deleteAdmin);

export default router;
