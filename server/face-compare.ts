// Basic face comparison using pixel difference
// In production, use a proper face recognition library
export function compareFaceImages(stored: string, provided: string): boolean {
  if (!stored || !provided) return false;

  try {
    const storedBuffer = Buffer.from(stored.split(',')[1], 'base64');
    const providedBuffer = Buffer.from(provided.split(',')[1], 'base64');

    // Basic validation checks
    if (storedBuffer.length < 1000 || providedBuffer.length < 1000) {
      console.warn('Face image too small or invalid');
      return false;
    }

    // Check if images are of similar size
    const sizeDiff = Math.abs(storedBuffer.length - providedBuffer.length);
    const sizeRatio = Math.max(storedBuffer.length, providedBuffer.length) / 
                     Math.min(storedBuffer.length, providedBuffer.length);

    // Images should be roughly similar in size and not too different
    if (sizeDiff > 10000 || sizeRatio > 1.5) {
      console.warn('Face images too different in size');
      return false;
    }

    
    let matchingBytes = 0;
    const sampleSize = Math.min(1000, storedBuffer.length, providedBuffer.length);

    for (let i = 0; i < sampleSize; i++) {
      if (Math.abs(storedBuffer[i] - providedBuffer[i]) < 30) {
        matchingBytes++;
      }
    }

    const similarity = matchingBytes / sampleSize;
    console.log('Face similarity score:', similarity);

    return similarity >= 0.83; // Arbitrary threshold, adjust based on testing
  } catch (err) {
    console.error('Face comparison error:', err);
    return false;
  }
}