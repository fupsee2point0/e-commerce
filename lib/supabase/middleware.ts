import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (
    request.nextUrl.pathname.startsWith("/admin_panel") &&
    !request.nextUrl.pathname.startsWith("/admin_panel/login") &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin_panel/login"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname === "/admin_panel/login" && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin_panel"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
