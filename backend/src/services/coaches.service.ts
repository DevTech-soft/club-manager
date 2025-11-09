import { prisma } from '../config/database';
import type { CoachCreationData } from '../types';

/**
 * Service layer for Coaches
 * Contains all business logic related to coaches
 */

/**
 * Get all coaches (without password field)
 */
export const getAllCoaches = async () => {
  const coaches = await prisma.coach.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      document: true,
      avatarUrl: true,
    },
  });
  return coaches;
};

/**
 * Get a single coach by ID (without password)
 */
export const getCoachById = async (id: string) => {
  const coach = await prisma.coach.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      document: true,
      avatarUrl: true,
    },
  });
  return coach;
};

/**
 * Create a new coach
 * Sets password to document by default
 */
export const createCoach = async (coachData: CoachCreationData) => {
  const newCoach = await prisma.coach.create({
    data: {
      ...coachData,
      password: coachData.document, // Set password to document by default
    },
  });

  // Remove password from response
  const { password, ...coachInfo } = newCoach;
  return coachInfo;
};

/**
 * Update a coach by ID
 */
export const updateCoach = async (id: string, coachData: Partial<CoachCreationData>) => {
  const updatedCoach = await prisma.coach.update({
    where: { id },
    data: coachData,
  });

  // Remove password from response
  const { password, ...coachInfo } = updatedCoach;
  return coachInfo;
};

/**
 * Delete a coach by ID
 */
export const deleteCoach = async (id: string) => {
  await prisma.coach.delete({
    where: { id },
  });
  return { success: true };
};
