export interface StudentData {
  _id: string;
  name: string;
  age: number;
  phoneNumber?: string;
  email?: string;
  address?: string;
  membershipType: 'Basic' | 'Premium' | 'Couple' | 'Student' | 'Custom';
  status: 'Active' | 'Expired' | 'Suspended';
  subscriptionEndDate: string | number;
  subscriptionStartDate?: string | number;
  paymentAmount?: number;
  fingerprintId?: number;
  coupleGroupId?: string | null;
  couplePartnerId?: string | null;
  couplePartner?: {
    _id: string;
    name: string;
    phoneNumber?: string;
    email?: string;
    membershipType?: string;
    status?: string;
  } | null;
  duration?: number;
  customAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}
