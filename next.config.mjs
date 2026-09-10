/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      // Cover images for the auto-generated blogs are served by the blogs
      // backend out of /uploads/covers/YYYY/MM/.
      {
        protocol: "https",
        hostname: "blogsautobackend.entertainmentcouch.com",
        pathname: "/uploads/**",
      },
    ],
  },
  // The "Create New Blog" form submits its cover image through a Server
  // Action, which Next.js caps at 1MB by default — well under the 5MB our
  // own validation in blog-actions.js allows. Without raising this, any
  // upload between 1MB and 5MB gets killed by Next before our validation
  // even runs, and the browser just sees a failed connection. Match it to
  // our 5MB app-level cap, with headroom for multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
