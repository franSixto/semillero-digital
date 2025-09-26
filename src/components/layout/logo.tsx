import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/dashboard" className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">CS</span>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Classroom Semillero
        </span>
      )}
    </Link>
  );
}
