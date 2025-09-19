import logoUrl from "@/components/ui/TC-logo-horizontal-blue.png";

interface TouchCareLogoProps {
  className?: string;
  width?: number;
}

const LOGO_ASPECT_RATIO = 265 / 1486;

export default function TouchCareLogo({ className, width }: TouchCareLogoProps) {
  const height = width ? Math.round(width * LOGO_ASPECT_RATIO) : undefined;

  return (
    <img
      src={logoUrl}
      alt="TouchCare"
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
