/**
 * Image Recognition Service using TensorFlow.js MobileNet
 * This service provides client-side image recognition for the Lost and Found feature.
 * MobileNet is a lightweight convolutional neural network designed for mobile and edge devices.
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

class ImageRecognitionService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.categoryMappings = {
      // Map MobileNet categories to user-friendly categories
      'Key': ['key', 'keys', 'car key', 'house key'],
      'Wallet': ['wallet', 'billfold', 'pocketbook'],
      'Cell phone': ['cell phone', 'mobile phone', 'smartphone', 'phone'],
      'Jacket': ['jacket', 'coat', 'windbreaker', 'parka'],
      'Backpack': ['backpack', 'knapsack', 'rucksack'],
      'Sunglasses': ['sunglasses', 'dark glasses', 'shades'],
      'Watch': ['watch', 'wristwatch'],
      'Laptop': ['laptop', 'notebook computer'],
      'Tablet': ['tablet', 'tablet computer', 'iPad'],
      'Camera': ['camera', 'photographic camera'],
      'Water bottle': ['water bottle', 'bottle'],
      'Umbrella': ['umbrella', 'parasol'],
      'Hat': ['hat', 'cap', 'baseball cap'],
      'Glasses': ['glasses', 'eyeglasses', 'spectacles'],
      'Headphones': ['headphones', 'earphones', 'headset'],
      'Charger': ['charger', 'power adapter'],
      'Cable': ['cable', 'cord', 'wire'],
      'Bag': ['bag', 'handbag', 'purse', 'shoulder bag'],
      'Shoes': ['shoe', 'shoes', 'sneaker', 'boot'],
      'Clothing': ['clothing', 'shirt', 't-shirt', 'pants', 'jeans', 'dress'],
      'Jewelry': ['jewelry', 'ring', 'necklace', 'bracelet'],
      'Book': ['book', 'notebook', 'novel'],
      'Document': ['document', 'paper', 'passport', 'id card', 'license']
    };
    
    this.commonLostItems = [
      'Keys', 'Wallet', 'Phone', 'Jacket', 'Backpack', 'Sunglasses', 'Watch', 
      'Laptop', 'Tablet', 'Camera', 'Water bottle', 'Umbrella', 'Hat', 'Glasses',
      'Headphones', 'Charger', 'Cable', 'Bag', 'Shoes', 'Clothing', 'Jewelry',
      'Book', 'Document', 'ID', 'Passport', 'Ticket', 'Money', 'Credit card'
    ];
  }

  /**
   * Initialize the MobileNet model
   */
  async init() {
    if (this.isLoaded) return;
    
    try {
      // Load the MobileNet model
      this.model = await mobilenet.load();
      this.isLoaded = true;
      console.log('MobileNet model loaded successfully');
    } catch (error) {
      console.error('Failed to load MobileNet model:', error);
      throw error;
    }
  }

  /**
   * Recognize objects in an image
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} image - The image to analyze
   * @param {number} [maxResults=5] - Maximum number of results to return
   * @param {number} [threshold=0.2] - Confidence threshold for results
   * @returns {Promise<Array<{className: string, probability: number}>>} Array of recognition results
   */
  async recognizeImage(image, maxResults = 5, threshold = 0.2) {
    if (!this.isLoaded) {
      await this.init();
    }

    try {
      // Ensure the image is in the correct format
      let processedImage = image;
      if (image instanceof File || image instanceof Blob) {
        processedImage = await this.fileToImageElement(image);
      }

      // Run prediction
      const predictions = await this.model.classify(processedImage, maxResults);
      
      // Filter by threshold
      const filteredResults = predictions.filter(pred => pred.probability >= threshold);
      
      // Map to our standard format
      return filteredResults.map(prediction => ({
        className: prediction.className,
        probability: prediction.probability
      }));
    } catch (error) {
      console.error('Error recognizing image:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Extract tags from image recognition results
   * @param {Array<{className: string, probability: number}>} predictions - Recognition results
   * @returns {string[]} Array of relevant tags
   */
  extractTagsFromPredictions(predictions) {
    const tags = new Set();
    
    // Direct matches with our category mappings
    for (const prediction of predictions) {
      const className = prediction.className.toLowerCase();
      
      // Check if this prediction matches any of our predefined categories
      for (const [category, keywords] of Object.entries(this.categoryMappings)) {
        if (keywords.some(keyword => className.includes(keyword))) {
          tags.add(category);
          break;
        }
      }
      
      // Also add the raw class name if it's relevant
      if (prediction.probability > 0.5) {
        // Clean up the class name for display
        const cleanName = className
          .replace(/_/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Capitalize first letter
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        
        // Add to tags if it looks like a reasonable tag
        if (formattedName.length <= 50) {
          tags.add(formattedName);
        }
      }
    }
    
    // Add common lost item categories that might be relevant
    const tagsArray = Array.from(tags);
    
    // If we didn't get good results, add some general categories based on common lost items
    if (tagsArray.length === 0) {
      // Try to match with common lost items
      for (const prediction of predictions) {
        const className = prediction.className.toLowerCase();
        for (const item of this.commonLostItems) {
          if (className.includes(item.toLowerCase())) {
            tags.add(item);
            break;
          }
        }
      }
    }
    
    return Array.from(tags);
  }

  /**
   * Recognize an image and extract relevant tags
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData|File|Blob} image - The image to analyze
   * @returns {Promise<{tags: string[], predictions: Array<{className: string, probability: number}>}>} Recognition results with extracted tags
   */
  async recognizeAndTagImage(image) {
    const predictions = await this.recognizeImage(image);
    const tags = this.extractTagsFromPredictions(predictions);
    
    return {
      tags,
      predictions
    };
  }

  /**
   * Convert a File/Blob to an ImageElement for TensorFlow.js
   * @param {File|Blob} file - The file to convert
   * @returns {Promise<HTMLImageElement>} Image element
   */
  async fileToImageElement(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.model) {
      try {
        // Dispose the model to free up memory
        tf.disposeVariables();
        this.model = null;
        this.isLoaded = false;
        console.log('MobileNet model cleaned up');
      } catch (error) {
        console.error('Error cleaning up model:', error);
      }
    }
  }

  /**
   * Get the category for an image based on recognition results
   * @param {Array<{className: string, probability: number}>} predictions - Recognition results
   * @returns {string} Best category match
   */
  getBestCategory(predictions) {
    if (!predictions || predictions.length === 0) {
      return 'Other';
    }

    // Sort by probability (descending)
    const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
    
    for (const prediction of sortedPredictions) {
      const className = prediction.className.toLowerCase();
      
      // Check against our category mappings
      for (const [category, keywords] of Object.entries(this.categoryMappings)) {
        if (keywords.some(keyword => className.includes(keyword))) {
          return category;
        }
      }
      
      // Check against common lost items
      for (const item of this.commonLostItems) {
        if (className.includes(item.toLowerCase())) {
          return item;
        }
      }
    }
    
    // If no category matched, return the highest confidence prediction
    return sortedPredictions[0].className
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Singleton instance
const imageRecognitionService = new ImageRecognitionService();

export default imageRecognitionService;

export { ImageRecognitionService };