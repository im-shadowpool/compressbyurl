import Image from "next/image";

import { classNames } from "@/lib/class-names";
import { media } from "@/lib/media";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span className={classNames("brand-logo", className)}>
      <Image
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 640px) 152px, 184px"
        src={media.brand.logo.src}
      />
    </span>
  );
}
