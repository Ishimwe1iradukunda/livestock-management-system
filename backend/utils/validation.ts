import { APIError } from "encore.dev/api";

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw APIError.invalidArgument("invalid email format");
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw APIError.invalidArgument(`${fieldName} is required`);
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (value <= 0) {
    throw APIError.invalidArgument(`${fieldName} must be positive`);
  }
}

export function validateDateRange(startDate: Date, endDate: Date): void {
  if (startDate > endDate) {
    throw APIError.invalidArgument("start date must be before end date");
  }
}

export function validateStringLength(value: string, min: number, max: number, fieldName: string): void {
  if (value.length < min || value.length > max) {
    throw APIError.invalidArgument(`${fieldName} must be between ${min} and ${max} characters`);
  }
}
