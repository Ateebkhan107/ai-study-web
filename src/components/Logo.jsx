import Image from "next/image";

export default function Logo({ size, showText = true, forceDark = false, className = "" }) {
  const containerStyle = size ? { width: size, height: size } : {};
  const containerClass = size ? "" : "w-[28px] h-[28px] md:w-[40px] md:h-[40px]";

  // sizes hint: fixed pixel size when provided, otherwise responsive
  const sizesAttr = size ? `${size}px` : "(max-width: 768px) 28px, 40px";

  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      {/* Light Mode Logo */}
      {!forceDark && (
        <div className={`block dark:hidden shrink-0 relative ${containerClass}`} style={containerStyle}>
          <Image
            src="/images/branding/prepzii-logo-light.png"
            alt="Prepzii Logo"
            fill
            sizes={sizesAttr}
            className="object-contain"
            priority
          />
        </div>
      )}

      {/* Dark Mode Logo */}
      <div className={`${forceDark ? "block" : "hidden dark:block"} shrink-0 relative ${containerClass}`} style={containerStyle}>
        <Image
          src="/images/branding/prepzii-logo-dark.png"
          alt="Prepzii Logo"
          fill
          sizes={sizesAttr}
          className="object-contain"
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <span className="text-xl md:text-2xl font-black tracking-tight uppercase">
          PREPZII
        </span>
      )}
    </div>
  );
}