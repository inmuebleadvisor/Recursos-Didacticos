import React from 'react';

export const CobaesLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 300 120" className={className} xmlns="http://www.w3.org/2000/svg">
     {/* Abstract representation of the Cobaes Logo based on descriptions (Intertwined G/B style) */}
     <g fill="none" stroke="#006847" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        {/* The 'C' / 'G' shape */}
        <path d="M 60 30 L 40 30 L 40 90 L 90 90 L 90 70 L 60 70" />
        {/* The inner 'B' / shape interlocking */}
        <path d="M 70 50 L 110 50 L 110 90" stroke="#009A65" /> 
     </g>
     <text x="130" y="55" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#54565A">COLEGIO DE</text>
     <text x="130" y="80" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#54565A">BACHILLERES DEL</text>
     <text x="130" y="105" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#54565A">ESTADO DE SINALOA</text>
     <text x="40" y="115" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="#006847">COBAES</text>
  </svg>
);
