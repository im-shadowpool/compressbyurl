import type { CSSProperties, HTMLAttributes } from "react";

export interface MaterialSymbolProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  name: string;
  label?: string;
  size?: 20 | 24 | 32;
  filled?: boolean;
}

export function MaterialSymbol({
  name,
  label,
  size = 24,
  filled = false,
  className,
  style,
  ...props
}: MaterialSymbolProps) {
  const iconStyle: CSSProperties = {
    fontSize: size,
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
    ...style,
  };

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={["material-symbols-outlined", "material-symbol", className]
        .filter(Boolean)
        .join(" ")}
      role={label ? "img" : undefined}
      style={iconStyle}
      {...props}
    >
      {name}
    </span>
  );
}
