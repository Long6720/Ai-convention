import { UserFormData } from '../types/User';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  static validateUser(user: Partial<UserFormData>): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!user.name || user.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (user.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (user.name.trim().length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    // Email validation
    if (!user.email || user.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(user.email)) {
      errors.push('Please enter a valid email address');
    }

    // Role validation
    if (!user.role || user.role.trim().length === 0) {
      errors.push('Role is required');
    } else if (!this.isValidRole(user.role)) {
      errors.push('Please select a valid role');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidRole(role: string): boolean {
    const validRoles = ['admin', 'user', 'moderator'];
    return validRoles.includes(role);
  }

  static sanitizeUserData(data: UserFormData): UserFormData {
    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role.trim()
    };
  }
}
