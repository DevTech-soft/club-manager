import { prisma } from '../config/database';
import type { ClubSettings } from '../types';

/**
 * Service layer for Club Settings
 * Contains all business logic related to club settings
 */

/**
 * Default club settings values
 */
const DEFAULT_SETTINGS = {
  id: 1,
  name: "Voley Club",
  logoUrl: "/logo-default.svg",
  primaryColor: '#DC2626',
  secondaryColor: '#F9FAFB',
  tertiaryColor: '#FBBF24',
  backgroundColor: '#000000',
  surfaceColor: '#1F2937',
  textPrimaryColor: '#F9FAFB',
  textSecondaryColor: '#9CA3AF',
  teamCreationEnabled: true,
  monthlyPaymentEnabled: true,
};

/**
 * Map database settings to frontend format
 * Converts individual color fields to a colors object
 */
const mapSettingsForFrontend = (settings: any): ClubSettings => {
  const {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    backgroundColor,
    surfaceColor,
    textPrimaryColor,
    textSecondaryColor,
    ...rest
  } = settings;

  return {
    ...rest,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor,
      background: backgroundColor,
      surface: surfaceColor,
      textPrimary: textPrimaryColor,
      textSecondary: textSecondaryColor,
    },
  };
};

/**
 * Map frontend settings to database format
 * Converts colors object to individual color fields
 */
const mapSettingsForDatabase = (settings: ClubSettings) => {
  const { colors, ...rest } = settings;

  return {
    ...rest,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    tertiaryColor: colors.tertiary,
    backgroundColor: colors.background,
    surfaceColor: colors.surface,
    textPrimaryColor: colors.textPrimary,
    textSecondaryColor: colors.textSecondary,
  };
};

/**
 * Get club settings
 * Creates default settings if they don't exist
 */
export const getSettings = async (): Promise<ClubSettings> => {
  let settings = await prisma.clubSettings.findUnique({
    where: { id: 1 },
  });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.clubSettings.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return mapSettingsForFrontend(settings);
};

/**
 * Update club settings
 */
export const updateSettings = async (settingsData: ClubSettings): Promise<ClubSettings> => {
  const dbSettings = mapSettingsForDatabase(settingsData);

  const updatedSettings = await prisma.clubSettings.update({
    where: { id: 1 },
    data: dbSettings,
  });

  return mapSettingsForFrontend(updatedSettings);
};
