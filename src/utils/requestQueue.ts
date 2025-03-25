import React from 'react';

/**
 * A utility class for managing request queues with TypeScript support.
 * Handles concurrent requests and prevents race conditions.
 */
export class RequestQueue<T = unknown> {
  private queue: Array<() => Promise<T>> = [];
  private isProcessing = false;
  private maxConcurrent: number;
  private currentRequests = 0;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a request to the queue
   * @param request - A function that returns a Promise
   * @returns A Promise that resolves with the result of the request
   */
  async enqueue(request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentRequests--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  /**
   * Process the next request in the queue if possible
   */
  private processQueue(): void {
    if (this.isProcessing || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    const nextRequest = this.queue.shift();
    if (!nextRequest) {
      return;
    }

    this.isProcessing = true;
    this.currentRequests++;
    nextRequest().finally(() => {
      this.isProcessing = false;
      this.processQueue();
    });
  }

  /**
   * Clear all pending requests from the queue
   */
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
    this.currentRequests = 0;
  }

  /**
   * Get the current number of pending requests
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Get the current number of active requests
   */
  getActiveCount(): number {
    return this.currentRequests;
  }
}

// Create a singleton instance for global use
export const globalRequestQueue = new RequestQueue();

/**
 * A hook for using the request queue in React components
 * @param maxConcurrent - Maximum number of concurrent requests
 * @returns The request queue instance
 */
export function useRequestQueue<T = unknown>(maxConcurrent?: number) {
  const queueRef = React.useRef<RequestQueue<T>>(new RequestQueue<T>(maxConcurrent));

  React.useEffect(() => {
    return () => {
      queueRef.current.clear();
    };
  }, []);

  return queueRef.current;
} 