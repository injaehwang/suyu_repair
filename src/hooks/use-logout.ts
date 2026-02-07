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
            const domain = window.location.hostname;
            // Try current domain and dot-prefixed domain for subdomains
            const domains = [undefined, domain, `.${domain}`];
            const paths = ['/', '/api', '/auth'];

            cookies.forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                domains.forEach(d => {
                    paths.forEach(p => {
                        const domainAttr = d ? `; domain=${d}` : '';
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}${domainAttr}`;
                    });
                });
            });
            console.log('[LOGOUT] Manual cookie cleanup attempted');
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
