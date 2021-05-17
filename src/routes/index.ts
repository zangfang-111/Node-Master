import express, { Request, Response } from "express";

import appRoutes from "./app-routes";
import adminRoutes from "./admin-routes";

const router = express.Router();

// Mobile and Web App Routes
router.use('/app', appRoutes);
// Admin Routes
router.use('/admin', adminRoutes);

export default router;