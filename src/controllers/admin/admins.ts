import { Request, Response } from "express";
import { Op } from "sequelize";

import { admin } from "../../services/firebase";
import { fileUpload } from "../../services/aws";
import { Admin } from "../../models";
import { AdminEntity } from "../../types";

/**
 * Get my profile
 * @param req
 * @param res
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const { me } = req.body;
  res.json(me);
};

/**
 * Upload a admin's photo
 */
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  const { me } = req.body;
  const where = { where: { email: me.email } };

  try {
    // Upload file
    const avatar = await fileUpload(req.body.fileName, req.file);
    await Admin.update(
      {
        avatar,
      },
      where
    );

    const user = await Admin.findOne(where);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get all admins
 * @param req
 * @param res
 */
export const getAdminList = async (req: Request, res: Response): Promise<void> => {
  try {
    const userList = await Admin.findAll({
      where: {
        role: { [Op.not]: 1 }, // Exclude the super admins
      },
    });
    res.json(userList);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get a admin by Id
 * @param req
 * @param res
 */
export const getAdminById = async (req: Request, res: Response): Promise<void> => {
  try {
    const uuid = req.params.id;
    if (!uuid) {
      throw new Error("Admin Id is required!");
    }
    const where = { where: { uuid } };
    const admin = await Admin.findOne(where);

    if (!admin) {
      throw new Error("This admin does not exist in our db.");
    }

    res.json(admin);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Update admin details
 * @param req
 * @param res
 */
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const uuid = req.params.id;
    if (!uuid) {
      throw new Error("User Id is required!");
    }
    const where = { where: { uuid } };
    // Get a user from DB
    const user = await Admin.findOne(where);

    if (!user) {
      throw new Error("This admin does not exist in our db.");
    }

    const { firstName, lastName, address, email, phoneNumber, role } = req.body;
    const newEntity: AdminEntity = {};

    if (!!firstName) {
      newEntity.firstName = firstName;
    }
    if (!!lastName) {
      newEntity.lastName = lastName;
    }
    if (!!address) {
      newEntity.address = address;
    }
    if (!!email) {
      newEntity.email = email;
    }
    if (!!phoneNumber) {
      newEntity.phoneNumber = phoneNumber;
    }

    if (!!role) {
      newEntity.role = role;
    }

    const firebaseEntity: { email?: string; phoneNumber?: string } = {};
    if (!!newEntity.email && newEntity.email !== user.email) {
      firebaseEntity.email = newEntity.email;
    }

    if (!!newEntity.phoneNumber && newEntity.phoneNumber !== user.phoneNumber) {
      firebaseEntity.phoneNumber = newEntity.phoneNumber;
    }

    // Update Firebase User
    if (Object.keys(firebaseEntity).length !== 0) {
      // Get a user by email from firebase
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().updateUser(firebaseUser.uid, firebaseEntity);
    }

    let updatedUser = null;
    // Update user table
    if (Object.keys(newEntity).length !== 0) {
      await Admin.update(newEntity, { where: { id: user.id } });
      updatedUser = await Admin.findOne({ where: { id: user.id } });
    }

    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Delete an admin
 * @param req
 * @param res
 */
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const uuid = req.params.id;
    if (!uuid) {
      throw new Error("User Id is required!");
    }
    const where = { where: { uuid } };
    // Get a user from DB
    const user = await Admin.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }
    // Delete a user from firebase
    await deleteFirebaseUser(user.email);
    // Delete a user from DB
    await Admin.destroy(where);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Delete a user from Firebase
 * @param email
 */
const deleteFirebaseUser = async (email: string) => {
  try {
    // Get a user by email from firebase
    const firebaseUser = await admin.auth().getUserByEmail(email);
    // Delete a user from Firebase
    await admin.auth().deleteUser(firebaseUser.uid);
  } catch (e) {
    console.log("Non-existing user!");
  }
};
