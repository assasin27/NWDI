export interface FreshnessResult {
  score: number; // 0.0 to 1.0, 1.0 being freshest
  status: 'fresh' | 'semi-fresh' | 'rotten';
  confidence: number;
}

export const freshnessService = {
  async analyzeImage(imageElement: HTMLImageElement): Promise<FreshnessResult> {
    // Mock analysis - in production, use ML model
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

    const score = Math.random(); // Random score for demo
    let status: 'fresh' | 'semi-fresh' | 'rotten';
    if (score > 0.7) status = 'fresh';
    else if (score > 0.3) status = 'semi-fresh';
    else status = 'rotten';

    return { score, status, confidence: score };
  },

  async captureImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // prefer rear camera

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
  }
};