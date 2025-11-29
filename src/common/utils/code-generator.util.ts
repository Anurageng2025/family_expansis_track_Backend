export class CodeGeneratorUtil {
  /**
   * Generate a random 6-digit family code
   */
  static generateFamilyCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a random 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

