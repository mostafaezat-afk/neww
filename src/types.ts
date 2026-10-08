export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  district: string;
  buildingNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
}

export interface WorkingHours {
  enabled: boolean;
  startTime: string; // e.g. '09:00'
  endTime: string;   // e.g. '18:00'
  days: string[];    // Active working days, e.g. ['السبت', 'الأحد', ...]
  autoToggleAvailability?: boolean;
  notes?: string;
}

export interface TechnicianOfferedService {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  basePrice: number;
  isActive: boolean;
  description?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  specialty: string;
  distanceKm: number;
  workingHours?: WorkingHours;
  isAvailableForWork?: boolean;
  offeredServices?: TechnicianOfferedService[];
}

export type TaskStatus = 'in_progress' | 'pending' | 'closed';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'عميل' | 'فني';
  isOnline: boolean;
  rating: number;
  reviewsCount: number;
  balance: number;
  fingerprintAuth: boolean;
  freeRequestsLeft: number; // New client gets 3 free requests
  technicianPoints: number; // 5 points deducted when tech communicates with client
  reputationPoints: number; // Trust score points (e.g. 100 + reviews)
  city?: string;
  specialty?: string;
  workingHours?: WorkingHours;
  isAvailableForWork?: boolean;
  offeredServices?: TechnicianOfferedService[];
}

export interface Task {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  status: TaskStatus;
  description: string;
  price: number;
  createdAt: string;
  scheduledTime: string;
  location: LocationData;
  technician?: Technician;
  offersCount: number;
  isUrgent?: boolean;
  clientName?: string;
  clientPhone?: string;
  isFreeRequestUsed?: boolean;
  images?: string[];
  warrantyDays?: number;
  isRated?: boolean;
  ratingStars?: number;
  ratingComment?: string;
}

export interface RatingReview {
  id: string;
  taskId: string;
  targetName: string;
  targetRole: 'عميل' | 'فني';
  stars: number;
  comment: string;
  date: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  basePrice: number;
  badge?: string;
  color: string;
  active?: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  active: boolean;
  notes?: string;
}

export interface AppSystemConfig {
  appName: string;
  supportPhone: string;
  commissionPercentage: number;
  clientFreeRequestsCount: number;
  techContactPointsCost: number;
  allowEmergencyOrders: boolean;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}

export type NotificationType = 'order_status' | 'offer_received' | 'wallet_recharge' | 'technician_available' | 'system';
export type NotificationTargetRole = 'عميل' | 'فني' | 'all';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  taskId?: string;
  timestamp: string;
  isRead: boolean;
  userPhone?: string; // Target recipient phone
  senderPhone?: string; // Phone of sender to separate recipient vs sender alerts
  targetRole?: NotificationTargetRole; // 'عميل' for clients only, 'فني' for technicians only, 'all' for both
  senderRole?: 'عميل' | 'فني' | 'system' | 'admin';
  senderName?: string;
  data?: Record<string, any>;
}
