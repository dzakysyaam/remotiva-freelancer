export default function IconAsset({ name, alt = "", size = 40, className = "" }) {
  return (
    <img
      src={`/assets/icons/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      className={`icon-asset ${className}`.trim()}
      loading="lazy"
      draggable="false"
    />
  );
}
