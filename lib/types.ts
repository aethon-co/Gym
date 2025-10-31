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
  duration?: number;
  customAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}
