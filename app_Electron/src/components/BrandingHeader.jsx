import logo from '../assets/logos/logo-blue-200.png';

export default function BrandingHeader({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 group">
        <img 
          src={logo} 
          alt="Snipt Logo" 
          className="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform duration-300"
        />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Snipt</h1>
          <p className="text-[11px] sm:text-xs text-primary-300 tracking-[0.12em] uppercase font-semibold text-white">
            Capture. Crop. Share.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 animate-slide-up">
      {/* Logo */}
      <img 
        src={logo} 
        alt="Snipt Logo" 
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 hover:scale-110 transition-transform duration-300"
      />
      
      {/* Text */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3">
          Snipt
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-primary-300 tracking-widest uppercase font-semibold">
          Capture. Share.
        </p>
      </div>
    </div>
  );
}
