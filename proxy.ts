import { updateSession } from "@/lib/supabase/proxy"

export const config = {
  matcher: ["/((?!_next|_static|_vercel|favicon.ico).*)"],
}

export default updateSession
