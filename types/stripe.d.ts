declare module "stripe" {
  interface StripeConfig {
    apiVersion?: string;
  }

  namespace Stripe {
    namespace Checkout {
      namespace SessionCreateParams {
        interface LineItem {
          price_data?: Record<string, unknown>;
          quantity?: number;
          [key: string]: unknown;
        }
      }
    }
  }

  class Stripe {
    constructor(apiKey: string, config?: StripeConfig);
    checkout: {
      sessions: {
        create(params: Record<string, unknown>): Promise<{ url?: string }>;
        retrieve(
          id: string,
          params?: Record<string, unknown>,
        ): Promise<Record<string, unknown> & { line_items?: { data: Array<Record<string, unknown>> } }>; 
      };
    };
  }

  export = Stripe;
}
