import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
    // Don't interfere with session management
    // Just let NextAuth handle it
    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|payment).*)"],
}
