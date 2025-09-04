// Advanced image preprocessing for better OCR results

export class ImagePreprocessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async preprocessImage(file) {
    const img = await this.loadImage(file);
    
    // Apply multiple enhancement techniques
    const enhanced = await this.enhanceImage(img);
    const deskewed = await this.deskewImage(enhanced);
    const denoised = await this.denoiseImage(deskewed);
    const normalized = await this.normalizeContrast(denoised);
    
    return this.imageToBlob(normalized);
  }

  async loadImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  }

  async enhanceImage(img) {
    // Resize to optimal resolution (300 DPI equivalent)
    const targetWidth = Math.min(img.width * 2, 3000);
    const targetHeight = (targetWidth / img.width) * img.height;
    
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    
    // Apply bicubic interpolation for better quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    return this.ctx.getImageData(0, 0, targetWidth, targetHeight);
  }

  async deskewImage(imageData) {
    // Simple deskew using Hough transform approximation
    // This is a simplified version - in production, use a proper library
    const angle = this.detectSkewAngle(imageData);
    
    if (Math.abs(angle) > 0.5) { // Only deskew if angle is significant
      return this.rotateImage(imageData, -angle);
    }
    
    return imageData;
  }

  detectSkewAngle(imageData) {
    // Simplified skew detection
    // In production, use libraries like opencv.js or custom Hough transform
    const edges = this.detectEdges(imageData);
    return this.calculateSkewFromEdges(edges);
  }

  detectEdges(imageData) {
    // Sobel edge detection
    const { data, width, height } = imageData;
    const edges = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Convert to grayscale
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        
        // Sobel operators
        const gx = this.getPixelGray(data, width, x-1, y-1) + 2*this.getPixelGray(data, width, x-1, y) + this.getPixelGray(data, width, x-1, y+1)
                  - this.getPixelGray(data, width, x+1, y-1) - 2*this.getPixelGray(data, width, x+1, y) - this.getPixelGray(data, width, x+1, y+1);
        
        const gy = this.getPixelGray(data, width, x-1, y-1) + 2*this.getPixelGray(data, width, x, y-1) + this.getPixelGray(data, width, x+1, y-1)
                  - this.getPixelGray(data, width, x-1, y+1) - 2*this.getPixelGray(data, width, x, y+1) - this.getPixelGray(data, width, x+1, y+1);
        
        const magnitude = Math.sqrt(gx*gx + gy*gy);
        edges[idx] = edges[idx + 1] = edges[idx + 2] = magnitude;
        edges[idx + 3] = 255;
      }
    }
    
    return { data: edges, width, height };
  }

  getPixelGray(data, width, x, y) {
    const idx = (y * width + x) * 4;
    return data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  calculateSkewFromEdges(edges) {
    // Simplified Hough transform for line detection
    // Return angle in degrees
    return 0; // Placeholder - implement proper Hough transform
  }

  rotateImage(imageData, angle) {
    // Rotate image by given angle
    // Placeholder implementation
    return imageData;
  }

  async denoiseImage(imageData) {
    // Gaussian blur to reduce noise
    return this.applyGaussianBlur(imageData, 0.5);
  }

  applyGaussianBlur(imageData, sigma) {
    // Simple Gaussian blur implementation
    const { data, width, height } = imageData;
    const blurred = new Uint8ClampedArray(data.length);
    
    const kernel = this.generateGaussianKernel(sigma);
    const kernelSize = kernel.length;
    const radius = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;
        
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.max(0, Math.min(width - 1, x + kx));
            const py = Math.max(0, Math.min(height - 1, y + ky));
            const idx = (py * width + px) * 4;
            const weight = kernel[ky + radius][kx + radius];
            
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
            a += data[idx + 3] * weight;
            weightSum += weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        blurred[idx] = r / weightSum;
        blurred[idx + 1] = g / weightSum;
        blurred[idx + 2] = b / weightSum;
        blurred[idx + 3] = a / weightSum;
      }
    }
    
    return { data: blurred, width, height };
  }

  generateGaussianKernel(sigma) {
    const size = Math.ceil(sigma * 3) * 2 + 1;
    const kernel = [];
    const center = Math.floor(size / 2);
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        kernel[y][x] = Math.exp(-(dx*dx + dy*dy) / (2 * sigma * sigma));
      }
    }
    
    return kernel;
  }

  async normalizeContrast(imageData) {
    // Histogram equalization for better contrast
    const { data, width, height } = imageData;
    const normalized = new Uint8ClampedArray(data.length);
    
    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      histogram[gray]++;
    }
    
    // Calculate cumulative distribution
    const cdf = new Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    
    // Normalize
    const totalPixels = width * height;
    const lookupTable = cdf.map(val => Math.round((val / totalPixels) * 255));
    
    // Apply lookup table
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      const newGray = lookupTable[gray];
      
      normalized[i] = newGray;     // R
      normalized[i + 1] = newGray; // G
      normalized[i + 2] = newGray; // B
      normalized[i + 3] = data[i + 3]; // A
    }
    
    return { data: normalized, width, height };
  }

  imageToBlob(imageData) {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    
    return new Promise(resolve => {
      this.canvas.toBlob(resolve, 'image/png', 1.0);
    });
  }
}

export default ImagePreprocessor;
