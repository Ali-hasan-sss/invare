// Thawani Payment Gateway Configuration
export const THAWANI_CONFIG = {
  // Environment: 'uat' | 'production'
  environment: (process.env.NEXT_PUBLIC_THAWANI_ENV || "uat") as
    | "uat"
    | "production",

  // UAT Credentials
  uat: {
    baseUrl: "https://uatcheckout.thawani.om",
    secretKey: "rRQ26GcsZzoEhbrP2HZvLYDbn9C9et",
    publishableKey: "HGvTMLDssJghr9tlN9gr4DVYt0qyBy",
  },

  // Production Credentials (to be added)
  production: {
    baseUrl: process.env.NEXT_PUBLIC_THAWANI_BASE_URL || "",
    secretKey: process.env.NEXT_PUBLIC_THAWANI_SECRET_KEY || "",
    publishableKey: process.env.NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY || "",
  },

  // Get current config based on environment
  getConfig() {
    return this[this.environment];
  },

  // Get checkout URL
  getCheckoutUrl(sessionId: string): string {
    const config = this.getConfig();
    return `${config.baseUrl}/pay/${sessionId}?key=${config.publishableKey}`;
  },
};

// Payment Methods
export enum PaymentMethod {
  THAWANI = "thawani",
  // Add other payment methods here
  STRIPE = "stripe",
  PAYPAL = "paypal",
}

// Payment Method Labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.THAWANI]: "Thawani",
  [PaymentMethod.STRIPE]: "Stripe",
  [PaymentMethod.PAYPAL]: "PayPal",
};
