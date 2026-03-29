import React from 'react';
import { Globe, FileText } from 'lucide-react';

const FallbackBanner = ({ item }) => {
  // Hash the item ID (or fallback to a random string length if no ID) to deterministically pick a color
  const idStr = item._id || 'fallback';
  const colorIndex = parseInt(idStr.slice(-1), 16) % 5 || 0;
  
  // Premium gradient combinations
  const gradients = [
    'from-[#8B6914]/80 via-[#3a2c08]/60 to-[#18181b]', // Golden Bronze (like user screenshot)
    'from-blue-800/80 via-blue-900/60 to-[#18181b]',    // Deep Ocean
    'from-emerald-800/80 via-emerald-900/60 to-[#18181b]', // Emerald Green
    'from-purple-800/80 via-purple-900/60 to-[#18181b]', // Amethyst
    'from-rose-800/80 via-rose-900/60 to-[#18181b]'    // Crimson
  ];

  // Specific pill styles for the theme
  const pillColors = [
    'text-amber-300 border-amber-500/30 bg-amber-950/40',
    'text-blue-300 border-blue-500/30 bg-blue-950/40',
    'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
    'text-purple-300 border-purple-500/30 bg-purple-950/40',
    'text-rose-300 border-rose-500/30 bg-rose-950/40'
  ];

  let rawHostname = "Unknown Source";
  try {
      if (item.url) {
          rawHostname = new URL(item.url).hostname.replace('www.', '');
      }
  } catch (e) {}

  const siteName = item.siteName || rawHostname;
  const typeText = item.type === 'pdf' ? 'PDF' : 'WEB';
  const TopIcon = item.type === 'pdf' ? FileText : Globe;

  return (
    <div className={`w-full h-44 bg-zinc-950 border-b border-white/[0.05] relative overflow-hidden shrink-0 flex flex-col justify-between p-5 group-hover:scale-105 transition-transform duration-500`}>
      {/* Abstract Background Elements */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[colorIndex]} z-0 opacity-90`} />
      <div className="absolute top-0 right-0 w-32 h-64 bg-white/5 blur-3xl rounded-full z-0 transform translate-x-10 -translate-y-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/40 blur-xl rounded-full z-0 transform -translate-x-5 translate-y-5" />

      {/* Decorative Mock Article Lines */}
      <div className="absolute right-4 top-8 flex flex-col gap-2 z-0 opacity-20">
          <div className="w-24 h-16 bg-white/20 rounded-lg"></div>
          <div className="w-20 h-2 bg-white/30 rounded-full mt-2"></div>
          <div className="w-16 h-2 bg-white/30 rounded-full"></div>
      </div>

      {/* Top Badges */}
      <div className="flex items-center gap-2 z-10">
        <span className="px-2 py-1 bg-[#18181b] text-zinc-300 text-[9px] font-black tracking-[0.15em] uppercase rounded shadow-md border border-white/10">
          {typeText}
        </span>
        <span className={`px-2.5 py-1 border text-[9px] font-black tracking-[0.15em] uppercase rounded shadow-md backdrop-blur-sm truncate max-w-[140px] ${pillColors[colorIndex]}`}>
          {siteName}
        </span>
      </div>

      {/* Main Title Overlay */}
      <div className="z-10 mt-auto flex items-end justify-between">
         <div className="flex-1 min-w-0 pr-4">
             <h3 className="text-white/90 font-black text-2xl leading-tight line-clamp-2 drop-shadow-lg tracking-tight">
                {item.title || "Saved Link"}
             </h3>
             <p className="text-white/50 text-[10px] font-medium tracking-wide mt-1.5 flex items-center gap-1.5 line-clamp-1">
               {item.description || "Open Graph auto-generated preview"}
             </p>
         </div>
         
         {/* Icon Container */}
         <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-md shadow-lg hidden sm:flex">
            <TopIcon size={20} className="text-white/80" />
         </div>
      </div>
    </div>
  );
};

export default FallbackBanner;
