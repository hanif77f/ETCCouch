import Image from "next/image";

export default function SiteLogo({ className = "", preload = false }) {
  return (
    <span className={`relative block h-12 w-28 shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/logo.webp"
        alt="ETC Entertainment Couch"
        fill
        sizes="128px"
        preload={preload}
        className="object-cover object-center"
      />
    </span>
  );
}
