/* IconLi — modifier families (roadmap: systematic coverage like the largest libraries).
 * A base icon + a small badge glyph in the bottom-right 13–22 zone, with a clean gap cut around it — the same
 * construction as the Signature "User Plus". Names follow "<Base> <Modifier>" (e.g. "Folder Lock", "Camera Off").
 * Each base only gets modifiers that make sense for it (see GROUPS).
 */
(function () {
  const c = (x, y, r, f) => (f ? `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>` : `<circle cx="${x}" cy="${y}" r="${r}"/>`);
  const p = (d) => `<path d="${d}"/>`;
  const star = (cx, cy, R, r0) => { let d = ''; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r0 : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2); } return p(d + 'Z'); };
  const BADGE = c(17.5, 17.5, 4); // knockout zone for every badge (gap = stroke + 2.5)
  // g: badge glyph (stroked) · k: knockout · label: name suffix · tags: search words
  window.ICONLI_MODS = {
    plus: { label: 'Plus', tags: 'add new create', g: p('M17.5 14.5v6M14.5 17.5h6'), k: BADGE },
    minus: { label: 'Minus', tags: 'remove subtract', g: p('M14.5 17.5h6'), k: BADGE },
    check: { label: 'Check', tags: 'done approved success verified', g: p('M14.75 17.75l1.9 1.9 3.6-3.9'), k: BADGE },
    x: { label: 'X', tags: 'remove delete cancel error', g: p('M15.25 15.25l4.5 4.5M19.75 15.25l-4.5 4.5'), k: BADGE },
    edit: { label: 'Edit', tags: 'pencil modify write', g: p('M14.5 20.5l.45-2.05 3.85-3.85a1.06 1.06 0 0 1 1.5 1.5l-3.85 3.85Z'), k: BADGE },
    search: { label: 'Search', tags: 'find magnify lookup', g: c(17, 17, 2.25) + p('M18.65 18.65l1.85 1.85'), k: BADGE },
    lock: { label: 'Lock', tags: 'private secure protected', g: `<rect x="14.75" y="17.25" width="5.5" height="4" rx="1"/>` + p('M15.75 17.25v-1.1a1.75 1.75 0 0 1 3.5 0v1.1'), k: c(17.5, 17.75, 4.25) },
    settings: { label: 'Settings', tags: 'gear cog preferences configure', g: c(17.5, 17.5, 1.25) + p('M17.5 14.25v1M17.5 19.75v1M14.25 17.5h1M19.75 17.5h1M15.2 15.2l.7.7M19.1 19.1l.7.7M15.2 19.8l.7-.7M19.1 15.9l.7-.7'), k: BADGE },
    star: { label: 'Star', tags: 'favourite rating featured', g: star(17.5, 17.7, 3.6, 1.55), k: BADGE },
    heart: { label: 'Heart', tags: 'love like favourite', g: p('M17.5 20.75c-.15 0-3-1.65-3-3.45 0-.9.65-1.6 1.5-1.6.6 0 1.15.35 1.5.85.35-.5.9-.85 1.5-.85.85 0 1.5.7 1.5 1.6 0 1.8-2.85 3.45-3 3.45Z'), k: BADGE },
    share: { label: 'Share', tags: 'send export forward', g: p('M14.75 20.25l5-5M16.5 15.25h3.25v3.25'), k: BADGE },
    up: { label: 'Upload', tags: 'up send arrow', g: p('M17.5 20.75v-6.25M15 17l2.5-2.5L20 17'), k: BADGE },
    down: { label: 'Download', tags: 'down save arrow', g: p('M17.5 14.25v6.25M15 18l2.5 2.5L20 18'), k: BADGE },
    alert: { label: 'Alert', tags: 'warning error attention', g: p('M17.5 14.5v3.5') + c(17.5, 20.25, 0.75, 1), k: BADGE },
    question: { label: 'Question', tags: 'help faq unknown', g: p('M15.85 15.6a1.7 1.7 0 1 1 2.55 1.45c-.55.3-.9.7-.9 1.3') + c(17.5, 20.5, 0.75, 1), k: BADGE },
    info: { label: 'Info', tags: 'information details about', g: p('M17.5 17.25v3.25') + c(17.5, 15, 0.75, 1), k: BADGE },
    clock: { label: 'Clock', tags: 'time schedule history pending', g: c(17.5, 17.5, 3.5) + p('M17.5 15.9v1.75l1.1.9'), k: c(17.5, 17.5, 3.5) },
    dollar: { label: 'Dollar', tags: 'money price paid cost', g: p('M19 15.6c-.25-.5-.85-.85-1.55-.85-.9 0-1.5.45-1.5 1.1 0 1.5 3.2.85 3.2 2.4 0 .65-.65 1.15-1.65 1.15-.75 0-1.4-.35-1.65-.85M17.5 13.9v.85M17.5 20.25v.85'), k: BADGE },
    bolt: { label: 'Bolt', tags: 'power energy fast charge', g: p('M18.25 14l-2.5 3.75h3.5l-2.5 3.75'), k: BADGE },
    ai: { label: 'AI', tags: 'ai sparkle magic smart generate', g: p('M17.5 14c.3 2 1.5 3.2 3.5 3.5-2 .3-3.2 1.5-3.5 3.5-.3-2-1.5-3.2-3.5-3.5 2-.3 3.2-1.5 3.5-3.5Z'), k: BADGE },
    sync: { label: 'Sync', tags: 'refresh update reload', g: p('M14.75 17a2.75 2.75 0 0 1 4.9-1.5M20.25 18a2.75 2.75 0 0 1-4.9 1.5') + p('M19.75 14.25v1.5h-1.5M15.25 20.75v-1.5h1.5'), k: BADGE },
    off: { label: 'Off', tags: 'disabled muted unavailable slash', g: p('M3.5 3.5l17 17'), k: p('M3.5 3.5l17 17') },
  };

  const STD = ['plus', 'minus', 'check', 'x', 'edit', 'search', 'lock', 'settings', 'star', 'heart', 'share', 'up', 'down', 'alert', 'question', 'info', 'clock', 'sync'];
  const LITE = ['plus', 'minus', 'check', 'x', 'search', 'star', 'heart', 'alert', 'question', 'info', 'clock', 'settings', 'share'];
  const GROUPS = [
    // Devices, media and connectivity: everything, plus Off / Bolt / AI
    [STD.concat(['off', 'bolt', 'ai']), ['Laptop', 'Monitor', 'Desktop', 'Smartphone', 'Tablet', 'Smartwatch', 'Keyboard', 'Mouse', 'Chip', 'Server', 'Printer', 'Headphones', 'Microphone', 'Camera', 'Video', 'TV', 'Speaker', 'Radio', 'Music', 'Film', 'Podcast', 'Bell', 'Phone', 'WiFi', 'Bluetooth', 'Cloud', 'Database', 'Globe', 'Lightbulb', 'Plug', 'Battery Full', 'Eye', 'Image', 'Gamepad', 'VR Headset', 'Antenna', 'Signal', 'Network', 'Cast', 'Projector', 'Handheld Console', 'Robot', 'Volume High', 'Clapperboard', 'Aperture']],
    // Documents, communication and work: everything, plus AI
    [STD.concat(['ai']), ['Folder', 'Document', 'File', 'Paper', 'Clipboard', 'Sticky Note', 'Calendar', 'Mail', 'Mail Open', 'Message', 'Chat', 'Chat Bubbles', 'Inbox', 'Archive', 'Book', 'Bookmark', 'Contract', 'Invoice', 'Receipt', 'Table', 'Kanban', 'Presentation', 'Whiteboard', 'Chart Bar', 'Chart Line', 'Chart Pie', 'Chart Columns', 'Code', 'Terminal', 'Browser', 'Dashboard', 'Sidebar', 'Grid', 'Layers', 'Filter', 'Link', 'Paperclip', 'Map', 'Location', 'Flag', 'Pin', 'Home', 'Building', 'User', 'Users', 'Team', 'User Circle', 'ID Card', 'Business Card', 'Contacts', 'Meeting', 'Briefcase', 'Filing Cabinet', 'Save', 'Copy', 'Trash', 'Send', 'Megaphone', 'Target', 'Gauge', 'Pin Board', 'Workspace', 'Cube', 'Palette', 'Pen Tool', 'Brush', 'Shapes', 'Frame', 'Type', 'Hourglass', 'Alarm', 'Stopwatch', 'Clock', 'Key', 'Fingerprint', 'Bug', 'Shield Lock', 'Settings', 'Compass', 'Route', 'Ticket', 'QR Code', 'Barcode', 'Flask', 'Graduation Cap', 'Calculator', 'Backpack']],
    // Commerce: everything, plus Dollar
    [STD.concat(['dollar']), ['Cart', 'Basket', 'Bag', 'Wallet', 'Credit Card', 'Coin', 'Coins Stack', 'Bank', 'Store', 'Package', 'Truck', 'Price Tag', 'Gift', 'Piggy Bank', 'Money Bag', 'Diamond', 'Crown', 'Discount', 'Handshake', 'Growth', 'Stamp', 'Mailbox', 'Luggage']],
    // Nature, travel, food, health, lifestyle and play: a lighter set
    [LITE, ['Sun', 'Moon', 'Cloud Rain', 'Snowflake', 'Umbrella', 'Thermometer', 'Water Drop', 'Leaf', 'Tree', 'Sprout', 'Mountain', 'Flame', 'Paw', 'Planet', 'Rocket', 'Satellite', 'Telescope', 'Car', 'Bus', 'Train', 'Bicycle', 'Sailboat', 'Airplane', 'Fuel', 'Parking', 'Bed', 'Anchor', 'Coffee', 'Pizza', 'Burger', 'Cake', 'Apple', 'Wine', 'Utensils', 'Chef Hat', 'Ice Cream', 'Stethoscope', 'Pill', 'First Aid', 'Medical Cross', 'Hospital', 'Syringe', 'Dumbbell', 'Heart Pulse', 'Sofa', 'Door', 'Lamp', 'T-Shirt', 'Glasses', 'Watch', 'Perfume', 'Hanger', 'Football', 'Basketball', 'Dice', 'Joystick', 'Trophy', 'Medal', 'Award', 'Tent', 'Playing Cards', 'Kettlebell', 'Podium', 'Whistle', 'Puzzle', 'Atom', 'Microscope', 'Heart', 'Star', 'Smile', 'Thumbs Up']],
  ];

  const { add } = window.IconLiDSL;
  const seen = new Set();
  GROUPS.forEach(([mods, bases]) => bases.forEach((base) => mods.forEach((mod) => {
    const m = window.ICONLI_MODS[mod];
    if (new RegExp(`\\b${m.label}\\b`, 'i').test(base)) return; // e.g. no "Clock Clock"
    const name = `${base} ${m.label}`;
    if (seen.has(name)) return;
    seen.add(name);
    add(undefined, name, `${base.toLowerCase()} ${m.tags} variant`, { comp: { base, mod } });
  })));
})();
