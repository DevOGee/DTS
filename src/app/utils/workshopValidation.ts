import { Workshop } from '../data/mockData';

/**
 * Validate a workshop against business rules.
 * Returns an array of error messages. If empty, the workshop is valid.
 */
export const validateWorkshop = (workshop: Workshop, existingWorkshops: Workshop[]): string[] => {
  const errors: string[] = [];
  // Rule: maximum duration 15 days
  if (workshop.numberOfDays > 15) {
    errors.push('Workshop duration cannot exceed 15 days.');
  }
  // Rule: only one workshop can be active at a time
  if (workshop.status === 'Active') {
    const anotherActive = existingWorkshops.find(w => w.id !== workshop.id && w.status === 'Active');
    if (anotherActive) {
      errors.push(`Another workshop "${anotherActive.name}" is already active. Only one active workshop is allowed.`);
    }
  }
  return errors;
};
