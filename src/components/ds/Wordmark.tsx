interface WordmarkProps {
  size?: number;
  /** Render as a link when given. */
  href?: string;
  className?: string;
}

/** creativecodecampus wordmark, set in type. Always lowercase, one word. No logo file exists. */
export function Wordmark({ size = 19, href, className = '' }: WordmarkProps) {
  const content = (
    <>
      creativecode<span className="ccc-wordmark__accent">campus</span>
    </>
  );
  const style = { fontSize: size };
  return href ? (
    <a href={href} className={`ccc-wordmark ${className}`} style={style}>
      {content}
    </a>
  ) : (
    <span className={`ccc-wordmark ${className}`} style={style}>
      {content}
    </span>
  );
}
