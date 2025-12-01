export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="bg-orb bg-orb-1 -top-[200px] -left-[200px]" />
      <div className="bg-orb bg-orb-2 top-[40%] -right-[150px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid" />

      {/* Noise overlay */}
      <div className="bg-noise absolute inset-0" />
    </div>
  );
}
