import { Model, Optional } from "sequelize";

export interface AdminAttributes {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  uuid?: string;
  role?: number;
  confirmed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, "id"> {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id!: number;
  public firstName!: string;
  public uuid!: string;
  public email!: string;
  public role!: number;
  public phoneNumber!: string;

  public readonly createdAt!: Date;
}

export { Admin };
