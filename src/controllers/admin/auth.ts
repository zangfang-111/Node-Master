import { Request, Response } from "express";

import { Admin } from "../../models";

import { firebase } from "../../services/firebase";
import { sendAdminInvitationEmail } from "../../services/sendgrid";
import { generateJWTToken, verifyJWTToken } from "../../services/jwt";

/**
 * Firebase Admin Login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const where = { where: { email } };

  try {
    const isExist = await Admin.count(where);
    if (isExist) {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      const idToken = await firebase.auth().currentUser.getIdToken(true);
      res.json({
        token: idToken,
      });
    } else {
      res.status(400).json({
        error: "Admin does not exist",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Send invitation
 */
export const sendInvitationEmail = async (req: Request, res: Response): Promise<void> => {
  const { name, email, role } = req.body;
  const where = { where: { email } };

  try {
    if (!name || !email || !role || !Number.isInteger(role) || role === 1) {
      throw new Error("Bad request!");
    }

    const isExist = await Admin.count(where);
    if (!isExist) {
      const admin = await Admin.create({
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        email,
        role,
        confirmed: false,
      });

      const token = generateJWTToken({ email }, "2h");
      await sendAdminInvitationEmail(name, email, `${process.env.BACK_OFFICE_BASE_URL}/auth/signup?token=${token}`);

      res.json(admin);
    } else {
      res.status(400).json({
        error: "Admin already exists",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Check if the invitation is valid
 * @param req
 * @param res
 */
export const verifyInvitation = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  try {
    if (!token) {
      throw new Error("Invalid request!");
    }

    const decoded = verifyJWTToken(token);
    const where = {
      where: { email: decoded.email },
      raw: true,
    };
    const admin = await Admin.findOne(where);

    if (!admin) {
      throw new Error("Invalid request!");
    }

    // Token expires in 4h since the user clicks the registration link from email
    const newToken = generateJWTToken(admin, "4h");
    const response = {
      ...admin,
      token: newToken,
    };
    res.json(response);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Complete signup
 */
export const completeSignup = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, token } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !token) {
      throw new Error("Bad request!");
    }
    // Verify admin registration
    const decoded = verifyJWTToken(token);
    if (!decoded || !decoded.email || email !== decoded.email) {
      throw new Error("Unauthorized request!");
    }
    const where = { where: { email } };

    // Save the admin to firebase
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    // Update the admin entity in table
    await Admin.update(
      {
        firstName,
        lastName,
        confirmed: true,
      },
      where
    );
    const admin = await Admin.findOne(where);
    res.json(admin);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Send reset email
 */
export const sendResetEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const where = { where: { email, confirmed: true } };

  try {
    const isExist = await Admin.count(where);
    if (isExist) {
      firebase.auth().sendPasswordResetEmail(email);
      res.json("Sent reset email");
    } else {
      res.status(400).json({
        error: "Admin not exists",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Reset password manually with custom email template
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword, oldPassword } = req.body;
  const where = { where: { email, confirmed: true } };

  try {
    const isExist = await Admin.count(where);
    if (isExist) {
      await firebase.auth().signInWithEmailAndPassword(email, oldPassword);
      firebase.auth().currentUser.updatePassword(newPassword);
      res.json("Reset password successfully");
    } else {
      res.status(400).json({
        error: "Admin not exists",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
