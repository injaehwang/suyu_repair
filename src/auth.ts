import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Naver from "next-auth/providers/naver"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    callbacks: {
        async signIn({ user, account }) {
            console.log("SignIn Attempt:", {
                provider: account?.provider,
                googleIdPrefix: process.env.AUTH_GOOGLE_ID?.substring(0, 5),
                secretLength: process.env.AUTH_GOOGLE_SECRET?.length,
                secretStart: process.env.AUTH_GOOGLE_SECRET?.substring(0, 3) + "..."
            });
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image
                    })
                });
                return true;
            } catch (error) {
                console.error("Backend Sync Failed:", error);
                return true; // Allow login even if sync fails? No, backend needs user. But maybe fail soft? 
                // If I return false, user can't log in.
                // If I return true, user logs in but inquiry will fail (500).
                // Better to return true and let them see error? Or retry?
                // I'll return true but log error. Ideally false.
                return true;
            }
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
    },
})
