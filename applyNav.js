const fs = require('fs');

let content = fs.readFileSync('C:\\\\Users\\\\VISHNU TEJA\\\\.gemini\\\\antigravity\\\\scratch\\\\kaelorajewellery\\\\src\\\\components\\\\Navbar.tsx', 'utf8');

// 1. VERTICAL ALIGNMENT
content = content.replace(
  'className="max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 flex items-center justify-between py-3 sm:py-4 lg:py-5"',
  'className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6"'
);

// Logo size
content = content.replace(
  'className="h-auto max-h-16 w-auto object-contain flex-shrink-0"',
  'className="h-10 w-10 object-contain flex-shrink-0"'
);

// 2. NAV PILL ALIGNMENT
content = content.replace(
  'className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm border border-[#D4AF37]/20 rounded-full shadow-lg shadow-[#D4AF37]/5 hover:shadow-[#D4AF37]/10 transition-all duration-300"',
  'className="flex items-center gap-1 bg-white rounded-full px-4 py-2 shadow-sm"'
);

// 3. REPLACE SEARCH ICON
const oldSearch = `{/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-[#D4AF37] transition-colors duration-300"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
            </button>`;

const newSearch = `{/* Search Pill */}
            <div className="relative flex items-center">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-body font-light text-neutral-500 cursor-pointer transition-all duration-300 hover:shadow-md"
                style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #D4AF37, #f5e6a3, #b8962e, #D4AF37) border-box',
                  border: '1.5px solid transparent',
                }}
                onClick={() => setSearchOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="text-xs tracking-widest text-neutral-400">Search</span>
              </div>
            </div>`;

content = content.replace(oldSearch, newSearch);

// 4. ICON ROW SPACING
content = content.replace(
  'className="flex items-center gap-2.5 sm:gap-4 text-[#1A1A1A]"',
  'className="flex items-center gap-3 text-[#1A1A1A]"'
);

// Icon sizes
content = content.replaceAll('w-5 h-5 sm:w-[22px] sm:h-[22px]', 'w-5 h-5');

fs.writeFileSync('C:\\\\Users\\\\VISHNU TEJA\\\\.gemini\\\\antigravity\\\\scratch\\\\kaelorajewellery\\\\src\\\\components\\\\Navbar.tsx', content);

// And copy it to F drive
fs.writeFileSync('F:\\\\.gemini\\\\antigravity\\\\scratch\\\\kaelorajewellery\\\\src\\\\components\\\\Navbar.tsx', content);
console.log('Navbar successfully updated and synced.');
