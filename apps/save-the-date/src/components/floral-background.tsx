import Image from "next/image";

export function FloralBackground() {
  return (
    <Image
      src="/images/floral-background.png"
      alt=""
      fill
      loading="eager"
      fetchPriority="high"
      sizes="(max-width: 560px) 100vw, 560px"
      className="pointer-events-none object-cover object-center"
    />
  );
}
