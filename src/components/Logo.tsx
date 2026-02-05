type LogoProps = {
  name: string;
  logoUrl?: string | null;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
};

export function Logo({
  name,
  logoUrl,
  showText = true,
  className = "",
  imageClassName = "",
}: LogoProps) {
  return (
    <div className={`flex min-w-0 max-w-full items-center gap-4 md:gap-5 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className={`h-12 w-auto max-w-[160px] shrink-0 object-contain md:h-14 md:max-w-[200px] ${imageClassName}`}
          loading="eager"
        />
      ) : null}
      {showText ? (
        <span className="logo-text text-xl font-semibold leading-tight md:text-2xl">{name}</span>
      ) : null}
    </div>
  );
}
