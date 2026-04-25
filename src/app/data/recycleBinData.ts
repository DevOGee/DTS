export type RecyclableItemType = 'course' | 'participant' | 'user' | 'payment' | 'attendance' | 'checklist' | 'workshop' | 'programme' | 'group';

export interface RecyclableItem {
  id: string;
  type: RecyclableItemType;
  originalId: string; // Original ID before deletion
  data: any; // The complete original data
  deletedAt: Date;
  deletedBy: string; // User who deleted it
  moduleName: string; // Module where it was deleted from
  reason?: string; // Optional deletion reason
}

export interface RecycleBinStats {
  totalItems: number;
  itemsByType: Record<RecyclableItemType, number>;
  itemsExpiringSoon: number; // Items expiring in next 7 days
  expiredItems: number; // Items past 60 days
}

// Auto-deletion configuration
export const RECYCLE_BIN_CONFIG = {
  RETENTION_DAYS: 60,
  EXPIRING_SOON_DAYS: 7,
  CLEANUP_INTERVAL_HOURS: 24, // Check for expired items daily
};

// Helper functions
export const isItemExpired = (deletedAt: Date): boolean => {
  const now = new Date();
  const daysSinceDeletion = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceDeletion > RECYCLE_BIN_CONFIG.RETENTION_DAYS;
};

export const isItemExpiringSoon = (deletedAt: Date): boolean => {
  const now = new Date();
  const daysSinceDeletion = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilExpiration = RECYCLE_BIN_CONFIG.RETENTION_DAYS - daysSinceDeletion;
  return daysUntilExpiration <= RECYCLE_BIN_CONFIG.EXPIRING_SOON_DAYS && daysUntilExpiration > 0;
};

export const getDaysUntilExpiration = (deletedAt: Date): number => {
  const now = new Date();
  const daysSinceDeletion = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, RECYCLE_BIN_CONFIG.RETENTION_DAYS - daysSinceDeletion);
};

export const formatDeletionDate = (deletedAt: Date): string => {
  return deletedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
