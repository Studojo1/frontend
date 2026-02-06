import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = "78431f4d81860b16a66d35a343d0618e";

let isInitialized = false;

// Initialize Mixpanel
export function initMixpanel() {
  if (typeof window === "undefined") return;
  
  try {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
    persistence: "localStorage",
    autocapture: true,
    record_sessions_percent: 100,
  });
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Mixpanel:", error);
    isInitialized = false;
  }
}

// Identify a user
export function identifyUser(userId: string, properties?: {
  email?: string;
  name?: string;
  [key: string]: any;
}) {
  if (typeof window === "undefined") return;
  
  // Ensure Mixpanel is initialized
  if (!isInitialized) {
    try {
      initMixpanel();
    } catch (error) {
      return;
    }
  }
  
  try {
  mixpanel.identify(userId);
  
  if (properties) {
    mixpanel.people.set({
      $name: properties.name,
      $email: properties.email,
      ...properties,
    });
    }
  } catch (error) {
    // Silently fail to avoid breaking the app
  }
}

// Track an event
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;
  
  // Ensure Mixpanel is initialized before tracking
  if (!isInitialized) {
    // Try to initialize if not already done
    try {
      initMixpanel();
    } catch (error) {
      // Silently fail to avoid breaking the app
      return;
    }
  }
  
  try {
    // Check if mixpanel is initialized by checking if it has the track method
    if (mixpanel && typeof mixpanel.track === "function") {
  mixpanel.track(eventName, properties);
    }
  } catch (error) {
    // Silently fail to avoid breaking the app - don't log to avoid console spam
    // The error is likely due to Mixpanel hooks not being set up, which happens
    // if init() hasn't completed or failed
  }
}

// Reset Mixpanel (on logout)
export function resetMixpanel() {
  if (typeof window === "undefined") return;
  
  try {
    if (isInitialized && mixpanel && typeof mixpanel.reset === "function") {
  mixpanel.reset();
    }
  } catch (error) {
    // Silently fail to avoid breaking the app
  }
}

