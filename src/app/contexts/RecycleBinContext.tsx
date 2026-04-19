import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  RecyclableItem, 
  RecyclableItemType, 
  RecycleBinStats,
  RECYCLE_BIN_CONFIG,
  isItemExpired,
  isItemExpiringSoon,
  getDaysUntilExpiration
} from '../data/recycleBinData';

export interface RecycleBinContextType {
  recycledItems: RecyclableItem[];
  stats: RecycleBinStats;
  addToRecycleBin: (item: Omit<RecyclableItem, 'id' | 'deletedAt'>) => void;
  restoreFromRecycleBin: (itemId: string) => boolean;
  permanentlyDelete: (itemId: string) => void;
  emptyRecycleBin: () => void;
  cleanupExpiredItems: () => number;
  getItemByOriginalId: (originalId: string, type: RecyclableItemType) => RecyclableItem | undefined;
}

const RecycleBinContext = createContext<RecycleBinContextType | undefined>(undefined);

const STORAGE_KEY = 'dts_recycle_bin';

export function RecycleBinProvider({ children }: { children: ReactNode }) {
  const [recycledItems, setRecycledItems] = useState<RecyclableItem[]>([]);

  // Load recycled items from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        const items = saved.map((item: any) => ({
          ...item,
          deletedAt: new Date(item.deletedAt)
        }));
        setRecycledItems(items);
      } catch (error) {
        console.error('Failed to load recycle bin data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever recycled items change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recycledItems));
  }, [recycledItems]);

  // Auto-cleanup expired items on mount and set up periodic cleanup
  useEffect(() => {
    // Initial cleanup
    cleanupExpiredItems();

    // Set up periodic cleanup (every 24 hours)
    const interval = setInterval(() => {
      cleanupExpiredItems();
    }, RECYCLE_BIN_CONFIG.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const stats: RecycleBinStats = {
    totalItems: recycledItems.length,
    itemsByType: recycledItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<RecyclableItemType, number>),
    itemsExpiringSoon: recycledItems.filter(item => isItemExpiringSoon(item.deletedAt)).length,
    expiredItems: recycledItems.filter(item => isItemExpired(item.deletedAt)).length,
  };

  const addToRecycleBin = (item: Omit<RecyclableItem, 'id' | 'deletedAt'>) => {
    const newItem: RecyclableItem = {
      ...item,
      id: `recycled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deletedAt: new Date(),
    };
    
    setRecycledItems(prev => [...prev, newItem]);
  };

  const restoreFromRecycleBin = (itemId: string): boolean => {
    const itemToRestore = recycledItems.find(item => item.id === itemId);
    if (!itemToRestore) return false;

    // Remove from recycle bin
    setRecycledItems(prev => prev.filter(item => item.id !== itemId));
    
    // The actual restoration logic will be handled by individual modules
    // They will listen for this event and restore the item to their respective data stores
    window.dispatchEvent(new CustomEvent('restoreFromRecycleBin', {
      detail: itemToRestore
    }));

    return true;
  };

  const permanentlyDelete = (itemId: string) => {
    setRecycledItems(prev => prev.filter(item => item.id !== itemId));
  };

  const emptyRecycleBin = () => {
    setRecycledItems([]);
  };

  const cleanupExpiredItems = (): number => {
    const expiredItems = recycledItems.filter(item => isItemExpired(item.deletedAt));
    const expiredCount = expiredItems.length;
    
    if (expiredCount > 0) {
      setRecycledItems(prev => prev.filter(item => !isItemExpired(item.deletedAt)));
      console.log(`Cleaned up ${expiredCount} expired items from recycle bin`);
    }
    
    return expiredCount;
  };

  const getItemByOriginalId = (originalId: string, type: RecyclableItemType): RecyclableItem | undefined => {
    return recycledItems.find(item => item.originalId === originalId && item.type === type);
  };

  const value: RecycleBinContextType = {
    recycledItems,
    stats,
    addToRecycleBin,
    restoreFromRecycleBin,
    permanentlyDelete,
    emptyRecycleBin,
    cleanupExpiredItems,
    getItemByOriginalId,
  };

  return (
    <RecycleBinContext.Provider value={value}>
      {children}
    </RecycleBinContext.Provider>
  );
}

export function useRecycleBin() {
  const context = useContext(RecycleBinContext);
  if (!context) {
    throw new Error('useRecycleBin must be used within RecycleBinProvider');
  }
  return context;
}
