export interface FreshnessResult {
  status: 'fresh' | 'stale';
  confidence: number; // 0-1, higher = more confident
  score: number; // Probability of being stale (0-1)
  is_fresh: boolean;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A';
  description: string;
  error?: string;
}

export interface FreshnessPrediction {
  success: boolean;
  prediction: FreshnessResult;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

export const freshnessService = {
  /**
   * Analyze product image freshness using ML model
   * @param imageSource - Base64 data URL, File object, or image URL
   * @returns Freshness prediction result
   */
  async analyzeImage(imageSource: string | File | HTMLImageElement): Promise<FreshnessResult> {
    try {
      // Try backend API first
      let imageData: string;

      // Convert different input types to base64
      if (imageSource instanceof File) {
        imageData = await this.fileToBase64(imageSource);
      } else if (imageSource instanceof HTMLImageElement) {
        imageData = await this.imageElementToBase64(imageSource);
      } else {
        imageData = imageSource;
      }

      // Call backend API with timeout
      const response = await fetch(`${API_BASE_URL}/products/predict-freshness/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `image=${encodeURIComponent(imageData)}`,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: FreshnessPrediction = await response.json();

      if (!result.success || result.prediction.status === 'error') {
        throw new Error(result.prediction.error || 'Prediction failed');
      }

      return result.prediction;
    } catch (error) {
      console.error('Backend freshness service unavailable:', error);
      throw error;
    }
  },

  /**
   * Check ML model status from backend
   */
  async checkModelStatus(): Promise<{
    model_exists: boolean;
    model_loaded: boolean;
    status: 'ready' | 'not_trained' | 'error';
    model_path?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/model-status/`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        return {
          model_exists: false,
          model_loaded: false,
          status: 'error',
          error: `Backend service unavailable (${response.status})`
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Backend freshness service unavailable:', error);
      return {
        model_exists: false,
        model_loaded: false,
        status: 'error',
        error: 'Backend freshness service unavailable'
      };
    }
  },

  /**
   * Capture image from camera or file upload
   */
  async captureImage(options?: { preferCamera?: boolean }): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // Prefer rear camera on mobile devices
      if (options?.preferCamera !== false) {
        input.capture = 'environment';
      }

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };

      input.click();
    });
  },

  /**
   * Analyze image from camera capture
   * Convenience method that combines captureImage and analyzeImage
   */
  async analyzeFromCamera(options?: { preferCamera?: boolean }): Promise<FreshnessResult> {
    const imageData = await this.captureImage(options);
    return this.analyzeImage(imageData);
  },

  /**
   * Helper: Convert File to base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Helper: Convert HTMLImageElement to base64
   */
  async imageElementToBase64(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get freshness status color for UI
   */
  getStatusColor(status: string, grade?: string): string {
    if (status === 'error') return 'bg-gray-500 text-white';

    // Grade-based colors
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-500 text-white';
      case 'B':
        return 'bg-lime-500 text-white';
      case 'C':
        return 'bg-yellow-500 text-black';
      case 'D':
        return 'bg-orange-500 text-white';
      case 'F':
        return 'bg-red-500 text-white';
      default:
        return status === 'fresh' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
    }
  },

};