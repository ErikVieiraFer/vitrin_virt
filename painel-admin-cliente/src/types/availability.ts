export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface DayAvailability {
  enabled: boolean;
  timeSlot: TimeSlot;
  slotDuration: number; // in minutes (15, 30, 45, 60)
}

export interface WeekAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface Availability {
  id: string;
  tenantId: string;
  weekAvailability: WeekAvailability;
  createdAt: Date;
  updatedAt: Date;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DEFAULT_DAY_AVAILABILITY: DayAvailability = {
  enabled: false,
  timeSlot: {
    start: '09:00',
    end: '18:00',
  },
  slotDuration: 30,
};

export const DEFAULT_WEEK_AVAILABILITY: WeekAvailability = {
  monday: DEFAULT_DAY_AVAILABILITY,
  tuesday: DEFAULT_DAY_AVAILABILITY,
  wednesday: DEFAULT_DAY_AVAILABILITY,
  thursday: DEFAULT_DAY_AVAILABILITY,
  friday: DEFAULT_DAY_AVAILABILITY,
  saturday: DEFAULT_DAY_AVAILABILITY,
  sunday: DEFAULT_DAY_AVAILABILITY,
};
