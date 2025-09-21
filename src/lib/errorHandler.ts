interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private isProduction: boolean;  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | string, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: typeof error === 'object' ? error.stack : undefined,
    };

    // Log error
    this.logError(errorInfo, context);

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoring(errorInfo, context);
    }

    // Show user-friendly message
    this.showUserMessage(errorInfo);
  }

  private logError(errorInfo: ErrorInfo, context?: string): void {
    const logMessage = `[${errorInfo.timestamp}] ${context ? `[${context}]` : ''} ${errorInfo.message}`;
    
    if (this.isProduction) {
      console.error(logMessage);
    } else {
      console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
      console.error('Message:', errorInfo.message);
      console.error('Code:', errorInfo.code);
      console.error('URL:', errorInfo.url);
      console.error('Stack:', errorInfo.stack);
      console.groupEnd();
    }
  }

  private sendToMonitoring(errorInfo: ErrorInfo, context?: string): void {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    // This is a placeholder for actual monitoring service integration
    try {
      // Example: Send to external monitoring service
      // monitoringService.captureException(errorInfo);
      console.warn('Error monitoring not configured');
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }

  private showUserMessage(errorInfo: ErrorInfo): void {
    // Show user-friendly error message
    const userMessage = this.getUserFriendlyMessage(errorInfo.message);
    
    // You can integrate with your notification system here
    // showNotification(userMessage, 'error');
    
    console.warn('User message:', userMessage);
  }

  private getUserFriendlyMessage(errorMessage: string): string {
    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'Network Error': 'Connection failed. Please check your internet connection.',
      'Failed to fetch': 'Unable to load data. Please try again.',
      'Unauthorized': 'Please log in to continue.',
      'Forbidden': 'You don\'t have permission to perform this action.',
      'Not Found': 'The requested resource was not found.',
      'Internal Server Error': 'Something went wrong. Please try again later.',
      'Cart Error': 'Unable to update cart. Please refresh the page.',
      'Payment Error': 'Payment processing failed. Please try again.',
    };

    return errorMap[errorMessage] || 'An unexpected error occurred. Please try again.';
  }

  // Global error handler for unhandled errors
  setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), 'Global');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), 'Unhandled Promise Rejection');
    });
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => void): void {
    if (this.isProduction) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`Performance [${name}]: ${end - start}ms`);
    } else {
      fn();
    }
  }

  // Async error wrapper
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return null;
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler; 