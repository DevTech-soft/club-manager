import { prisma } from '../config/database';
import type { Attendance } from '../types';

/**
 * Service layer for Attendances
 * Contains all business logic related to player attendances
 */

/**
 * Format attendance date to YYYY-MM-DD string
 */
const formatAttendanceDate = (attendance: any) => ({
  ...attendance,
  date: attendance.date.toISOString().split('T')[0],
});

/**
 * Get all attendances
 */
export const getAllAttendances = async () => {
  const attendances = await prisma.attendance.findMany();
  return attendances.map(formatAttendanceDate);
};

/**
 * Get attendances for a specific player
 */
export const getPlayerAttendances = async (playerId: string) => {
  const attendances = await prisma.attendance.findMany({
    where: { playerId },
    orderBy: { date: 'desc' },
  });
  return attendances.map(formatAttendanceDate);
};

/**
 * Register or update attendance for a player
 * Uses upsert to create new record or update existing one for today
 */
export const registerAttendance = async (
  playerId: string,
  status: 'Presente' | 'Ausente'
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await prisma.attendance.upsert({
    where: {
      playerId_date: {
        playerId,
        date: today,
      },
    },
    update: { status: status as any },
    create: {
      playerId,
      status: status as any,
      date: today,
    },
  });

  return formatAttendanceDate(record);
};

/**
 * Delete an attendance record
 */
export const deleteAttendance = async (playerId: string, date: Date) => {
  await prisma.attendance.delete({
    where: {
      playerId_date: {
        playerId,
        date,
      },
    },
  });
  return { success: true };
};
