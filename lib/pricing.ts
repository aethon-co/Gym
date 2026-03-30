export const MEMBERSHIP_PRICES = {
  Basic: 1000,
  Premium: 2000,
  Couple: 3000,
  Student: 500,
} as const;

export type MembershipType = keyof typeof MEMBERSHIP_PRICES | "Custom";

export const getMemberBaseAmount = (member: {
  membershipType?: string | null;
  customAmount?: number | null;
  paymentAmount?: number | null;
  duration?: number | null;
}) => {
  if (member.membershipType === "Custom") {
    return Number(member.customAmount || member.paymentAmount || 0);
  }

  if (member.membershipType && member.membershipType in MEMBERSHIP_PRICES) {
    return MEMBERSHIP_PRICES[member.membershipType as keyof typeof MEMBERSHIP_PRICES];
  }

  const duration = Number(member.duration || 1);
  const paymentAmount = Number(member.paymentAmount || 0);
  return duration > 0 ? Math.round(paymentAmount / duration) : paymentAmount;
};

export const getRenewalAmount = (membershipType: string, months: number, customAmount?: number | null) => {
  if (membershipType === "Custom") {
    return Number(customAmount || 0) * months;
  }

  if (membershipType in MEMBERSHIP_PRICES) {
    return MEMBERSHIP_PRICES[membershipType as keyof typeof MEMBERSHIP_PRICES] * months;
  }

  return 0;
};
