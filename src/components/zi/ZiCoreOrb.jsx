export default function ZiCoreOrb({
  state = "idle",
  size = "md",
  className = "",
  showRings = true,
}) {
  const sizeClass =
    size === "lg"
      ? "h-24 w-24"
      : size === "sm"
      ? "h-10 w-10"
      : "h-16 w-16";

  return (
    <span
      className={`zi-core-orb ${sizeClass} ${className}`}
      data-state={state}
      aria-hidden="true"
    >
      {showRings ? (
        <>
          <span className="zi-core-orb__ring zi-core-orb__ring--outer" />
          <span className="zi-core-orb__ring zi-core-orb__ring--inner" />
        </>
      ) : null}
      <span className="zi-core-orb__glow" />
      <span className="zi-core-orb__surface" />
      <span className="zi-core-orb__scan" />
    </span>
  );
}
