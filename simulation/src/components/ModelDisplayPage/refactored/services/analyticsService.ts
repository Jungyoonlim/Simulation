import { EventData } from '../types';

class AnalyticsService {
  trackEvent(eventName: string, data?: EventData): void {
    // In production, replace with actual analytics implementation (e.g., Google Analytics, Mixpanel, Segment)
    console.log(`[Analytics] Event: ${eventName}`, data);
    
    // Example implementation with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
  }

  trackError(error: Error, context?: EventData): void {
    console.error('[Analytics] Error:', error, context);
    
    // In production, send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    }
  }

  trackTiming(category: string, variable: string, value: number): void {
    console.log(`[Analytics] Timing: ${category} - ${variable}: ${value}ms`);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category
      });
    }
  }

  setUserProperty(name: string, value: string): void {
    console.log(`[Analytics] User Property: ${name} = ${value}`);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', { user_properties: { [name]: value } });
    }
  }
}

export const analytics = new AnalyticsService();
