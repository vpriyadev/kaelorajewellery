# KAELORA Jewellery — Typography System

## Font Stack

| Role | Font | Tailwind Class | Weights Used |
|------|------|---------------|--------------|
| Display / Editorial | Cormorant Garamond | font-display | 300 (light), 400, 600 |
| UI / Headings | Space Grotesk | font-body | 400 (normal), 500 (medium) |
| Body / Content | Plus Jakarta Sans | font-jakarta | 400 (normal), 500 (medium) |

## Typography Rules

### CRITICAL: Font Weight Rules
- font-light → ONLY on Cormorant Garamond (font-display) at h1/h2 sizes
- Space Grotesk (font-body) → font-normal minimum, font-medium for labels
- Plus Jakarta Sans (font-jakarta) → font-normal minimum
- NEVER use font-light on small text — it becomes illegible

### Heading Hierarchy

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| H1 Hero | font-display | text-5xl / text-6xl | font-light | Hero sections only |
| H2 Section | font-display | text-3xl / text-4xl | font-light | Section headings |
| H3 Card | font-body | text-xl / text-2xl | font-medium | Card titles |
| H4 Label | font-body | text-sm / text-base | font-medium | UI labels |
| Body | font-jakarta | text-sm / text-base | font-normal | Paragraphs, descriptions |
| Caption | font-body | text-xs | font-medium | Eyebrow labels, tags |
| Price | font-jakarta | text-sm | font-medium | Product prices |
| Form Input | font-jakarta | text-sm | font-normal | All form fields |

### Color Hierarchy

| Usage | Color | Tailwind |
|-------|-------|---------|
| Primary text | #1A1A1A | text-[#1A1A1A] |
| Active/accent | #C9A84C | text-[#C9A84C] |
| Secondary text | #4B352A | text-[#4B352A] |
| Muted text | neutral-500 | text-neutral-500 |
| Placeholder | neutral-400 | text-neutral-400 |

### Spacing & Tracking

| Element | Letter Spacing |
|---------|---------------|
| Eyebrow labels | tracking-[0.3em] |
| Nav links | tracking-[0.1em] |
| Buttons | tracking-[0.2em] |
| Body text | tracking-normal |
| Price | tracking-wide |

## Admin Panel Rules

When adding products, the typography is automatically 
applied through the global CSS. No manual font classes 
needed in product content.

The following globals.css rules enforce fonts on all 
form elements automatically:

  input, textarea, select, button {
    font-family: var(--font-jakarta), 'Plus Jakarta Sans', sans-serif;
  }

## Component Quick Reference

### ProductCard
- Category label: font-body font-medium text-[10px] tracking-[0.2em] uppercase text-[#C9A84C]
- Product name: font-body font-medium text-sm tracking-wide text-[#1A1A1A]
- Price: font-jakarta font-medium text-sm text-[#1A1A1A]
- Original price: font-jakarta font-normal text-xs text-neutral-400 line-through

### Navbar
- Brand name: font-display font-normal text-2xl tracking-[0.12em]
- Nav links: font-body font-normal text-sm tracking-[0.1em] uppercase
- Active link: text-[#C9A84C] font-medium + underline

### Section Headings
- Eyebrow: font-body font-medium text-xs tracking-[0.3em] uppercase text-[#C9A84C]
- Title: font-display font-light text-3xl/text-4xl tracking-wide

## Do Not Use
- font-serif (use font-display instead)
- font-sans (use font-body or font-jakarta instead)  
- font-bold (use font-medium maximum)
- text-[8px] text-[9px] text-[10px] on readable content
- font-light on Space Grotesk or Plus Jakarta Sans
- transition-all (use transition-colors or transition-transform)
