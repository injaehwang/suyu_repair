import { useRouter } from 'next/navigation';

export function useLogout() {
    const router = useRouter();

    const logout = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        console.log('[LOGOUT] Starting client-side cleanup...');

        // 1. Clear Local Storage
        try {
            localStorage.clear();
            console.log('[LOGOUT] LocalStorage cleared');
        } catch (err) {
            console.error('[LOGOUT] Failed to clear LocalStorage', err);
        }

        // 2. Clear Session Storage
        try {
            sessionStorage.clear();
            console.log('[LOGOUT] SessionStorage cleared');
        } catch (err) {
            console.error('[LOGOUT] Failed to clear SessionStorage', err);
        }

        // 3. Attempt to clear cookies manually (best effort)
        try {
            const cookies = document.cookie.split(";");
            const domains = [undefined, window.location.hostname, `.${window.location.hostname}`];

            for (const cookie of cookies) {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                domains.forEach(d => {
                    // Try to delete with different path/domain combinations
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${d ? `;domain=${d}` : ''}`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/api/auth${d ? `;domain=${d}` : ''}`;
                });
            }
            console.log('[LOGOUT] Manual cookie deletion attempted');
        } catch (err) {
            console.error('[LOGOUT] Failed to clear cookies manually', err);
        }

        // 4. Redirect to Server-Side Logout Handler
        // This handler (api/logout/route.ts) should handle the HttpOnly cookie expiration
        console.log('[LOGOUT] Redirecting to /api/logout');
        // Add timestamp to prevent caching
        window.location.href = `/api/logout?t=${Date.now()}`;
    };

    return { logout };
}
