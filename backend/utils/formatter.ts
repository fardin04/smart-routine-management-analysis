/**
 * Utility functions for academic schedule and routine formatting
 */

export interface TimeSlot {
  slot: number;
  time: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { slot: 1, time: '8:50 AM - 10:00 AM' },
  { slot: 2, time: '10:05 AM - 11:15 AM' },
  { slot: 3, time: '11:20 AM - 12:30 PM' },
  { slot: 4, time: '12:35 PM - 1:45 PM' },
  { slot: 5, time: '1:50 PM - 3:00 PM' },
  { slot: 6, time: '3:05 PM - 4:15 PM' },
  { slot: 7, time: '4:20 PM - 5:30 PM' },
  { slot: 8, time: '5:35 PM - 6:45 PM' }
];

/**
 * Returns the human-readable string range for a given slot index.
 */
export const getSlotTime = (slotIndex: number): string => {
  const match = TIME_SLOTS.find(ts => ts.slot === slotIndex);
  return match ? match.time : 'Unknown Slot';
};

/**
 * Validates alphanumeric ID patterns.
 */
export const isValidId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};
