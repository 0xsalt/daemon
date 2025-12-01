// Analytics tracking for daemon.danielmiessler.com
// Sends pageview data to ULAnalytics

interface AnalyticsData {
  serverName: string;
  timestamp: number;
  method: string;
  tool?: string | null;
  location: {
    city: string;
    region?: string;
    country: string;
  };
  browser: string;
  browserVersion?: string;
  os: string;
  userAgent: string;
  clientIp: string;
  referer: string;
  origin: string;
  pageUrl?: string;
  pageTitle?: string;
}

// Parse user agent for browser and OS info
function parseUserAgent(): { browser: string; browserVersion: string; os: string } {
  const ua = navigator.userAgent;
  
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    if (match) browserVersion = match[1];
  }
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return { browser, browserVersion, os };
}

// Get location from IP (using Cloudflare's CF-IPCountry header if available)
async function getLocation(): Promise<{ city: string; country: string; region?: string }> {
  // Try to get location from an IP geolocation service
  // For now, we'll use Unknown and rely on server-side detection
  return {
    city: 'Unknown',
    country: 'Unknown',
    region: 'Unknown'
  };
}

// Send analytics data to ULAnalytics
async function sendAnalytics(data: AnalyticsData): Promise<void> {
  try {
    await fetch('https://ul.live/api/mcp-traffic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Analytics error:', error);
  }
}

// Track a page view
export async function trackPageView(url?: string, title?: string): Promise<void> {
  // Only track in production
  if (import.meta.env.DEV) return;
  
  const { browser, browserVersion, os } = parseUserAgent();
  const location = await getLocation();
  
  const analyticsData: AnalyticsData = {
    serverName: 'daemon-site',
    timestamp: Date.now(),
    method: 'pageview',
    location,
    browser,
    browserVersion,
    os,
    userAgent: navigator.userAgent,
    clientIp: 'Unknown', // Will be detected server-side
    referer: document.referrer || 'Direct',
    origin: window.location.origin,
    pageUrl: url || window.location.href,
    pageTitle: title || document.title
  };
  
  await sendAnalytics(analyticsData);
}

// Initialize analytics tracking
export function initAnalytics(router: any): void {
  // Only initialize in production and client-side
  if (import.meta.env.DEV || import.meta.env.SSR) return;
  
  // Track initial page load
  if (typeof window !== 'undefined') {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      trackPageView();
    } else {
      window.addEventListener('load', () => trackPageView());
    }
    
    // Track route changes (for SPA navigation)
    if (router) {
      router.onAfterRouteChanged = (to: string) => {
        // Small delay to ensure new page title is set
        setTimeout(() => {
          trackPageView(to, document.title);
        }, 100);
      };
    }
  }
}

// Export for manual tracking if needed
export default {
  trackPageView,
  initAnalytics
};