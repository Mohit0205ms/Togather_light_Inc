import { loginSchema, registrationSchema, LoginFormData, RegistrationFormData } from '../../src/utils/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should accept any non-empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'abc'
      };

      expect(() => loginSchema.parse(invalidData)).not.toThrow();
    });
  });

  describe('registrationSchema', () => {
    it('should validate correct registration data', () => {
      const validData: RegistrationFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty firstName', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty lastName', () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should reject firstName too short', () => {
      const invalidData = {
        firstName: 'A',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should reject lastName too short', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should validate names with spaces', () => {
      const validData = {
        firstName: 'Maria Jose',
        lastName: 'de los Angeles',
        email: 'maria@example.com',
        password: 'Password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid phone number format', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '123-456-7890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should validate phone numbers with country codes', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+15551234567'
      };

      expect(() => registrationSchema.parse(validData)).not.toThrow();
    });

    it('should reject password without numbers', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });

    it('should reject password without letters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123456',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(invalidData)).toThrow();
    });



    it('should validate email with hyphens and dots', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.smith@example-domain.com',
        password: 'Password123',
        phone: '+1234567890'
      };

      expect(() => registrationSchema.parse(validData)).not.toThrow();
    });
  });
});
