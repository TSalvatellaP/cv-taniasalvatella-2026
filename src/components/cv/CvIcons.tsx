export const ResolveIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="#111" stroke="#333" strokeWidth="2" />
    <circle cx="50" cy="35" r="12" fill="#FF4B4B" />
    <circle cx="37" cy="58" r="12" fill="#4BFF4B" />
    <circle cx="63" cy="58" r="12" fill="#4B4BFF" />
  </svg>
);

export const AdobeAeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" rx="15" fill="#00005B" />
    <text x="50" y="65" fontFamily="Arial" fontSize="45" fontWeight="bold" fill="#D8A5FA" textAnchor="middle">Ae</text>
  </svg>
);

export const AdobePrIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" rx="15" fill="#00005B" />
    <text x="50" y="65" fontFamily="Arial" fontSize="45" fontWeight="bold" fill="#3EA6F2" textAnchor="middle">Pr</text>
  </svg>
);

export const AeCompIcon = ({ color = "#D8A5FA" }: { color?: string }) => (
  <svg viewBox="0 0 100 100" className="w-4 h-4 shrink-0">
    <rect x="10" y="10" width="80" height="80" rx="4" fill="none" stroke={color} strokeWidth="6" />
    <circle cx="35" cy="40" r="10" fill="#FF4B4B" />
    <circle cx="65" cy="40" r="10" fill="#4BFF4B" />
    <circle cx="50" cy="70" r="10" fill="#4B4BFF" />
  </svg>
);

export const PrSequenceIcon = () => (
  <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 ml-1 mr-2 shrink-0">
    <rect width="100" height="100" fill="#3EA6F2" rx="15" />
    <rect x="20" y="25" width="60" height="8" fill="white" rx="2" />
    <rect x="20" y="45" width="45" height="8" fill="white" rx="2" />
    <rect x="20" y="65" width="60" height="8" fill="white" rx="2" />
  </svg>
);

export const DrSequenceIcon = () => (
  <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 ml-1 mr-2 shrink-0">
    <rect width="100" height="100" fill="#222" rx="15" stroke="#444" strokeWidth="2" />
    <path d="M20 50 L40 30 L60 70 L80 50" stroke="#f39c12" strokeWidth="12" fill="none" strokeLinecap="round" />
  </svg>
);

export const AeDiamondKeyframe = ({ selected = false }: { selected?: boolean }) => (
  <div className={`w-2.5 h-2.5 rotate-45 border border-black shadow-sm transform -translate-x-1/2 -translate-y-1/2 absolute top-1/2 cursor-pointer transition-colors hover:scale-125 z-20 ${selected ? 'bg-premiere' : 'bg-[#999]'}`}></div>
);
