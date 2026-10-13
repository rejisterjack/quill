/**
 * Client-safe CSRF utilities.
 *
 * This module is intentionally free of `node:crypto` and server-only secrets so
 * it can be imported from client components without pulling the server-side
 * CSRF module (which throws when `CSRF_SECRET` is unavailable in the browser
 * bundle) into client code.
 *
 * Server-side token generation/validation lives in `@/lib/security/csrf`.
 */

// =============================================================================
// React Components
// =============================================================================

/**
 * CSRF Token Input Component
 *
 * Usage:
 * ```tsx
 * <form action="/api/something" method="POST">
 *   <CsrfTokenInput />
 *   // other form fields
 * </form>
 * ```
 */
export function CsrfTokenInput(): React.ReactElement {
  // This will be populated by the server or client-side JavaScript
  return <input type="hidden" name="_csrf" id="csrf-token-input" data-csrf-token="" />;
}

interface CsrfTokenScriptProps {
  nonce?: string;
}

/**
 * Script to initialize CSRF token on client
 */
export function CsrfTokenScript({ nonce }: CsrfTokenScriptProps): React.ReactElement {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Fetch CSRF token from API and set in forms
            async function initCsrf() {
              try {
                const response = await fetch('/api/csrf/token');
                if (response.ok) {
                  const body = await response.json();
                  // Endpoint returns { success, data: { token } } — unwrap the envelope
                  const token = body && body.data ? body.data.token : body && body.token;
                  if (!token) return;
                  // Set token in all forms
                  document.querySelectorAll('input[name="_csrf"]').forEach(input => {
                    input.value = token;
                  });
                  // Set token in meta tag for JS fetch requests
                  let meta = document.querySelector('meta[name="csrf-token"]');
                  if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'csrf-token';
                    document.head.appendChild(meta);
                  }
                  meta.content = token;
                }
              } catch (e) {
                // CSRF endpoint not available — CSP nonce protection is used instead
              }
            }

            // Initialize on page load
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initCsrf);
            } else {
              initCsrf();
            }
          })();
        `,
      }}
    />
  );
}

// =============================================================================
// Client-side helpers
// =============================================================================

/**
 * Get CSRF token for fetch requests (client-side)
 * @returns The CSRF token from the meta tag
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') || null;
}

/**
 * Fetch with CSRF token automatically included
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCsrfToken();

  const headers = new Headers(options.headers);

  if (token && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
    headers.set('x-csrf-token', token);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
