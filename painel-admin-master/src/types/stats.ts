export interface GlobalStats {
  totalTenants: number;
  totalBookings: number;
  totalServices: number;
  bookingsToday: number;
  newTenantsThisMonth: number;
  growth: {
    tenants: number; // percentage
    bookings: number; // percentage
  };
  topTenants: Array<{
    id: string;
    name: string;
    bookingsCount: number;
  }>;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface MonthlyData {
  month: string;
  newTenants: number;
  totalBookings: number;
}

export interface BookingStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface DayOfWeekData {
  day: string;
  bookings: number;
}
