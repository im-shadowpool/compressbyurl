import Image from "next/image";

import { classNames } from "@/lib/class-names";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span className={classNames("brand-logo", className)}>
      <span className="brand-logo__mark">
        <Image
          alt=""
          className="brand-logo__icon"
          height={40}
          priority={priority}
          src="/icons/brand-avatar.png"
          width={40}
        />
      </span>
      <span className="brand-logo__wordmark">
        <span className="brand-logo__name">CompressBy</span>
        <span className="brand-logo__accent">URL</span>
      </span>
    </span>
  );
}
