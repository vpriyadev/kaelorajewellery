const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('src');
let totalCounts = {};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  let changes = 0;

  // 1. text-neutral-300 -> text-neutral-500
  let matches = content.match(/text-neutral-300/g);
  if (matches) { changes += matches.length; content = content.replace(/text-neutral-300/g, 'text-neutral-500'); }
  
  // 2. text-gray-300 -> text-neutral-500
  matches = content.match(/text-gray-300/g);
  if (matches) { changes += matches.length; content = content.replace(/text-gray-300/g, 'text-neutral-500'); }

  // 3. text-white/30 or text-white/40 -> text-white/80
  matches = content.match(/text-white\/(30|40)/g);
  if (matches) { changes += matches.length; content = content.replace(/text-white\/(30|40)/g, 'text-white/80'); }

  // 4. text-[#1A1A1A]/30 or /40 -> text-[#1A1A1A]/70
  matches = content.match(/text-\[\#1A1A1A\]\/(30|40)/g);
  if (matches) { changes += matches.length; content = content.replace(/text-\[\#1A1A1A\]\/(30|40)/g, 'text-[#1A1A1A]/70'); }

  // Parse for any element
  content = content.replace(/<([a-zA-Z0-9_.-]+)\b([^>]*?)className=(["'])(.*?)\3/g, (match, tag, before, quote, classes) => {
    let newClasses = classes.split(' ');
    let changed = false;

    // Check size for font-display
    let hasFontDisplay = newClasses.includes('font-display');
    let hasFontLight = newClasses.includes('font-light');
    let hasFontBody = newClasses.includes('font-body');
    let hasFontJakarta = newClasses.includes('font-jakarta');
    
    let isLargeText = newClasses.some(c => /text-(2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(c) || /text-\[1\.[5-9].*rem\]/.test(c) || /text-\[[2-9].*rem\]/.test(c));

    // Rule: font-display at smaller sizes -> font-normal
    if (hasFontDisplay && hasFontLight && !isLargeText) {
      newClasses = newClasses.map(c => c === 'font-light' ? 'font-normal' : c);
      changed = true;
    }

    // Rule: font-body -> change to font-normal or font-medium (font-normal is minimum)
    if (hasFontBody && newClasses.includes('font-light')) {
      newClasses = newClasses.map(c => c === 'font-light' ? 'font-normal' : c);
      changed = true;
    }

    // Rule: font-jakarta -> change to font-normal
    if (hasFontJakarta && newClasses.includes('font-light')) {
      newClasses = newClasses.map(c => c === 'font-light' ? 'font-normal' : c);
      changed = true;
    }

    // Rule: any p, span, label, input, button -> change to font-normal (from font-light)
    if ((tag === 'p' || tag === 'span' || tag === 'label' || tag === 'input' || tag === 'button' || tag === 'motion.p' || tag === 'motion.span' || tag === 'motion.button') && newClasses.includes('font-light')) {
      newClasses = newClasses.map(c => c === 'font-light' ? 'font-normal' : c);
      changed = true;
    }

    // Rule: any h3, h4 -> change to font-medium
    if (tag === 'h3' || tag === 'h4' || tag === 'motion.h3' || tag === 'motion.h4') {
      if (newClasses.includes('font-light')) {
        newClasses = newClasses.map(c => c === 'font-light' ? 'font-medium' : c);
        changed = true;
      } else if (newClasses.includes('font-normal')) {
        newClasses = newClasses.map(c => c === 'font-normal' ? 'font-medium' : c);
        changed = true;
      } else if (!newClasses.includes('font-medium') && !newClasses.includes('font-semibold') && !newClasses.includes('font-bold')) {
        newClasses.push('font-medium');
        changed = true;
      }
    }

    if (changed) {
      changes++;
      return `<${tag}${before}className=${quote}${newClasses.join(' ')}${quote}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalCounts[file] = changes;
  }
});

console.log(JSON.stringify(totalCounts, null, 2));
