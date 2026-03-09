export const Header = () => {
  return (
    <header className="header">
      <h1>
        <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 9L12 22L21 9L12 2Z" fill="url(#logoGradient)" />
            <path d="M12 2L3 9H21L12 2Z" fill="#7DD3FC" />
            <path d="M12 22L3 9M12 22L21 9M12 22V9M3 9H21" stroke="#0F172A" strokeWidth="1.2" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logoGradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="0.5" stopColor="#22C55E" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        SimulaGrana
      </h1>
      <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>
        Calculadoras Financeiras 2026
      </p>
    </header>
  );
};
