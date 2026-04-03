export function sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')           // strip angle brackets
      .replace(/javascript:/gi, '')   // strip js: protocol
      .replace(/on\w+\s*=/gi, '')     // strip event handlers
      .slice(0, 500)                  // hard length cap
  }
  
  export function sanitizeSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')   // only alphanumeric and hyphens
      .replace(/--+/g, '-')          // collapse multiple hyphens
      .replace(/^-|-$/g, '')         // strip leading/trailing hyphens
      .slice(0, 100)
  }
  
  export function sanitizeEmail(input: string): string {
    return input.trim().toLowerCase().slice(0, 254)
  }

  /** Contact / long-form text: strip risky patterns, cap length. */
  export function sanitizeContactMessage(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .slice(0, 5000)
  }