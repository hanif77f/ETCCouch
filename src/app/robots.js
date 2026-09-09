// While the site is still in development, keep it fully out of search
// engines. Flip the rule back to `allow: "/"` (see prior git history, or
// just swap the two lines below) once it's ready to go live.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
