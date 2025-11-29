export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export class ResponseUtil {
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode: 200,
    };
  }

  static error(message: string, error?: string, statusCode = 400): ApiResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
    };
  }
}

