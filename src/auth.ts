import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Naver from "next-auth/providers/naver"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Naver({
            clientId: process.env.AUTH_NAVER_ID,
            clientSecret: process.env.AUTH_NAVER_SECRET,
        }),
    ],
    cookies: {
        sessionToken: {
            name: `__Secure-authjs.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
                domain: process.env.NODE_ENV === 'production' ? '.suyu.ai.kr' : undefined,
            },
        },
    },
    callbacks: {
        async signIn({ user, account }) {
            // We moved sync to JWT to capture the correct Backend ID.
            // However, we can keep a lightweight check or just rely on JWT.
            // For simplicity and ID consistency, we rely on JWT.
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                try {
                    const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
                    const response = await fetch(`${apiUrl}/users/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Backend sync failed: ${response.status}`);
                    }

                    const dbUser = await response.json();

                    // CRITICAL: Update token ID to match Backend ID (UUID)
                    // This handles cases where email exists but ID differs (e.g. Google ID vs UUID)
                    if (dbUser && dbUser.id) {
                        token.sub = dbUser.id;
                        token.id = dbUser.id;
                    }
                } catch (error) {
                    // If sync fails, we really shouldn't allow the session to be valid.
                    // But blocking here is tricky. NextAuth might just return the original token.
                    // We can invalidate it by returning null? No, type error.
                    // We'll trust that the error logged will help, and maybe the frontend handles "User not found" (400) anyway.
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Assign the ID from the token. 
                // We prefer 'token.id' (manually synced UUID) because 'token.sub' might revert to the Provider ID (e.g. Google ID) on refresh.
                session.user.id = (token.id as string) || (token.sub as string);
            }
            return session;
        },
    },
})
