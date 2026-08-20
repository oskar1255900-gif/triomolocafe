export const Waves = () => (
  <div className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none">
    <svg
      className="w-[200%] h-[120px] wave-anim-slow"
      viewBox="0 0 2880 120"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 60 C 360 20 720 100 1440 60 C 2160 20 2520 100 2880 60 L2880 120 L0 120 Z"
        fill="#0F4C81"
        opacity="0.35"
      />
    </svg>
    <svg
      className="w-[200%] h-[90px] wave-anim absolute bottom-0"
      viewBox="0 0 2880 90"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 45 C 360 80 720 10 1440 45 C 2160 80 2520 10 2880 45 L2880 90 L0 90 Z"
        fill="#081A2C"
        opacity="0.9"
      />
    </svg>
  </div>
);
