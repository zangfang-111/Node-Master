import { Verification } from "../models";

/**
 * Generate 6 digit code
 * @param len
 */
export const generateCode = (len: number = 6) =>
  Math.random()
    .toString()
    .slice(2, len + 2);

/**
 * Remove entities from Table
 * @param entities
 * @param type
 */
export const removeEntity = async (entities: Verification[], type: string) => {
  entities.forEach(async (entity: Verification) => {
    if (entity.type === type) {
      await entity.destroy();
    }
  });
};

/**
 * First letter capitalize
 * @param value
 */
export const capitalized = (value: string) => value.charAt(0).toUpperCase + value.slice(1);

/**
 * Convert Uppercase
 * @param value
 */
export const upperCase = (value: string) => value.toUpperCase();
