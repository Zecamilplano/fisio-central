import type { NextConfig } from "next"

function getSupabaseImagePattern() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return []

  try {
    const { hostname, protocol } = new URL(supabaseUrl)
    const imageProtocol = protocol.slice(0, -1)
    if (imageProtocol !== "http" && imageProtocol !== "https") return []

    return [
      {
        protocol: imageProtocol,
        hostname,
        pathname: "/storage/v1/object/**",
      },
    ]
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["react-calendar"],
  images: {
    remotePatterns: getSupabaseImagePattern(),
  },
}

export default nextConfig
