import { UserProfile, UserRole } from '../types/court';

export type UrgencyTier = 'Urgent' | 'Normal';

export interface PricingCalculation {
  userCategory: 'Government' | 'Private';
  urgency: UrgencyTier;
  turnaroundText: string;
  ratePerPage: number;
  pages: number;
  subtotalNad: number;
  vatNad: number; // 15% VAT
  totalNad: number;
}

/**
 * Checks if a user is classified as Government for official tariff purposes
 */
export function isGovernmentUser(user: UserProfile): boolean {
  if (user.role === 'government') return true;
  if (user.email) {
    const email = user.email.toLowerCase();
    if (email.endsWith('@judiciary.na') || email.endsWith('@justice.gov.na') || email.endsWith('@moj.gov.na')) {
      return true;
    }
  }
  return false;
}

/**
 * PRICING TIERS:
 * - Government Urgent: N$30 per page, 2-hour turnaround
 * - Government Normal: N$25 per page, 24-hour
 * - Private Urgent: N$41 per page, 2-hour
 * - Private Normal: N$35 per page, 24-hour
 */
export function calculatePricing(
  user: UserProfile,
  urgency: UrgencyTier = 'Normal',
  pages: number = 45
): PricingCalculation {
  const isGov = isGovernmentUser(user);
  let ratePerPage = 25;
  let turnaroundText = '24-hour turnaround';

  if (isGov) {
    if (urgency === 'Urgent') {
      ratePerPage = 30;
      turnaroundText = '2-hour turnaround';
    } else {
      ratePerPage = 25;
      turnaroundText = '24-hour turnaround';
    }
  } else {
    if (urgency === 'Urgent') {
      ratePerPage = 41;
      turnaroundText = '2-hour turnaround';
    } else {
      ratePerPage = 35;
      turnaroundText = '24-hour turnaround';
    }
  }

  const subtotalNad = pages * ratePerPage;
  const vatNad = Number((subtotalNad * 0.15).toFixed(2));
  const totalNad = Number((subtotalNad + vatNad).toFixed(2));

  return {
    userCategory: isGov ? 'Government' : 'Private',
    urgency,
    turnaroundText,
    ratePerPage,
    pages,
    subtotalNad,
    vatNad,
    totalNad,
  };
}
