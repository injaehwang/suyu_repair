import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Naver from "next-auth/providers/naver"
import Credentials from "next-auth/providers/credentials"

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
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                const apiUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${apiUrl}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });

                if (!response.ok) return null;

                const user = await response.json();
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
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
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (account && user) {
                if (account.provider === 'credentials') {
                    // Credentials login: user.id is already the backend UUID
                    token.sub = user.id;
                    token.id = user.id;
                } else {
                    // Social login: sync with backend to get UUID
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

                        if (dbUser && dbUser.id) {
                            token.sub = dbUser.id;
                            token.id = dbUser.id;
                        }
                    } catch (error) {
                        // Log error but don't block sign-in
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) || (token.sub as string);
            }
            return session;
        },
    },
})
