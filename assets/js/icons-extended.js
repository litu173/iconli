/* IconLi — extended set.
 * Every icon is drawn on a 24px grid with 2px padding, 1.5px round strokes,
 * following the Icon_Li Figma guidelines.
 *   b: body shapes   → stroked in outline, filled in solid, tinted in duotone
 *   d: inner details → stroked in outline, knocked out of the body in solid
 *   o: open strokes  → always stroked
 *   t: optional transform applied to the whole glyph
 */
(function () {
  const p = (d) => `<path d="${d}"/>`;
  // Filled dots follow the Signature set: solid, unstroked, r ≥ 0.75
  const c = (x, y, r, f) => (f ? `<circle cx="${x}" cy="${y}" r="${Math.max(0.75, +(r + 0.4).toFixed(2))}" fill="currentColor" stroke="none"/>` : `<circle cx="${x}" cy="${y}" r="${r}"/>`);
  const r = (x, y, w, h, rx, t) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx || 0}"${t ? ` transform="${t}"` : ''}/>`;
  const l = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;
  const e = (x, y, rx, ry, t) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${t ? ` transform="${t}"` : ''}/>`;
  const dot = (x, y) => c(x, y, 0.45, 1);

  // Shared shapes
  const FILE = 'M13.5 3.25H7.75A2.25 2.25 0 0 0 5.5 5.5v13a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25V8.25Z';
  const FOLD = p('M13.5 3.5v3.25a1.5 1.5 0 0 0 1.5 1.5h3.25');
  const FOLDER = 'M3.5 7a2.5 2.5 0 0 1 2.5-2.5h3.6a2 2 0 0 1 1.5.68l1.3 1.5a2 2 0 0 0 1.5.68H18a2.5 2.5 0 0 1 2.5 2.5v8.14A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18Z';
  const CLOUD = 'M6.5 18.5h11a4.5 4.5 0 0 0 .4-8.98A6 6 0 0 0 6.34 9.1 4.75 4.75 0 0 0 6.5 18.5Z';
  const CLOUD_S = 'M7 15.5h9.5a3.75 3.75 0 0 0 .33-7.48A5 5 0 0 0 7.2 7.7 3.9 3.9 0 0 0 7 15.5Z';
  const HEART = 'M12 20c-.4 0-7.5-4.3-8.9-9C2.2 7.8 4.1 4.5 7.3 4.5c2 0 3.5 1 4.7 2.6 1.2-1.6 2.7-2.6 4.7-2.6 3.2 0 5.1 3.3 4.2 6.5C19.5 15.7 12.4 20 12 20Z';
  // Matches the Signature 'User' glyph: head over a flat oval base
  const USER_HEAD = c(10.5, 7, 3.25);
  const USER_BODY = e(10.5, 17, 7.25, 3.25);
  const CIRCLE = c(12, 12, 8.75);
  const SQUARE = r(3.5, 3.5, 17, 17, 5);
  const THUMB = [p('M7.5 10.5 11 3.75a1.9 1.9 0 0 1 3.4 1.6L13.6 9h5a2 2 0 0 1 1.95 2.45l-1.5 6.75a2.5 2.5 0 0 1-2.45 1.95H7.5Z'), p('M3.5 11.5a1 1 0 0 1 1-1h3v9.75h-3a1 1 0 0 1-1-1Z')];
  const SPARK = (x, y, s) => p(`M${x} ${y - 7 * s}c${0.6 * s} ${4.5 * s} ${2.5 * s} ${6.4 * s} ${7 * s} ${7 * s}-${4.5 * s} ${0.6 * s}-${6.4 * s} ${2.5 * s}-${7 * s} ${7 * s}-${0.6 * s}-${4.5 * s}-${2.5 * s}-${6.4 * s}-${7 * s}-${7 * s} ${4.5 * s}-${0.6 * s} ${6.4 * s}-${2.5 * s} ${7 * s}-${7 * s}Z`);
  const FLIP_X = 'matrix(-1 0 0 1 24 0)';
  const FLIP_Y = 'matrix(1 0 0 -1 0 24)';
  const rot = (a) => `rotate(${a} 12 12)`;
  const star = (cx, cy, R, r0) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r0 : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2);
    }
    return p(d + 'Z');
  };
  const USER = [USER_HEAD, USER_BODY];

  const I = [];
  const add = (cat, name, tags, def) => I.push(Object.assign({ cat, name, tags }, def));

  /* ───────── Interface ───────── */
  add('interface', 'Toggle On', 'switch enable active', { b: [r(2.75, 6.5, 18.5, 11, 5.5)], d: [c(16, 12, 2.5)] });
  add('interface', 'Toggle Off', 'switch disable inactive', { b: [r(2.75, 6.5, 18.5, 11, 5.5)], d: [c(8, 12, 2.5)] });
  add('interface', 'Sidebar', 'panel layout drawer', { b: [r(3, 4, 18, 16, 4)], d: [l(9, 4.5, 9, 19.5)] });
  add('interface', 'Dashboard', 'layout widgets bento', { b: [r(3.5, 3.5, 7, 9, 2), r(13.5, 3.5, 7, 5, 2), r(13.5, 11.5, 7, 9, 2), r(3.5, 15.5, 7, 5, 2)] });
  add('interface', 'Browser', 'window app web', { b: [r(3, 4, 18, 16, 4)], d: [l(3.5, 8.75, 20.5, 8.75), dot(6.4, 6.4), dot(8.6, 6.4)] });
  add('interface', 'Command', 'keyboard shortcut cmd', { o: [p('M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9Zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15Zm0 0v6m0 0H9m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15Zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9Z')] });
  add('interface', 'Drag Handle', 'grip move reorder', { o: [c(9, 6, 0.6, 1), c(15, 6, 0.6, 1), c(9, 12, 0.6, 1), c(15, 12, 0.6, 1), c(9, 18, 0.6, 1), c(15, 18, 0.6, 1)] });
  add('interface', 'Pin', 'pushpin attach keep', { b: [p('M9 3.5h6l-1 5.5 3 3.5V14H7v-1.5l3-3.5Z')], o: [l(12, 14, 12, 20.5)] });
  add('interface', 'Refresh', 'reload sync update', { o: [p('M20 12a8 8 0 0 1-14.3 4.9'), p('M4 12a8 8 0 0 1 14.3-4.9'), p('M18.5 3.5v3.75h-3.75'), p('M5.5 20.5v-3.75h3.75')] });
  add('interface', 'Zoom In', 'magnify plus enlarge', { b: [c(11, 11, 7)], d: [l(8.25, 11, 13.75, 11), l(11, 8.25, 11, 13.75)], o: [l(16.25, 16.25, 20.5, 20.5)] });
  add('interface', 'Zoom Out', 'magnify minus shrink', { b: [c(11, 11, 7)], d: [l(8.25, 11, 13.75, 11)], o: [l(16.25, 16.25, 20.5, 20.5)] });
  add('interface', 'External Link', 'open new window', { o: [p('M13.5 3.5h7v7'), p('M20.5 3.5 11 13'), p('M18 14v3.5a3 3 0 0 1-3 3H6.5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3H10')] });
  add('interface', 'Move', 'drag arrows pan', { o: [l(12, 3, 12, 21), l(3, 12, 21, 12), p('M9.5 5.5 12 3l2.5 2.5'), p('M9.5 18.5 12 21l2.5-2.5'), p('M5.5 9.5 3 12l2.5 2.5'), p('M18.5 9.5 21 12l-2.5 2.5')] });
  add('interface', 'Sort', 'order arrange up down', { o: [p('M7 20V4'), p('M3.5 7.5 7 4l3.5 3.5'), p('M17 4v16'), p('M13.5 16.5 17 20l3.5-3.5')] });
  add('interface', 'Funnel', 'filter refine', { b: [p('M4 4.5h16a.5.5 0 0 1 .4.8L14 13.5v5.25a.75.75 0 0 1-.4.66l-2.5 1.3a.75.75 0 0 1-1.1-.66V13.5L3.6 5.3a.5.5 0 0 1 .4-.8Z')] });
  add('interface', 'Hash', 'hashtag number tag', { o: [l(9.75, 3.5, 7.75, 20.5), l(16.25, 3.5, 14.25, 20.5), l(4, 8.5, 20.5, 8.5), l(3.5, 15.5, 20, 15.5)] });
  add('interface', 'At Sign', 'email mention', { o: [c(12, 12, 3.75), p('M15.75 8.25v4.5a2.5 2.5 0 0 0 5 0V12a8.75 8.75 0 1 0-3.4 6.9')] });
  add('interface', 'QR Code', 'scan barcode', { b: [r(3.5, 3.5, 6.5, 6.5, 1.75), r(14, 3.5, 6.5, 6.5, 1.75), r(3.5, 14, 6.5, 6.5, 1.75)], o: [p('M14 14h2.5v2.5'), p('M20.5 14v.01'), p('M14 20.5v.01'), p('M17.5 20.5h3v-3')] });
  add('interface', 'Barcode', 'scan product sku', { o: [l(4, 5, 4, 19), l(7.5, 5, 7.5, 19), l(10, 5, 10, 19), l(13.5, 5, 13.5, 19), l(16, 5, 16, 19), l(20, 5, 20, 19)] });
  add('interface', 'Cursor', 'pointer arrow select click', { b: [p('M5 4.2 19.3 10.2a.6.6 0 0 1-.04 1.12l-5.86 2.08-2.08 5.86a.6.6 0 0 1-1.12.04L4.2 5a.6.6 0 0 1 .8-.8Z')] });
  add('interface', 'Lightning', 'zap flash energy power', { b: [p('M13.2 2.9 4.9 13.1a.6.6 0 0 0 .47.98H11l-1 7.02 8.3-10.2a.6.6 0 0 0-.47-.98H12.2Z')] });
  add('interface', 'Infinity', 'loop forever unlimited', { o: [p('M12 12c-1.7-2.3-3.3-3.5-5-3.5a3.5 3.5 0 0 0 0 7c1.7 0 3.3-1.2 5-3.5Zm0 0c1.7 2.3 3.3 3.5 5 3.5a3.5 3.5 0 0 0 0-7c-1.7 0-3.3 1.2-5 3.5Z')] });
  add('interface', 'Caret Down', 'triangle dropdown', { b: [p('M6.9 9.5h10.2a.7.7 0 0 1 .52 1.17l-5.1 5.6a.7.7 0 0 1-1.04 0l-5.1-5.6A.7.7 0 0 1 6.9 9.5Z')] });
  add('interface', 'Caret Up', 'triangle collapse', { b: [p('M6.9 9.5h10.2a.7.7 0 0 1 .52 1.17l-5.1 5.6a.7.7 0 0 1-1.04 0l-5.1-5.6A.7.7 0 0 1 6.9 9.5Z')], t: FLIP_Y });
  add('interface', 'Target', 'goal aim focus', { b: [CIRCLE], d: [c(12, 12, 5), c(12, 12, 1, 1)] });
  add('interface', 'Inbox', 'tray mail messages', { b: [r(3.5, 4, 17, 16, 4)], d: [p('M3.75 13.5h4.1l1.15 2h6l1.15-2h4.1')] });
  add('interface', 'Archive', 'box store files', { b: [r(3, 3.75, 18, 5, 1.75), p('M4.5 8.75v9a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-9Z')], d: [l(10, 12.75, 14, 12.75)] });

  /* ───────── Arrows ───────── */
  const ARROW_UR = [l(6.5, 17.5, 17.5, 6.5), p('M8 6.5h9.5V16')];
  add('arrows', 'Arrow Up Right', 'diagonal northeast', { o: ARROW_UR });
  add('arrows', 'Arrow Up Left', 'diagonal northwest', { o: ARROW_UR, t: FLIP_X });
  add('arrows', 'Arrow Down Right', 'diagonal southeast', { o: ARROW_UR, t: FLIP_Y });
  add('arrows', 'Arrow Down Left', 'diagonal southwest', { o: ARROW_UR, t: rot(180) });
  const CHEV2 = [p('M6.5 6.5 12 12l-5.5 5.5'), p('M12.5 6.5 18 12l-5.5 5.5')];
  add('arrows', 'Chevrons Right', 'double forward skip', { o: CHEV2 });
  add('arrows', 'Chevrons Left', 'double back rewind', { o: CHEV2, t: rot(180) });
  add('arrows', 'Chevrons Down', 'double expand', { o: CHEV2, t: rot(90) });
  add('arrows', 'Chevrons Up', 'double collapse', { o: CHEV2, t: rot(-90) });
  add('arrows', 'Corner Up Left', 'return back reply', { o: [p('M9.5 5 4.5 10l5 5'), p('M5 10h9.5a5 5 0 0 1 5 5v4')] });
  add('arrows', 'Corner Up Right', 'forward redirect', { o: [p('M9.5 5 4.5 10l5 5'), p('M5 10h9.5a5 5 0 0 1 5 5v4')], t: FLIP_X });
  add('arrows', 'Repeat', 'loop cycle', { o: [p('M17 3.5 20 6.5l-3 3'), p('M4 11.5v-1a4 4 0 0 1 4-4h12'), p('M7 20.5 4 17.5l3-3'), p('M20 12.5v1a4 4 0 0 1-4 4H4')] });
  add('arrows', 'Shuffle', 'random mix', { o: [p('M17.5 3.5 20.5 6.5l-3 3'), p('M17.5 14.5l3 3-3 3'), p('M3.5 6.5h3.2a4 4 0 0 1 3.3 1.75l4 5.5a4 4 0 0 0 3.3 1.75h3.2'), p('M3.5 17.5h3.2a4 4 0 0 0 3.3-1.75'), p('M14 8.25a4 4 0 0 1 3.3-1.75h3.2')] });
  add('arrows', 'Arrows Expand', 'fullscreen enlarge', { o: [p('M14.5 3.5h6v6'), p('M20.5 3.5 14 10'), p('M9.5 20.5h-6v-6'), p('M3.5 20.5 10 14')] });
  add('arrows', 'Arrows Collapse', 'exit fullscreen shrink', { o: [p('M20.5 9.5h-6v-6'), p('M14.5 9.5 21 3'), p('M3.5 14.5h6v6'), p('M9.5 14.5 3 21')] });
  add('arrows', 'Arrow Circle Up', 'upload top', { b: [CIRCLE], d: [l(12, 16.5, 12, 7.75), p('M8.5 11 12 7.5l3.5 3.5')] });
  add('arrows', 'Trending Up', 'growth increase stock', { o: [p('M3 17.5 9.5 11l4 4L21 7.5'), p('M15.5 7.5H21V13')] });
  add('arrows', 'Trending Down', 'decline decrease loss', { o: [p('M3 6.5 9.5 13l4-4 7.5 7.5'), p('M15.5 16.5H21V11')] });

  /* ───────── Communication ───────── */
  add('communication', 'Mail Open', 'email read envelope', { b: [p('M3.5 10.2a2 2 0 0 1 .9-1.67l6.5-4.33a2 2 0 0 1 2.2 0l6.5 4.33a2 2 0 0 1 .9 1.67V18a2.5 2.5 0 0 1-2.5 2.5h-12A2.5 2.5 0 0 1 3.5 18Z')], d: [p('M4 9.75l6.65 4.6a2.4 2.4 0 0 0 2.7 0L20 9.75')] });
  add('communication', 'Megaphone', 'announce marketing loud', { b: [p('M4 10a3 3 0 0 1 3-3h4.5l6.4-3.2a.75.75 0 0 1 1.1.67v13.06a.75.75 0 0 1-1.1.67L11.5 15H7a3 3 0 0 1-3-3Z')], d: [l(11.5, 7.5, 11.5, 14.5)], o: [p('M7.5 15l1.2 4.6a1.2 1.2 0 0 0 2.3-.6L10 15'), p('M21 9.25v3.5')] });
  add('communication', 'Broadcast', 'rss feed signal', { o: [p('M4.5 4.5a15 15 0 0 1 15 15'), p('M4.5 10.5a9 9 0 0 1 9 9'), c(5.5, 18.5, 1, 1)] });
  add('communication', 'Contacts', 'address book phonebook', { b: [r(4.5, 3, 15, 18, 3.5)], d: [c(12, 10, 2.25), p('M8.25 16.5a3.75 3.75 0 0 1 7.5 0')], o: [l(3, 7.5, 4.5, 7.5), l(3, 16.5, 4.5, 16.5)] });
  add('communication', 'Reply', 'respond answer back', { o: [p('M9.5 5 4 10.5 9.5 16'), p('M4.5 10.5h9a6.5 6.5 0 0 1 6.5 6.5v2')] });
  add('communication', 'Reply All', 'respond everyone', { o: [p('M11.5 6 7 10.5l4.5 4.5'), p('M7 6 2.5 10.5 7 15'), p('M7.5 10.5h7a6 6 0 0 1 6 6v2.5')] });
  add('communication', 'Voicemail', 'tape message audio', { o: [c(6.5, 12, 3.5), c(17.5, 12, 3.5), l(6.5, 15.5, 17.5, 15.5)] });
  add('communication', 'Translate', 'language localize', { o: [p('M3.5 5.5h9'), p('M8 3.5v2'), p('M10.5 5.5c-.8 4.2-3.3 7.5-6.5 9'), p('M5.5 9c1 2.2 2.8 4 5 5'), p('M12.5 20.5 16.5 11l4 9.5'), p('M13.8 17.5h5.4')] });
  add('communication', 'Chat Bubbles', 'conversation discussion forum', { b: [p('M3 6.5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3V10a3 3 0 0 1-3 3H8l-3.4 2.4a.5.5 0 0 1-.8-.4V12.4A3 3 0 0 1 3 10Z')], o: [p('M18.5 8.5h.5a2 2 0 0 1 2 2v7.5a.5.5 0 0 1-.8.4L17 16H11a2 2 0 0 1-2-2v-.5')] });
  add('communication', 'Chat Typing', 'message dots writing', { b: [p('M12 3.5a8.5 8.5 0 0 0-7.4 12.7l-1 3.6a.6.6 0 0 0 .73.73l3.6-1A8.5 8.5 0 1 0 12 3.5Z')], d: [dot(8, 12), dot(12, 12), dot(16, 12)] });

  /* ───────── Media ───────── */
  add('media', 'Music', 'note song audio', { b: [c(7, 17.5, 2.5), c(17, 15.5, 2.5)], o: [p('M9.5 17.5V6.6a1 1 0 0 1 .76-.97l8.5-2.1a1 1 0 0 1 1.24.97v11'), l(9.5, 9.75, 19.5, 7.25)] });
  add('media', 'Film', 'movie video cinema', { b: [r(3, 3.5, 18, 17, 4)], d: [l(7.5, 4, 7.5, 20), l(16.5, 4, 16.5, 20), l(3.5, 9, 7, 9), l(3.5, 15, 7, 15), l(17, 9, 20.5, 9), l(17, 15, 20.5, 15)] });
  add('media', 'Skip Forward', 'next track', { b: [p('M5 6.2v11.6a1 1 0 0 0 1.55.83l8.4-5.8a1 1 0 0 0 0-1.66l-8.4-5.8A1 1 0 0 0 5 6.2Z')], o: [l(19, 5, 19, 19)] });
  add('media', 'Skip Back', 'previous track', { b: [p('M5 6.2v11.6a1 1 0 0 0 1.55.83l8.4-5.8a1 1 0 0 0 0-1.66l-8.4-5.8A1 1 0 0 0 5 6.2Z')], o: [l(19, 5, 19, 19)], t: FLIP_X });
  add('media', 'Fast Forward', 'seek ahead', { b: [p('M3.5 7.3v9.4a1 1 0 0 0 1.6.8l6.1-4.7a1 1 0 0 0 0-1.6L5.1 6.5a1 1 0 0 0-1.6.8Z'), p('M12.5 7.3v9.4a1 1 0 0 0 1.6.8l6.1-4.7a1 1 0 0 0 0-1.6l-6.1-4.7a1 1 0 0 0-1.6.8Z')] });
  add('media', 'Rewind', 'seek back', { b: [p('M3.5 7.3v9.4a1 1 0 0 0 1.6.8l6.1-4.7a1 1 0 0 0 0-1.6L5.1 6.5a1 1 0 0 0-1.6.8Z'), p('M12.5 7.3v9.4a1 1 0 0 0 1.6.8l6.1-4.7a1 1 0 0 0 0-1.6l-6.1-4.7a1 1 0 0 0-1.6.8Z')], t: FLIP_X });
  add('media', 'Radio', 'fm broadcast tuner', { b: [r(3, 7.5, 18, 13, 3.5)], d: [c(15.5, 14, 2.5), l(6.5, 11.5, 10, 11.5), l(6.5, 14.5, 10, 14.5), l(6.5, 17.5, 10, 17.5)], o: [l(6.5, 7.5, 16.5, 3.5)] });
  add('media', 'TV', 'television screen monitor', { b: [r(2.75, 4.5, 18.5, 12.5, 3)], o: [l(8, 20.5, 16, 20.5), l(12, 17, 12, 20.5)] });
  add('media', 'Speaker', 'audio sound device', { b: [r(5, 2.75, 14, 18.5, 3.5)], d: [c(12, 14.5, 3), dot(12, 7.5)] });
  add('media', 'Podcast', 'audio show broadcast', { b: [c(12, 10, 2)], o: [l(12, 14.5, 12, 20.5), p('M7.4 15.4a7 7 0 1 1 9.2 0'), p('M9.3 12.7a3.75 3.75 0 1 1 5.4 0')] });
  add('media', 'Aperture', 'camera lens shutter photo', { b: [CIRCLE], d: [p('M14.3 3.6 9 12.75'), p('M20.2 9H9.7'), p('M17.9 18.4l-5.25-9.1'), p('M9.7 20.4 15 11.25'), p('M3.8 15h10.5'), p('M6.1 5.6l5.25 9.1')] });
  add('media', 'Equalizer', 'mixer sliders audio levels', { b: [r(4, 13, 4, 3.5, 1.25), r(10, 6, 4, 3.5, 1.25), r(16, 15, 4, 3.5, 1.25)], o: [p('M6 3.5V13M6 16.5v4'), p('M12 3.5V6M12 9.5v11'), p('M18 3.5V15M18 18.5v2')] });
  add('media', 'Clapperboard', 'film director scene', { b: [r(3.5, 9, 17, 11.5, 3)], o: [p('M3.75 9 3.2 6.6a1.5 1.5 0 0 1 1.1-1.8l12.6-2.9a1.5 1.5 0 0 1 1.8 1.1l.55 2.4L3.75 9Z'), l(8.4, 4.1, 10, 7.6), l(13.5, 3, 15, 6.4)] });

  /* ───────── Files ───────── */
  add('files', 'File', 'document page blank', { b: [p(FILE)], d: [FOLD] });
  add('files', 'File Plus', 'new document add', { b: [p(FILE)], d: [FOLD, p('M12 11.5v6M9 14.5h6')] });
  add('files', 'File Check', 'document approved done', { b: [p(FILE)], d: [FOLD, p('M9.25 14.75 11 16.5l3.75-3.75')] });
  add('files', 'File Code', 'source script document', { b: [p(FILE)], d: [FOLD, p('M10.25 12.25 8.5 14.25l1.75 2'), p('M13.75 12.25l1.75 2-1.75 2')] });
  add('files', 'File Zip', 'archive compressed', { b: [p(FILE)], d: [FOLD, p('M10 4.5v1M11.5 6.5v1M10 8.5v1M11.5 10.5v1'), r(9.5, 13, 3, 3.5, 1)] });
  add('files', 'File Image', 'photo picture document', { b: [p(FILE)], d: [FOLD, p('M8 18l2.5-3 1.75 2 1.5-1.5L16 18'), dot(9.5, 11.5)] });
  add('files', 'Folder Plus', 'new directory add', { b: [p(FOLDER)], d: [p('M12 10.75v6M9 13.75h6')] });
  add('files', 'Folder Download', 'save directory', { b: [p(FOLDER)], d: [l(12, 10.5, 12, 16.5), p('M9.5 14l2.5 2.5 2.5-2.5')] });
  add('files', 'Clipboard', 'paste board task', { b: [r(4.5, 4.5, 15, 16.5, 3)], d: [r(8.5, 3, 7, 3.5, 1.25), l(8.5, 11.5, 15.5, 11.5), l(8.5, 15.5, 13, 15.5)] });
  add('files', 'Sticky Note', 'memo post-it', { b: [p('M5.5 3.5h13a2 2 0 0 1 2 2V14l-6.5 6.5H5.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z')], d: [p('M14 20.25V16a2 2 0 0 1 2-2h4.25')] });
  add('files', 'Save', 'floppy disk store', { b: [p('M3.5 6a2.5 2.5 0 0 1 2.5-2.5h9.4a2 2 0 0 1 1.42.59l2.6 2.6a2 2 0 0 1 .58 1.4V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18Z')], d: [p('M7.5 20.5v-5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v5'), p('M8 4v3h6.5')] });
  add('files', 'Cloud', 'storage weather sky', { b: [p(CLOUD)] });
  add('files', 'Cloud Off', 'offline disconnected', { b: [p(CLOUD)], o: [l(3.5, 3.5, 20.5, 20.5)] });

  /* ───────── Devices ───────── */
  add('devices', 'Smartphone', 'mobile phone cell', { b: [r(6, 2.75, 12, 18.5, 3)], d: [l(10.5, 18, 13.5, 18)] });
  add('devices', 'Tablet', 'ipad device', { b: [r(4, 2.75, 16, 18.5, 3)], d: [l(10.5, 18, 13.5, 18)] });
  add('devices', 'Smartwatch', 'wearable time', { b: [r(6, 6, 12, 12, 3.5)], d: [p('M12 9.5V12l1.5 1.5')], o: [p('M8.5 6l.6-2.6a1 1 0 0 1 .9-.65h4a1 1 0 0 1 .9.65L15.5 6'), p('M8.5 18l.6 2.6a1 1 0 0 0 .9.65h4a1 1 0 0 0 .9-.65L15.5 18')] });
  add('devices', 'Keyboard', 'type input keys', { b: [r(2.75, 5.5, 18.5, 13, 3)], d: [dot(6.5, 9.5), dot(9.5, 9.5), dot(12.5, 9.5), dot(15.5, 9.5), dot(17.5, 12.25), dot(6.5, 12.25), l(8.5, 15, 15.5, 15)] });
  add('devices', 'Mouse', 'pointer click device', { b: [r(6.5, 3, 11, 18, 5.5)], d: [l(12, 6.5, 12, 9.5)] });
  add('devices', 'Chip', 'cpu processor hardware', { b: [r(6, 6, 12, 12, 2.5)], d: [r(9.5, 9.5, 5, 5, 1)], o: [p('M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3')] });
  add('devices', 'Server', 'hosting rack database', { b: [r(3.5, 3.5, 17, 7, 2.5), r(3.5, 13.5, 17, 7, 2.5)], d: [dot(7, 7), dot(7, 17), l(11, 7, 16.5, 7), l(11, 17, 16.5, 17)] });
  add('devices', 'Plug', 'power socket electric', { b: [p('M6.5 7h11v3a5.5 5.5 0 0 1-11 0Z')], o: [p('M9 3v4M15 3v4'), l(12, 15.5, 12, 21)] });
  add('devices', 'Lightbulb', 'idea light lamp', { b: [p('M12 3a6.25 6.25 0 0 0-3.75 11.25c.6.45 1 1.15 1 1.9V17h5.5v-.85c0-.75.4-1.45 1-1.9A6.25 6.25 0 0 0 12 3Z')], o: [l(9.75, 20.5, 14.25, 20.5)] });
  add('devices', 'Cast', 'airplay screen mirror', { o: [p('M3.5 13V7a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20.5 7v10a2.5 2.5 0 0 1-2.5 2.5h-4'), p('M3.5 16.5a3 3 0 0 1 3 3'), p('M3.5 13a6.5 6.5 0 0 1 6.5 6.5'), c(3.75, 19.5, 0.5, 1)] });
  add('devices', 'Desktop', 'imac computer', { b: [r(2.75, 3.5, 18.5, 13.5, 3)], d: [l(3.25, 13.25, 20.75, 13.25)], o: [p('M9.5 17l-.75 3.5h6.5L14.5 17'), l(7.5, 20.5, 16.5, 20.5)] });

  /* ───────── Connectivity ───────── */
  add('connectivity', 'Signal', 'cellular network bars', { b: [r(3.5, 15, 3, 5.5, 1), r(8.5, 11.5, 3, 9, 1), r(13.5, 8, 3, 12.5, 1), r(18.5, 4, 3, 16.5, 1)] });
  add('connectivity', 'Antenna', 'tower broadcast radio', { b: [c(12, 9.5, 1.75)], o: [l(12, 11.25, 12, 21), p('M8.1 13.4a5.5 5.5 0 0 1 0-7.8'), p('M15.9 5.6a5.5 5.5 0 0 1 0 7.8'), p('M5.3 16.2a9.5 9.5 0 0 1 0-13.4'), p('M18.7 2.8a9.5 9.5 0 0 1 0 13.4')] });
  add('connectivity', 'WiFi Off', 'no internet offline', { o: [p('M2.8 10.3a13 13 0 0 1 18.4 0'), p('M5.6 12.65a9 9 0 0 1 12.8 0'), p('M8.45 15.5a5 5 0 0 1 7.1 0'), c(12, 18.75, 0.75, 1), l(3.5, 3.5, 20.5, 20.5)] });
  add('connectivity', 'Network', 'nodes share topology', { b: [c(12, 5, 2.25), c(5, 18, 2.25), c(19, 18, 2.25)], o: [l(10.9, 7, 6.1, 16), l(13.1, 7, 17.9, 16), l(7.25, 18, 16.75, 18)] });
  add('space', 'Satellite', 'space orbit signal', { b: [r(9, 9, 6, 6, 1.5, rot(45))], o: [p('M8.5 8.5 5.4 5.4'), p('M3 7.8l4.8-4.8 2.6 2.6-4.8 4.8Z'), p('M15.5 15.5l3.1 3.1'), p('M21 16.2l-4.8 4.8-2.6-2.6 4.8-4.8Z')] });

  /* ───────── Commerce & Finance ───────── */
  add('commerce', 'Credit Card', 'payment debit visa bank', { b: [r(2.75, 5, 18.5, 14, 3)], d: [l(3.25, 9.75, 20.75, 9.75), l(6.5, 15, 9.5, 15)] });
  add('commerce', 'Dollar', 'money currency usd price', { o: [l(12, 3, 12, 21), p('M16.5 7.5c-.6-1.5-2.3-2.5-4.5-2.5-2.6 0-4.5 1.3-4.5 3.25S9 11 12 11.75s4.75 1.6 4.75 3.6S14.8 19 12 19c-2.3 0-4.1-1-4.75-2.75')] });
  add('commerce', 'Coin', 'money token cash', { b: [CIRCLE], d: [p('M14.6 9.25c-.4-.9-1.3-1.5-2.6-1.5-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4.3 0 1.1-1.1 2-2.7 2-1.3 0-2.3-.6-2.7-1.6'), p('M12 6.5v1.25M12 16v1.5')] });
  add('commerce', 'Bank', 'finance building institution', { b: [p('M3.5 9 12 3.75 20.5 9Z')], o: [l(3.5, 20.5, 20.5, 20.5), l(6, 12, 6, 17.5), l(10, 12, 10, 17.5), l(14, 12, 14, 17.5), l(18, 12, 18, 17.5)] });
  add('commerce', 'Receipt', 'invoice bill purchase', { b: [p('M5.5 3.5h13v17l-2.2-1.5-2.2 1.5-2.1-1.5-2.1 1.5-2.2-1.5-2.2 1.5Z')], d: [l(9, 8, 15, 8), l(9, 11.5, 15, 11.5), l(9, 15, 12, 15)] });
  add('commerce', 'Price Tag', 'label sale discount', { b: [p('M3.5 4.75v6.2a2 2 0 0 0 .6 1.4l7.95 7.95a2 2 0 0 0 2.83 0l5.33-5.33a2 2 0 0 0 0-2.83L12.26 4.2a2 2 0 0 0-1.41-.59H4.65A1.15 1.15 0 0 0 3.5 4.75Z')], d: [c(8, 8, 1.25)] });
  add('commerce', 'Store', 'shop market retail', { b: [p('M3.5 8.5 5 4.5a1.5 1.5 0 0 1 1.4-1h11.2a1.5 1.5 0 0 1 1.4 1l1.5 4a2.75 2.75 0 0 1-5.5.25 2.75 2.75 0 0 1-5.5 0A2.75 2.75 0 0 1 3.5 8.5Z'), p('M4.5 13.25v6.25a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-6.25Z')], d: [p('M9.5 20.5v-3.5a2.5 2.5 0 0 1 5 0v3.5')] });
  add('commerce', 'Package', 'box delivery shipping parcel', { b: [p('M12 3 20 7.5v9L12 21l-8-4.5v-9Z')], d: [p('M4.3 7.6 12 12l7.7-4.4'), l(12, 12, 12, 20.75), l(8, 5.25, 16, 9.75)] });
  add('commerce', 'Truck', 'delivery shipping transport', { b: [p('M2.75 6.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v9H2.75Z'), p('M14.75 9h3.4a1.5 1.5 0 0 1 1.2.6l1.6 2.15a1.5 1.5 0 0 1 .3.9v2.85h-6.5Z')], o: [c(7, 18, 2), c(17, 18, 2)] });
  add('commerce', 'Diamond', 'gem luxury premium jewel', { b: [p('M7 4h10l4 5-9 11L3 9Z')], d: [l(3.5, 9, 20.5, 9), p('M12 19.5 8.75 9l2-4.75'), p('M12 19.5 15.25 9l-2-4.75')] });
  add('commerce', 'Crown', 'king premium vip luxury', { b: [p('M3.5 7.5l4.25 3.75L12 5l4.25 6.25L20.5 7.5l-1.5 10.5H5Z')], o: [l(5.5, 20.75, 18.5, 20.75)] });
  add('commerce', 'Piggy Bank', 'savings money', { b: [p('M4.5 12c0-3.6 3.4-6.5 7.75-6.5 1.9 0 3.6.55 4.95 1.45l2.3-.7-.5 2.6c.6.75 1 1.6 1.2 2.55h.8v3.2h-1.3a7.3 7.3 0 0 1-2.2 2.6V20h-2.5v-1.7a9 9 0 0 1-3.5 0V20H9v-2.2A6.2 6.2 0 0 1 4.5 12Z')], d: [dot(16, 10.5), l(10, 8.75, 13, 8.75)] });
  add('commerce', 'Chart Wallet', 'budget expense', { b: [r(3, 5.5, 18, 14, 3.5)], d: [p('M21 10.5h-4a2 2 0 0 0 0 4h4'), dot(17, 12.5)], o: [p('M6 5.5 14.6 3a1.5 1.5 0 0 1 1.9 1.45V5.5')] });

  /* ───────── People & Social ───────── */
  add('people', 'User Check', 'verified approved account', { b: [USER_HEAD, USER_BODY], o: [p('M16 10.5l1.75 1.75L21.5 8.5')] });
  add('people', 'User Minus', 'remove account', { b: [USER_HEAD, USER_BODY], o: [l(16, 10.25, 21.5, 10.25)] });
  add('people', 'User X', 'delete block account', { b: [USER_HEAD, USER_BODY], o: [p('M16.5 8.25 20.5 12.25M20.5 8.25l-4 4')] });
  add('people', 'User Circle', 'avatar profile account', { b: [CIRCLE], d: [c(12, 10, 2.75), p('M6.6 18.1a6.5 6.5 0 0 1 10.8 0')] });
  add('people', 'ID Card', 'identity badge license', { b: [r(2.75, 4.5, 18.5, 15, 3)], d: [c(8.5, 11, 2), p('M5.75 16a3 3 0 0 1 5.5 0'), l(14, 10, 18, 10), l(14, 13.5, 17, 13.5)] });
  add('social', 'Smile', 'happy emoji face', { b: [CIRCLE], d: [p('M8.5 14.25a4.5 4.5 0 0 0 7 0'), c(9, 9.75, 0.5, 1), c(15, 9.75, 0.5, 1)] });
  add('social', 'Sad', 'unhappy emoji face', { b: [CIRCLE], d: [p('M8.5 16.25a4.5 4.5 0 0 1 7 0'), c(9, 9.75, 0.5, 1), c(15, 9.75, 0.5, 1)] });
  add('social', 'Neutral', 'meh emoji face', { b: [CIRCLE], d: [l(9, 15.25, 15, 15.25), c(9, 9.75, 0.5, 1), c(15, 9.75, 0.5, 1)] });
  add('social', 'Wink', 'playful emoji face', { b: [CIRCLE], d: [p('M8.5 14.25a4.5 4.5 0 0 0 7 0'), c(9, 9.75, 0.5, 1), p('M13.75 9.75h2.5')] });
  add('social', 'Thumbs Up', 'like approve good', { b: THUMB, d: [l(7.5, 11, 7.5, 19.75)] });
  add('social', 'Thumbs Down', 'dislike reject bad', { b: THUMB, d: [l(7.5, 11, 7.5, 19.75)], t: FLIP_Y });
  add('social', 'Heart Pulse', 'health love life', { b: [p(HEART)], d: [p('M5 12h2.75l1.5-2.5 2.5 5 2-3.5h5.25')] });
  add('space', 'Sparkles', 'ai magic new shine', { b: [SPARK(10.5, 10.5, 1), SPARK(18.25, 18.25, 0.43)] });
  add('social', 'Award', 'badge achievement ribbon', { b: [c(12, 9.5, 6)], d: [c(12, 9.5, 2.5)], o: [p('M8.5 14.4 7.5 21l4.5-2 4.5 2-1-6.6')] });

  /* ───────── People (expanded) ───────── */
  add('people', 'User Settings', 'account preferences profile gear', { b: USER, k: [c(17.5, 17.5, 3.25)], o: [c(17.5, 17.5, 1.25), p('M17.5 14v1M17.5 20v1M14 17.5h1M20 17.5h1M15.03 15.03l.7.7M19.27 19.27l.7.7M15.03 19.97l.7-.7M19.27 15.73l.7-.7')] });
  add('people', 'User Lock', 'account private secure', { b: USER, k: [r(14.5, 14, 6, 7, 1.5)], o: [r(14.5, 16.5, 6, 4.5, 1.25), p('M15.75 16.5v-1.25a1.75 1.75 0 0 1 3.5 0v1.25')] });
  add('people', 'User Heart', 'favorite friend follow love', { b: USER, k: [c(17.5, 17.75, 2.5)], o: [p('M17.5 21c-.2 0-3.5-1.9-3.5-4 0-1.1.8-2 1.85-2 .7 0 1.3.4 1.65 1 .35-.6.95-1 1.65-1 1.05 0 1.85.9 1.85 2 0 2.1-3.3 4-3.5 4Z')] });
  add('people', 'User Star', 'vip favorite premium member', { b: USER, k: [c(17.5, 17.75, 3)], o: [star(17.5, 17.9, 3.75, 1.6)] });
  add('people', 'User Search', 'find people lookup', { b: USER, k: [c(17, 17, 3)], o: [c(17, 17, 2.75), l(19, 19, 21, 21)] });
  add('people', 'User Edit', 'profile modify pencil', { b: USER, k: [p('M14 21l.5-2.5 4.25-4.25a1.25 1.25 0 0 1 1.75 1.75L16.25 20.25Z')], o: [p('M14 21l.5-2.5 4.25-4.25a1.25 1.25 0 0 1 1.75 1.75L16.25 20.25Z')] });
  add('people', 'User Clock', 'away status time pending', { b: USER, k: [c(17.5, 17.5, 3.5)], o: [c(17.5, 17.5, 3.5), p('M17.5 16v1.5l1 1')] });
  add('people', 'User Location', 'nearby people place', { b: USER, k: [c(17.5, 16.75, 3)], o: [p('M17.5 21.5s-3.25-2.6-3.25-5.1a3.25 3.25 0 0 1 6.5 0c0 2.5-3.25 5.1-3.25 5.1Z'), c(17.5, 16.4, 0.4, 1)] });
  add('people', 'User Switch', 'change account swap', { b: USER, k: [r(14.5, 13.75, 6, 7.5, 1)], o: [p('M14.5 15.5h6l-1.75-1.75'), p('M20.5 19.5h-6l1.75 1.75')] });
  add('people', 'User Shield', 'protected account admin', { b: USER, k: [p('M17.5 13.75 20.75 15v2.25c0 2-1.4 3.6-3.25 4.25-1.85-.65-3.25-2.25-3.25-4.25V15Z')], o: [p('M17.5 13.75 20.75 15v2.25c0 2-1.4 3.6-3.25 4.25-1.85-.65-3.25-2.25-3.25-4.25V15Z')] });
  add('people', 'User Share', 'invite refer forward', { b: USER, k: [r(14.5, 14.5, 6.5, 6, 1)], o: [l(14.75, 17.5, 21, 17.5), p('M18.75 15.25 21 17.5l-2.25 2.25')] });
  add('people', 'User Crown', 'vip king owner premium', { b: USER, k: [r(14, 14.5, 7, 6, 1)], o: [p('M14.25 15.75l1.5 1.25 1.75-2.25 1.75 2.25 1.5-1.25-.6 4.75h-5.3Z')] });
  // Badges sit top-right (like the Signature 'User Plus'), clear of the body
  // badge glyphs are drawn around (17.5, 17.5); the core scales them into the 16–21.5 badge box with a true stroke
  I.filter((d) => d.b === USER).forEach((d) => (d.badge = { x: 18.75, y: 10.25, s: 0.8 }));
  add('people', 'User Voice', 'speak talk audio speaker', { b: USER, o: [p('M17.25 5.5a3.75 3.75 0 0 1 0 4.5'), p('M19.75 3.5a7 7 0 0 1 0 8.5')] });
  add('people', 'User Square', 'profile avatar account frame', { b: [SQUARE], d: [c(12, 10, 2.75), p('M7.25 19.75a5.25 5.25 0 0 1 9.5 0')] });
  add('people', 'Team', 'group community members', { b: [c(12, 7, 3.25), e(12, 17, 6, 3.25)], o: [p('M6 10a3 3 0 0 1 0-6'), p('M18 10a3 3 0 0 0 0-6'), p('M4.5 14c-1.5.5-2.5 1.35-2.5 2.3 0 .65.45 1.25 1.2 1.7'), p('M19.5 14c1.5.5 2.5 1.35 2.5 2.3 0 .65-.45 1.25-1.2 1.7')] });
  add('people', 'Hand', 'palm stop wave raise', { b: [p('M6.5 12.5V7a1.5 1.5 0 0 1 3 0V5a1.5 1.5 0 0 1 3 0v-.5a1.5 1.5 0 0 1 3 0V6a1.5 1.5 0 0 1 3 0v8.5l.75-1.3a1.4 1.4 0 0 1 2.45 1.35l-2.6 4.75a5.5 5.5 0 0 1-4.95 3.2H12a5.5 5.5 0 0 1-5.5-5.5Z')], d: [l(9.5, 7, 9.5, 11.5), l(12.5, 5, 12.5, 11.5), l(15.5, 6, 15.5, 11.5)] });
  add('people', 'Accessibility', 'a11y inclusive disability', { b: [c(12, 5, 1.75)], o: [p('M5.5 9 12 10.5 18.5 9'), l(12, 10.5, 12, 14.5), p('M8.75 20.5 12 14.5l3.25 6')] });
  add('people', 'Baby', 'child kid infant toddler', { b: [c(12, 13, 7.75)], d: [c(9.25, 12.5, 0.6, 1), c(14.75, 12.5, 0.6, 1), p('M10.25 16a2.5 2.5 0 0 0 3.5 0')], o: [p('M12 5.25c-.5-1.5.4-2.75 1.9-2.5')] });
  add('people', 'Person', 'human standing figure body', { b: [c(12, 4.75, 2)], o: [p('M7.5 9.25h9'), l(12, 9.25, 12, 14), p('M9.25 21 12 14l2.75 7'), p('M7.5 9.25 6.25 14'), p('M16.5 9.25l1.25 4.75')] });

  /* ───────── Security ───────── */
  add('security', 'Key', 'password access unlock', { b: [c(8, 15.5, 4.5)], d: [c(8, 15.5, 1.25)], o: [l(11.25, 12.25, 20, 3.5), l(17, 6.5, 19.5, 9), l(14.5, 9, 16.5, 11)] });
  add('security', 'Fingerprint', 'biometric touch id', { o: [p('M6.5 18.5c1-1.8 1.5-3.6 1.5-6.5a4 4 0 0 1 8 0c0 1-.05 2-.15 3'), p('M12 12c0 3.5-.75 6.5-2.25 9'), p('M3.6 15.5c.6-1.2.9-2.2.9-3.5a7.5 7.5 0 0 1 13.4-4.6'), p('M15.5 18.5c-.3 1-.7 1.9-1.2 2.7'), p('M19.4 11c.07.33.1.66.1 1 0 1.5-.1 2.9-.3 4.2')] });
  add('security', 'Face ID', 'scan biometric face', { o: [p('M3.5 8V6a2.5 2.5 0 0 1 2.5-2.5h2'), p('M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2'), p('M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2'), p('M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2'), p('M9 9.5v1'), p('M15 9.5v1'), p('M12 9.5v3.5h-1'), p('M9 15.5a4 4 0 0 0 6 0')] });
  add('security', 'Bug', 'debug virus issue', { b: [r(7, 7, 10, 13.5, 5)], d: [l(12, 11.5, 12, 19.5)], o: [p('M9 7a3 3 0 0 1 6 0'), p('M3.5 9.5 7 11'), p('M20.5 9.5 17 11'), p('M3.5 14.5H7'), p('M20.5 14.5H17'), p('M4 19.5 7.3 17'), p('M20 19.5 16.7 17')] });
  add('security', 'Shield Lock', 'secure protected private', { b: [p('M12 3 19.5 5.75v5.6c0 4.4-3.1 8.2-7.5 9.65-4.4-1.45-7.5-5.25-7.5-9.65v-5.6Z')], d: [r(9.25, 11, 5.5, 4.5, 1), p('M10.25 11V9.75a1.75 1.75 0 0 1 3.5 0V11')] });
  add('security', 'Verified', 'badge check approved', { b: [p('M10.6 3.3a2 2 0 0 1 2.8 0l1.2 1.15 1.65-.2a2 2 0 0 1 2.25 1.6l.3 1.65 1.45.8a2 2 0 0 1 .85 2.65l-.7 1.55.7 1.55a2 2 0 0 1-.85 2.65l-1.45.8-.3 1.65a2 2 0 0 1-2.25 1.6l-1.65-.2-1.2 1.15a2 2 0 0 1-2.8 0l-1.2-1.15-1.65.2a2 2 0 0 1-2.25-1.6l-.3-1.65-1.45-.8a2 2 0 0 1-.85-2.65l.7-1.55-.7-1.55a2 2 0 0 1 .85-2.65l1.45-.8.3-1.65a2 2 0 0 1 2.25-1.6l1.65.2Z')], d: [p('M8.75 12.25 11 14.5l4.25-4.5')] });

  /* ───────── Weather & Nature ───────── */
  add('nature', 'Sun', 'day light bright weather', { b: [c(12, 12, 4)], o: [l(12, 2.75, 12, 4.5), l(12, 19.5, 12, 21.25), l(2.75, 12, 4.5, 12), l(19.5, 12, 21.25, 12), l(5.45, 5.45, 6.7, 6.7), l(17.3, 17.3, 18.55, 18.55), l(5.45, 18.55, 6.7, 17.3), l(17.3, 6.7, 18.55, 5.45)] });
  add('nature', 'Cloud Rain', 'weather rainy storm', { b: [p(CLOUD_S)], o: [l(8, 18.5, 7.25, 21), l(12, 18.5, 11.25, 21), l(16, 18.5, 15.25, 21)] });
  add('nature', 'Cloud Snow', 'weather winter cold', { b: [p(CLOUD_S)], o: [c(8, 19, 0.5, 1), c(12, 20.5, 0.5, 1), c(16, 19, 0.5, 1)] });
  add('nature', 'Cloud Lightning', 'storm thunder weather', { b: [p(CLOUD_S)], o: [p('M12.75 15.5l-2 3.25h3l-2 3')] });
  add('nature', 'Cloud Sun', 'partly cloudy weather', { b: [p('M9 20h8.5a3.5 3.5 0 0 0 .3-7A4.75 4.75 0 0 0 8.9 12.6 3.75 3.75 0 0 0 9 20Z')], o: [p('M5.35 11.6A4 4 0 1 1 12 8.1'), l(9, 2.5, 9, 3.25), l(3.25, 8.25, 2.5, 8.25), l(4.9, 4.1, 4.4, 3.6), l(13.1, 4.1, 13.6, 3.6)] });
  add('nature', 'Snowflake', 'winter cold ice', { o: [l(12, 3, 12, 21), l(4.2, 7.5, 19.8, 16.5), l(4.2, 16.5, 19.8, 7.5), p('M9.5 4.5 12 7l2.5-2.5'), p('M9.5 19.5 12 17l2.5 2.5')] });
  add('nature', 'Wind', 'air breeze weather', { o: [p('M3 8.5h10.5a2.5 2.5 0 1 0-2.5-2.5'), p('M3 12.5h15a3 3 0 1 1-3 3'), p('M3 16.5h6')] });
  add('nature', 'Umbrella', 'rain protection insurance', { b: [p('M3 12.5a9 9 0 0 1 18 0Z')], o: [p('M12 12.5v6a2.25 2.25 0 0 1-4.5 0'), l(12, 3.5, 12, 2.5)] });
  add('nature', 'Thermometer', 'temperature heat weather', { b: [p('M9.5 5a2.5 2.5 0 0 1 5 0v8.6a4.25 4.25 0 1 1-5 0Z')], d: [l(12, 9, 12, 16)] });
  add('nature', 'Water Drop', 'liquid humidity water', { b: [p('M12 3.5c3.2 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 2.8-6.9 6-10.5Z')], d: [p('M9 14.5a3 3 0 0 0 2.5 2.75')] });
  add('nature', 'Leaf', 'eco green nature plant', { b: [p('M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Z')], d: [l(8.5, 15.5, 14, 10)], o: [l(3.5, 20.5, 5, 19)] });
  add('nature', 'Tree', 'forest park nature pine', { b: [p('M12 2.75 18 11h-2.25l3.75 5.5h-15L8.25 11H6Z')], o: [l(12, 16.5, 12, 21.25)] });
  add('nature', 'Sprout', 'plant grow seedling', { b: [p('M12 13c0-4-2.5-6.5-7-6.5 0 4 2.5 6.5 7 6.5Z'), p('M12 11c0-3.5 2-6 6.5-6 0 3.5-2 6-6.5 6Z')], o: [l(12, 21, 12, 11)] });
  add('nature', 'Mountain', 'landscape peak outdoor', { b: [p('M2.75 19.5 9 8.5l3.5 6 2.5-3.5 6.25 8.5Z')], o: [c(17, 6, 1.75)] });
  add('nature', 'Flame', 'fire hot trending', { b: [p('M12 21.25c3.6 0 6.5-2.6 6.5-6.4 0-4.2-3.4-6.6-4.7-11.1-1.4 1.6-2.3 3.5-2.3 5.6-1.2-.9-2-2.2-2.3-3.6C7.2 7.6 5.5 10.6 5.5 14.85c0 3.8 2.9 6.4 6.5 6.4Z')], d: [p('M12 18.25a2.25 2.25 0 0 1-2.25-2.25c0-1.6 2.25-3.25 2.25-3.25s2.25 1.65 2.25 3.25A2.25 2.25 0 0 1 12 18.25Z')] });
  add('nature', 'Sunrise', 'morning dawn', { b: [p('M7.5 18a4.5 4.5 0 0 1 9 0Z')], o: [l(3, 18, 21, 18), l(12, 3.5, 12, 8), p('M9.5 6 12 3.5 14.5 6'), l(4.6, 11.6, 5.7, 12.7), l(19.4, 11.6, 18.3, 12.7), l(7, 21, 17, 21)] });
  add('nature', 'Rainbow', 'weather color spectrum', { o: [p('M2.75 18a9.25 9.25 0 0 1 18.5 0'), p('M6.25 18a5.75 5.75 0 0 1 11.5 0'), p('M9.75 18a2.25 2.25 0 0 1 4.5 0')] });
  add('space', 'Planet', 'space saturn galaxy orbit', { b: [c(12, 12, 5.5)], o: [p('M16.6 8.9c2.6-1.2 4.3-1.4 4.7-.7.7 1.3-3 4.5-8.3 7.5s-10.1 4.5-10.8 3.2c-.4-.7.5-2.1 2.5-3.8')] });
  add('space', 'Rocket', 'launch startup space', { b: [p('M8 16c0-5.5 6.5-12.5 12.5-12.5 0 6-7 12.5-12.5 12.5Z')], d: [c(15, 9, 1.75)], o: [p('M9.6 9.6H6l-2.5 3 4.25.6'), p('M14.4 14.4V18l-3 2.5-.6-4.25'), p('M6.25 17.75C5 18.25 4.25 19.5 4 21c1.5-.25 2.75-1 3.25-2.25')] });
  add('space', 'Shooting Star', 'meteor wish space', { b: [p('M15.5 4.3l1.3 2.65 2.9.42a.5.5 0 0 1 .28.85l-2.1 2.05.5 2.9a.5.5 0 0 1-.73.52L15.05 12.3l-2.6 1.37a.5.5 0 0 1-.72-.52l.5-2.9-2.1-2.05a.5.5 0 0 1 .27-.85l2.9-.42 1.3-2.64a.5.5 0 0 1 .9 0Z')], o: [l(3.5, 20.5, 9.5, 14.5), l(3.5, 15, 7, 11.5), l(9, 20.5, 12.5, 17)] });
  add('nature', 'Paw', 'pet animal dog cat', { b: [c(5.75, 11, 1.75), c(9.25, 6.5, 1.75), c(14.75, 6.5, 1.75), c(18.25, 11, 1.75), p('M12 12.5c2.3 0 5.5 3.8 5.5 6.2 0 1.2-1 1.8-2.2 1.8-1.4 0-2.1-.8-3.3-.8s-1.9.8-3.3.8c-1.2 0-2.2-.6-2.2-1.8 0-2.4 3.2-6.2 5.5-6.2Z')] });

  /* ───────── Travel & Places ───────── */
  add('travel', 'Car', 'vehicle auto drive', { b: [p('M4 15.5v-2.8a2 2 0 0 1 .3-1.05L6.4 8.1A2.5 2.5 0 0 1 8.5 7h7a2.5 2.5 0 0 1 2.1 1.1l2.1 3.55a2 2 0 0 1 .3 1.05v2.8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5Z')], d: [l(5.5, 11.25, 18.5, 11.25), dot(7.75, 14), dot(16.25, 14)], o: [p('M6.5 17v1.5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V17'), p('M14.5 17v1.5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V17')] });
  add('travel', 'Bus', 'transit public transport', { b: [r(5, 3, 14, 15, 3)], d: [l(5.5, 12, 18.5, 12), dot(8.5, 15), dot(15.5, 15), l(9.5, 6, 14.5, 6)], o: [l(7.5, 18, 7.5, 20.5), l(16.5, 18, 16.5, 20.5)] });
  add('travel', 'Train', 'rail metro subway', { b: [r(6, 3, 12, 14, 4)], d: [l(6.5, 10, 17.5, 10), dot(9.5, 13.5), dot(14.5, 13.5)], o: [p('M8.5 17 6.5 21'), p('M15.5 17l2 4'), l(7.75, 19.5, 16.25, 19.5)] });
  add('travel', 'Bicycle', 'bike cycle ride', { o: [c(5.75, 15.5, 3.5), c(18.25, 15.5, 3.5), p('M5.75 15.5 9 8.5h6.5l2.75 7'), p('M9 8.5l3.25 7h-6.5'), l(7.5, 6, 10.5, 6), p('M15.5 8.5 14.5 5.5h2')] });
  add('travel', 'Sailboat', 'ship boat sea', { b: [p('M3.5 14.5h17l-2.2 4.4a2 2 0 0 1-1.8 1.1H7.5a2 2 0 0 1-1.8-1.1Z'), p('M12 3.5 18 12h-6Z')], o: [l(12, 3.5, 12, 14.5)] });
  add('travel', 'Map', 'navigation atlas guide', { b: [p('M3.5 6.2v12.6a.75.75 0 0 0 1 .7L9 18l6 2 4.5-1.6a1.5 1.5 0 0 0 1-1.4V4.4a.75.75 0 0 0-1-.7L15 5.3 9 3.3 4.5 4.8a1.5 1.5 0 0 0-1 1.4Z')], d: [l(9, 3.75, 9, 17.75), l(15, 5.75, 15, 19.75)] });
  add('travel', 'Route', 'path directions trip', { b: [c(6, 18, 2.25), c(18, 6, 2.25)], o: [p('M8.25 18h7.25a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6h7.25')] });
  add('travel', 'Navigation', 'gps direction pointer', { b: [p('M20.1 3.9 13.9 20.1a.5.5 0 0 1-.93.03l-2.6-6.5-6.5-2.6a.5.5 0 0 1 .03-.93L20.1 3.9Z')] });
  add('travel', 'Fuel', 'gas station petrol', { b: [p('M5 20.5V5.5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15Z')], d: [l(7.5, 9, 11.5, 9)], o: [l(3.5, 20.5, 15.5, 20.5), p('M14 10h1.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V8.5L17.5 6')] });
  add('travel', 'Parking', 'car park sign', { b: [SQUARE], d: [p('M10 17V7.5h3a2.75 2.75 0 0 1 0 5.5h-3')] });
  add('travel', 'Luggage', 'suitcase baggage trip', { b: [r(5.5, 7, 13, 12.5, 3)], d: [l(9.5, 10.5, 9.5, 16), l(14.5, 10.5, 14.5, 16)], o: [p('M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2'), l(8.5, 19.5, 8.5, 21), l(15.5, 19.5, 15.5, 21)] });
  add('travel', 'Ticket', 'event pass admission', { b: [p('M3.5 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1.6a2.4 2.4 0 0 0 0 4.8V16a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.6a2.4 2.4 0 0 0 0-4.8Z')], d: [p('M14.5 6.75v1.5M14.5 11.25v1.5M14.5 15.75v1.5')] });
  add('travel', 'Bed', 'hotel sleep stay', { b: [c(6.75, 11.75, 1.75), p('M10.5 15.5v-5H18a3 3 0 0 1 3 3v2Z')], o: [p('M3 5v14.5'), p('M3 15.5h18v4')] });
  add('travel', 'Anchor', 'harbor marine sea', { o: [c(12, 5.5, 2), l(12, 7.5, 12, 20.5), p('M4.5 13a7.5 7.5 0 0 0 15 0'), l(8.5, 11, 15.5, 11)] });
  add('travel', 'Building', 'office company city', { b: [p('M4.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 15.5 5v15.5Z'), p('M15.5 9.5h3A1.5 1.5 0 0 1 20 11v9.5h-4.5Z')], d: [p('M8 7.5h1M11 7.5h1M8 11h1M11 11h1M8 14.5h1M11 14.5h1'), l(15.5, 10, 15.5, 20)], o: [l(2.5, 20.5, 21.5, 20.5)] });

  /* ───────── Health ───────── */
  add('health', 'Stethoscope', 'doctor medical checkup', { b: [c(19, 10.75, 2)], o: [p('M5.5 3.5h-1a1 1 0 0 0-1 1v4a5 5 0 0 0 10 0v-4a1 1 0 0 0-1-1h-1'), p('M8.5 13.5v1.5a5.25 5.25 0 0 0 10.5 0v-2.25')] });
  add('health', 'Pill', 'medicine drug capsule', { b: [r(2.6, 8.25, 18.8, 7.5, 3.75, rot(-45))], d: [l(9.35, 9.35, 14.65, 14.65)] });
  add('health', 'First Aid', 'medical kit emergency', { b: [r(3, 6.5, 18, 13.5, 3)], d: [p('M12 10v6M9 13h6')], o: [p('M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5')] });
  add('health', 'Medical Cross', 'hospital health plus', { b: [p('M9.5 4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-5h-5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h5Z')] });
  add('health', 'Activity', 'pulse heartbeat fitness', { o: [p('M3 12h3.5l2.5-7 6 14 2.5-7H21')] });
  add('health', 'DNA', 'genetics biology science', { o: [p('M7 3.5c0 5.5 10 5.5 10 8.5s-10 3-10 8.5'), p('M17 3.5c0 5.5-10 5.5-10 8.5s10 3 10 8.5'), l(8.75, 6.75, 15.25, 6.75), l(8.75, 17.25, 15.25, 17.25)] });
  add('health', 'Dumbbell', 'gym fitness workout', { b: [r(4.5, 7, 3, 10, 1.25), r(16.5, 7, 3, 10, 1.25)], o: [l(7.5, 12, 16.5, 12), l(2.75, 10, 2.75, 14), l(21.25, 10, 21.25, 14)] });
  add('health', 'Syringe', 'vaccine injection', { b: [r(6.9, 5.4, 4.5, 12.5, 1, 'rotate(45 9.15 11.65)')], o: [l(17, 3, 21, 7), l(19, 5, 15.3, 8.7), l(5.4, 18.6, 3, 21), l(10, 11.5, 11.5, 13), l(12, 9.5, 13.5, 11)] });
  add('health', 'Hospital', 'clinic healthcare building', { b: [r(4, 3.5, 16, 17, 3)], d: [p('M12 7v5M9.5 9.5h5'), p('M10 20.5v-3.5h4v3.5')] });

  /* ───────── Food & Drink ───────── */
  add('food', 'Coffee', 'cafe drink cup hot', { b: [p('M4.5 9h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z')], o: [p('M15.5 10.5h1.25a2.75 2.75 0 0 1 0 5.5H15'), l(8, 3.5, 8, 5.5), l(11.5, 3.5, 11.5, 5.5)] });
  add('food', 'Pizza', 'slice fast food', { b: [p('M12 21.25 3.6 7.1a.8.8 0 0 1 .3-1.1A16.3 16.3 0 0 1 20.1 6a.8.8 0 0 1 .3 1.1Z')], d: [p('M5.4 9.5a13 13 0 0 1 13.2 0'), c(10, 12, 0.6, 1), c(14, 12.5, 0.6, 1), c(12, 16, 0.6, 1)] });
  add('food', 'Burger', 'fast food meal', { b: [p('M4 10.5C4 6.4 7.6 3.5 12 3.5s8 2.9 8 7Z'), p('M4.5 17h15v1a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18Z')], o: [p('M3.5 13.75c1.4 0 1.4 1 2.85 1s1.4-1 2.85-1 1.4 1 2.8 1 1.4-1 2.85-1 1.4 1 2.85 1 1.4-1 2.8-1')] });
  add('food', 'Cake', 'birthday celebration party', { b: [r(4, 11, 16, 9.5, 2.5), p('M12 3c.8.9 1.25 1.6 1.25 2.25a1.25 1.25 0 0 1-2.5 0c0-.65.45-1.35 1.25-2.25Z')], d: [p('M4.5 15c1.25 0 1.9-1 3.75-1s2 1 3.75 1 1.9-1 3.75-1 2.5 1 3.75 1')], o: [l(12, 8, 12, 11)] });
  add('food', 'Apple', 'fruit healthy', { b: [p('M12 7.5c-1.2-.8-2.6-1-3.8-.8C5.6 7.1 4 9.6 4.5 13c.5 3.5 2.7 7.5 5.3 7.5 1 0 1.4-.5 2.2-.5s1.2.5 2.2.5c2.6 0 4.8-4 5.3-7.5.5-3.4-1.1-5.9-3.7-6.3-1.2-.2-2.6 0-3.8.8Z')], o: [p('M12 7.5c0-2 1-3.5 3-4')] });
  add('food', 'Wine', 'glass drink bar', { b: [p('M7 3.5h10l.5 4.25a5.5 5.5 0 0 1-11 0Z')], o: [l(12, 13.25, 12, 20.5), l(8.5, 20.5, 15.5, 20.5)] });
  add('food', 'Utensils', 'fork knife restaurant dining', { b: [p('M17.5 3.25c-2 1-3 3.2-3 5.75v5.5h3Z')], o: [l(6.5, 3, 6.5, 21), p('M4 3v5a2.5 2.5 0 0 0 5 0V3'), l(17.5, 3.25, 17.5, 21)] });
  add('food', 'Chef Hat', 'cooking kitchen recipe', { b: [p('M7 17.5v-3.3A4 4 0 0 1 7.6 6.3a4.5 4.5 0 0 1 8.8 0A4 4 0 0 1 17 14.2v3.3Z')], o: [l(7, 20.5, 17, 20.5)] });
  add('food', 'Ice Cream', 'dessert sweet cone', { b: [p('M7 10a5 5 0 0 1 10 0Z')], o: [p('M7.5 10 12 20.5 16.5 10'), l(9.25, 13.5, 13.5, 13.5)] });

  /* ───────── Education & Science ───────── */
  add('education', 'Calculator', 'math compute numbers', { b: [r(4.5, 2.75, 15, 18.5, 3)], d: [r(7.75, 6, 8.5, 3.25, 0.75), c(8.75, 13, 0.55, 1), c(12, 13, 0.55, 1), c(15.25, 13, 0.55, 1), c(8.75, 17, 0.55, 1), c(12, 17, 0.55, 1), c(15.25, 17, 0.55, 1)] });
  add('education', 'Flask', 'chemistry lab experiment', { b: [p('M9.5 3.5v5.2L4.8 17.6A2 2 0 0 0 6.6 20.5h10.8a2 2 0 0 0 1.8-2.9L14.5 8.7V3.5Z')], d: [l(6.9, 14, 17.1, 14)], o: [l(8, 3.5, 16, 3.5)] });
  add('education', 'Atom', 'science physics nuclear', { b: [c(12, 12, 1.25)], o: [e(12, 12, 9.25, 3.75), e(12, 12, 9.25, 3.75, 'rotate(60 12 12)'), e(12, 12, 9.25, 3.75, 'rotate(-60 12 12)')] });
  add('education', 'Puzzle', 'piece solve plugin', { b: [p('M10 3.5a2 2 0 0 1 2 2v1h3.5a1 1 0 0 1 1 1V11h1a2 2 0 1 1 0 4h-1v4.5a1 1 0 0 1-1 1H12v-1a2 2 0 1 0-4 0v1H4.5a1 1 0 0 1-1-1V15h1a2 2 0 1 0 0-4h-1V7.5a1 1 0 0 1 1-1H8v-1a2 2 0 0 1 2-2Z')] });
  add('education', 'Trophy', 'winner award champion', { b: [p('M7 3.5h10V9a5 5 0 0 1-10 0Z'), p('M8.5 20.5c0-1.7 1.6-3 3.5-3s3.5 1.3 3.5 3Z')], o: [p('M7 5.5H4.5V7A3.5 3.5 0 0 0 7.5 10.5'), p('M17 5.5h2.5V7a3.5 3.5 0 0 1-3 3.5'), l(12, 14, 12, 17.5)] });
  add('education', 'Medal', 'prize ribbon winner', { b: [c(12, 15, 5)], d: [c(12, 15, 2)], o: [p('M8.5 11.4 5.5 3.5h4l2.5 6'), p('M15.5 11.4l3-7.9h-4L13 7.5')] });
  add('education', 'Ruler', 'measure scale length', { b: [r(2.6, 8.25, 18.8, 7.5, 1.5, rot(-45))], d: [l(8.3, 10.3, 9.7, 11.7), l(10.6, 8, 12, 9.4), l(12.9, 5.7, 14.3, 7.1), l(6, 12.6, 7.4, 14)] });
  add('education', 'Microscope', 'lab biology research', { b: [r(7.75, 2.5, 4.5, 9.5, 1.5, 'rotate(-25 10 7.25)')], o: [l(5, 20.5, 19, 20.5), p('M13.6 10.2a5 5 0 0 1-1.1 8.3'), l(8, 17, 12.5, 17), l(9.6, 12.4, 8.9, 14.1)] });
  add('education', 'Backpack', 'school bag student', { b: [p('M5 10a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v8.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z')], d: [p('M8.5 20v-3.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5V20'), l(9, 10.5, 15, 10.5)], o: [p('M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1')] });

  /* ───────── Design & Text ───────── */
  add('design', 'Palette', 'color paint art', { b: [p('M12 3.5a8.5 8.5 0 0 0 0 17c1.1 0 1.75-.75 1.75-1.6 0-.45-.2-.8-.45-1.1-.25-.3-.45-.65-.45-1.1 0-.95.75-1.7 1.7-1.7h2a3.95 3.95 0 0 0 3.95-3.95C20.5 6.9 16.7 3.5 12 3.5Z')], d: [c(7.5, 11.5, 0.6, 1), c(9.5, 7.5, 0.6, 1), c(14.5, 7.5, 0.6, 1)] });
  add('design', 'Pen Tool', 'vector bezier nib', { b: [p('M12 3 17.5 9.5l-2 6.5h-7l-2-6.5Z')], d: [l(12, 3.5, 12, 9.5)], o: [r(8, 16, 8, 4.5, 1.5)] });
  add('design', 'Brush', 'paint art draw', { b: [p('M8.5 13.75c-2 0-3.5 1.5-3.5 3.5 0 1.4-.6 2.5-1.5 3.25h4.75A4 4 0 0 0 12.25 16.5c0-1.6-1.5-2.75-3.75-2.75Z')], o: [p('M10.75 13.5 19.4 4.6a1.4 1.4 0 0 1 2 2l-8.9 8.65')] });
  add('design', 'Bezier', 'vector curve path', { b: [r(10, 4, 4, 4, 1), r(3, 14, 4, 4, 1), r(17, 14, 4, 4, 1)], o: [p('M5 14c0-5 3-8 5-8'), p('M19 14c0-5-3-8-5-8'), l(3, 6, 10, 6), l(14, 6, 21, 6)] });
  add('design', 'Frame', 'artboard canvas', { o: [l(7, 3.5, 7, 20.5), l(17, 3.5, 17, 20.5), l(3.5, 7, 20.5, 7), l(3.5, 17, 20.5, 17)] });
  add('design', 'Shapes', 'circle square geometry', { b: [c(7.75, 7.75, 4.25), r(12.75, 12.75, 8, 8, 2), p('M17 3.5 21 10h-8Z')] });
  add('design', 'Eraser', 'remove clean delete', { b: [p('M14.2 3.9a2 2 0 0 1 2.83 0l3.07 3.07a2 2 0 0 1 0 2.83L10.4 19.5H7.3L3.9 16.1a2 2 0 0 1 0-2.83Z')], d: [l(9, 9.1, 14.9, 15)], o: [l(10.4, 19.5, 19.5, 19.5)] });
  add('design', 'Magic Wand', 'ai auto enhance', { b: [SPARK(18, 5.5, 0.36), SPARK(7.5, 5.25, 0.25)], o: [l(4, 20, 14.5, 9.5), l(13, 8, 16, 11)] });
  add('design', 'Pipette', 'eyedropper color picker', { b: [p('M15.5 4.6a2.2 2.2 0 0 1 3.1 0l.8.8a2.2 2.2 0 0 1 0 3.1L17 10.9 13.1 7Z')], o: [p('M14.5 8.4 6.6 16.3a2 2 0 0 0-.5.8l-.6 2.4 2.4-.6a2 2 0 0 0 .8-.5l7.9-7.9'), l(12.5, 6.5, 17.5, 11.5)] });
  add('text', 'Type', 'text font typography', { o: [p('M5 7V5.5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1V7'), l(12, 4.5, 12, 19.5), l(9, 19.5, 15, 19.5)] });
  add('text', 'Bold', 'text weight strong', { o: [p('M7 4.5h6a3.75 3.75 0 0 1 0 7.5H7Z'), p('M7 12h7a3.75 3.75 0 0 1 0 7.5H7Z')] });
  add('text', 'Italic', 'text slant emphasis', { o: [l(10, 4.5, 18, 4.5), l(6, 19.5, 14, 19.5), l(14, 4.5, 10, 19.5)] });
  add('text', 'Underline', 'text decoration', { o: [p('M7 4v6.5a5 5 0 0 0 10 0V4'), l(5, 20, 19, 20)] });
  add('text', 'Strikethrough', 'text cross delete', { o: [p('M16.5 7c-.6-1.5-2.3-2.5-4.5-2.5-2.6 0-4.5 1.3-4.5 3.25 0 1 .5 1.75 1.4 2.25'), p('M15.6 14.5c.6.5.9 1.1.9 1.9 0 1.9-1.9 3.1-4.5 3.1-2.3 0-4.1-1-4.75-2.75'), l(4, 12, 20, 12)] });
  add('text', 'Align Left', 'text paragraph', { o: [l(4, 6, 20, 6), l(4, 10, 14, 10), l(4, 14, 20, 14), l(4, 18, 14, 18)] });
  add('text', 'Align Center', 'text paragraph', { o: [l(4, 6, 20, 6), l(7, 10, 17, 10), l(4, 14, 20, 14), l(7, 18, 17, 18)] });
  add('text', 'Align Right', 'text paragraph', { o: [l(4, 6, 20, 6), l(10, 10, 20, 10), l(4, 14, 20, 14), l(10, 18, 20, 18)] });
  add('text', 'Quote', 'blockquote citation', { b: [p('M4 17.5v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z'), p('M14 17.5v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z')], o: [p('M4 12.5c0-4 1.6-6.25 4.5-7'), p('M14 12.5c0-4 1.6-6.25 4.5-7')] });
  add('text', 'Heading', 'title h1 text', { o: [l(5, 4.5, 5, 19.5), l(15, 4.5, 15, 19.5), l(5, 12, 15, 12), p('M18 10.5l2-1v10')] });

  /* ───────── Development & AI ───────── */
  add('dev', 'Code', 'html programming developer', { o: [p('M8 7 3 12l5 5'), p('M16 7l5 5-5 5'), l(13.5, 4.5, 10.5, 19.5)] });
  add('dev', 'Terminal', 'console shell cli command', { b: [r(2.75, 3.5, 18.5, 17, 4)], d: [p('M7 9l2.75 2.5L7 14'), l(12, 14.5, 16.5, 14.5)] });
  add('dev', 'Git Branch', 'version control source', { b: [c(6.5, 5.5, 2), c(6.5, 18.5, 2), c(17.5, 7.5, 2)], o: [l(6.5, 7.5, 6.5, 16.5), p('M17.5 9.5a5 5 0 0 1-5 5h-3.5a2.5 2.5 0 0 0-2.5 2')] });
  add('dev', 'Git Commit', 'version save point', { b: [c(12, 12, 3.75)], o: [l(3, 12, 8.25, 12), l(15.75, 12, 21, 12)] });
  add('dev', 'Database', 'storage sql data', { b: [e(12, 6, 7.5, 2.75), p('M4.5 6v12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75V6Z')], d: [p('M4.5 12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75'), p('M4.75 6.5c.8 1.3 3.8 2.25 7.25 2.25s6.45-.95 7.25-2.25')] });
  add('dev', 'Braces', 'json object code curly', { o: [p('M8 4h-.5A2.5 2.5 0 0 0 5 6.5v2.6a2 2 0 0 1-.9 1.67L3 11.5v1l1.1.73a2 2 0 0 1 .9 1.67v2.6A2.5 2.5 0 0 0 7.5 20H8'), p('M16 4h.5A2.5 2.5 0 0 1 19 6.5v2.6a2 2 0 0 0 .9 1.67l1.1.73v1l-1.1.73a2 2 0 0 0-.9 1.67v2.6a2.5 2.5 0 0 1-2.5 2.5H16')] });
  add('dev', 'Robot', 'ai bot assistant automation', { b: [r(4.5, 8, 15, 11.5, 4), c(12, 3.75, 1.25)], d: [c(9.25, 13, 0.9, 1), c(14.75, 13, 0.9, 1), l(10.25, 16.25, 13.75, 16.25)], o: [l(12, 5, 12, 8), l(2.75, 12.5, 2.75, 15), l(21.25, 12.5, 21.25, 15)] });
  add('dev', 'Cube', '3d box model object', { b: [p('M12 3 20 7.5v9L12 21l-8-4.5v-9Z')], d: [p('M4.3 7.6 12 12l7.7-4.4'), l(12, 12, 12, 20.75)] });
  add('dev', 'Sitemap', 'hierarchy structure tree org', { b: [r(9, 3, 6, 5, 1.5), r(3, 16, 6, 5, 1.5), r(15, 16, 6, 5, 1.5)], o: [p('M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2')] });
  add('dev', 'AI Chip', 'artificial intelligence neural', { b: [r(6, 6, 12, 12, 2.5)], d: [p('M9.5 14.5 11 9.5h.5l1.5 5M10 13h2.5'), l(15, 9.5, 15, 14.5)], o: [p('M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3')] });
  add('dev', 'AI Chat', 'assistant prompt sparkle', { b: [p('M12 3.5a8.5 8.5 0 0 0-7.4 12.7l-1 3.6a.6.6 0 0 0 .73.73l3.6-1A8.5 8.5 0 1 0 12 3.5Z')], d: [SPARK(12, 12, 0.5)] });
  add('dev', 'Bot Sparkle', 'ai agent automation', { b: [SPARK(9.5, 13.5, 1)], o: [p('M18 3.5v4M16 5.5h4'), p('M18.5 15.5v3M17 17h3')] });

  /* ───────── Charts & Data ───────── */
  add('charts', 'Chart Columns', 'bar graph statistics', { b: [r(4, 12, 4, 8.5, 1.5), r(10, 4, 4, 16.5, 1.5), r(16, 8.5, 4, 12, 1.5)] });
  add('charts', 'Presentation', 'slides chart board', { b: [r(3, 3.5, 18, 12, 2.5)], d: [p('M7.5 11.5 10 9l2 2 3.5-3.5')], o: [l(12, 15.5, 12, 18), p('M8.5 21 12 18l3.5 3')] });
  add('charts', 'Kanban', 'board tasks columns', { b: [SQUARE], d: [l(8.25, 7.5, 8.25, 16), l(12, 7.5, 12, 11.5), l(15.75, 7.5, 15.75, 13.5)] });
  add('charts', 'Table', 'grid spreadsheet data', { b: [r(3.5, 3.5, 17, 17, 3.5)], d: [l(4, 9, 20, 9), l(4, 14.75, 20, 14.75), l(9.5, 9.5, 9.5, 20)] });
  add('charts', 'Chart Area', 'graph analytics trend', { b: [p('M3.5 20.5V14l4.5-4.5 4 3 8.5-8v16Z')], o: [] });
  add('charts', 'Chart Donut', 'ring pie analytics', { o: [p('M12 3.25a8.75 8.75 0 1 0 8.75 8.75'), p('M12 7.25A4.75 4.75 0 1 0 16.75 12'), p('M15 3.75a8.8 8.8 0 0 1 5.25 5.25H15Z')] });
  add('charts', 'Scatter', 'plot points data', { o: [p('M3.5 3.5v15.5a1.5 1.5 0 0 0 1.5 1.5h15.5'), c(9, 14.5, 1, 1), c(12.5, 10, 1, 1), c(16.5, 12.5, 1, 1), c(18, 6.5, 1, 1), c(8.5, 8, 1, 1)] });

  /* ───────── Time ───────── */
  add('time', 'Hourglass', 'timer wait loading sand', { b: [p('M6.5 3.5h11v2.6a4 4 0 0 1-1.7 3.27L12 12 8.2 9.37A4 4 0 0 1 6.5 6.1Z'), p('M6.5 20.5h11v-2.6a4 4 0 0 0-1.7-3.27L12 12l-3.8 2.63A4 4 0 0 0 6.5 17.9Z')], o: [l(5, 3.5, 19, 3.5), l(5, 20.5, 19, 20.5)] });
  add('time', 'Alarm', 'clock wake reminder', { b: [c(12, 13, 7.5)], d: [p('M12 9.5V13l2 2')], o: [p('M3.75 5 6.5 2.75'), p('M20.25 5 17.5 2.75'), l(6.5, 19.5, 5, 21), l(17.5, 19.5, 19, 21)] });
  add('time', 'Stopwatch', 'timer race speed', { b: [c(12, 13.5, 7.25)], d: [l(12, 10, 12, 13.5)], o: [l(10, 2.75, 14, 2.75), l(18.25, 6.75, 19.5, 5.5)] });
  add('time', 'Calendar Check', 'event date done', { b: [r(3.5, 5, 17, 15.5, 3.5)], d: [l(4, 9.75, 20, 9.75), p('M9 14.75 11 16.5l4-4')], o: [l(8, 3, 8, 6.5), l(16, 3, 16, 6.5)] });
  add('time', 'Calendar Plus', 'event schedule add', { b: [r(3.5, 5, 17, 15.5, 3.5)], d: [l(4, 9.75, 20, 9.75), p('M12 12.5v5M9.5 15h5')], o: [l(8, 3, 8, 6.5), l(16, 3, 16, 6.5)] });

  /* ───────── Home & Lifestyle ───────── */
  add('lifestyle', 'Sofa', 'couch furniture living', { b: [p('M3 12.5a2 2 0 0 1 4 0V14h10v-1.5a2 2 0 0 1 4 0v5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z')], o: [p('M5 10.6V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2.6'), l(6, 19, 6, 20.5), l(18, 19, 18, 20.5)] });
  add('lifestyle', 'Door', 'entrance exit room', { b: [p('M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15.5Z')], d: [c(14.75, 12.5, 0.6, 1)], o: [l(3.5, 20.5, 20.5, 20.5)] });
  add('lifestyle', 'Lamp', 'light furniture decor', { b: [p('M8 3.5h8l3 7.5H5Z')], o: [l(12, 11, 12, 19), l(8, 20.5, 16, 20.5)] });
  add('lifestyle', 'T-Shirt', 'clothing fashion apparel', { b: [p('M8.5 3.5 3 6.5l1.75 4 2.25-1v11h10v-11l2.25 1 1.75-4-5.5-3a3.5 3.5 0 0 1-7 0Z')] });
  add('lifestyle', 'Glasses', 'eyewear vision read', { b: [c(6.5, 14, 3.5), c(17.5, 14, 3.5)], o: [p('M10 14a2 2 0 0 1 4 0'), p('M3 14l1.5-7.5H6'), p('M21 14l-1.5-7.5H18')] });
  add('lifestyle', 'Watch', 'time wrist accessory', { b: [c(12, 12, 5.5)], d: [p('M12 9.75V12l1.5 1')], o: [p('M8.5 7.75 9 3.5h6l.5 4.25'), p('M8.5 16.25 9 20.5h6l.5-4.25')] });
  add('lifestyle', 'Perfume', 'fragrance luxury scent', { b: [r(5.5, 9, 13, 11.5, 4)], d: [c(12, 14.75, 2.25)], o: [r(9.5, 5.5, 5, 3.5, 1), l(12, 3, 12, 5.5)] });
  add('lifestyle', 'Hanger', 'clothes wardrobe fashion', { o: [p('M10 6.25a2 2 0 1 1 2.75 1.85c-.45.2-.75.65-.75 1.15V10'), p('M12 10 3.4 16.1a1 1 0 0 0 .58 1.82h16.04a1 1 0 0 0 .58-1.82Z')] });
  add('lifestyle', 'Calendar Heart', 'date anniversary love', { b: [r(3.5, 5, 17, 15.5, 3.5)], d: [l(4, 9.75, 20, 9.75), p('M12 17.25c-.2 0-3-1.6-3-3.3 0-.9.7-1.7 1.6-1.7.6 0 1.1.3 1.4.8.3-.5.8-.8 1.4-.8.9 0 1.6.8 1.6 1.7 0 1.7-2.8 3.3-3 3.3Z')], o: [l(8, 3, 8, 6.5), l(16, 3, 16, 6.5)] });

  /* ───────── Sports & Games ───────── */
  add('games', 'Football', 'soccer ball sport', { b: [CIRCLE], d: [p('M12 8l3.3 2.4-1.25 3.85h-4.1L8.7 10.4Z'), p('M12 8V3.75'), p('M15.3 10.4l4-1.3'), p('M14.05 14.25l2.45 3.4'), p('M9.95 14.25 7.5 17.65'), p('M8.7 10.4l-4-1.3')] });
  add('games', 'Basketball', 'ball sport hoop', { b: [CIRCLE], d: [l(3.5, 12, 20.5, 12), l(12, 3.5, 12, 20.5), p('M6 5.5a9 9 0 0 1 2.5 6.5A9 9 0 0 1 6 18.5'), p('M18 5.5a9 9 0 0 0-2.5 6.5 9 9 0 0 0 2.5 6.5')] });
  add('games', 'Dice', 'game random chance', { b: [r(3.5, 3.5, 17, 17, 4.5)], d: [c(8.5, 8.5, 0.6, 1), c(15.5, 8.5, 0.6, 1), c(12, 12, 0.6, 1), c(8.5, 15.5, 0.6, 1), c(15.5, 15.5, 0.6, 1)] });
  add('games', 'Joystick', 'arcade game controller', { b: [c(12, 6, 2.75), r(4, 15, 16, 5.5, 2)], o: [l(12, 8.75, 12, 15)] });
  add('games', 'Chess Pawn', 'strategy game piece', { b: [c(12, 6.5, 3), p('M8.5 20.5c0-3.5 1.4-6.5 3.5-8.5 2.1 2 3.5 5 3.5 8.5Z')], o: [l(6.5, 20.5, 17.5, 20.5), l(9, 11.5, 15, 11.5)] });
  add('games', 'Running', 'run sprint exercise', { b: [c(15, 4.5, 1.75)], o: [p('M9 9l3-1.5 3.5 2.5-2 4 3 3.5v3'), p('M13.5 14l-2.5 2.75H6.5'), p('M15.5 10l1.5 2h3'), p('M12 7.5 9.5 7 7 9')] });
  add('games', 'Swimming', 'pool water sport', { b: [c(16.5, 5.75, 1.75)], o: [p('M3 16c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1'), p('M3 19.75c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1'), p('M6.5 12.5 11 8.5 9 5.5l3.5-2'), p('M11 8.5l3.5 4')] });
  add('games', 'Tennis', 'ball sport racket', { b: [CIRCLE], d: [p('M6 5.5a9 9 0 0 1 0 13'), p('M18 5.5a9 9 0 0 0 0 13')] });
  add('games', 'Volleyball', 'ball beach sport', { b: [CIRCLE], d: [p('M12 3.25c-.75 4.5.75 7.5 4.5 9.75'), p('M20.4 14.4c-4.1-1.6-7.6-1-10.5 2'), p('M5.5 18c1.7-4 1.7-7.6-1-11.25')] });
  add('games', 'Golf', 'flag hole course', { b: [p('M9 3.75 17 7.25 9 10.75Z')], o: [l(9, 3.75, 9, 19.5), e(9, 19.75, 5.25, 1.25)] });
  add('games', 'Bowling', 'pin strike alley', { b: [p('M12 2.75c1.5 0 2.25 1.25 2.25 2.75 0 1.25-.75 2-.75 3.25 0 1.5 2.5 3.5 2.5 7 0 2.5-1.25 4.75-1.75 5.5h-4.5c-.5-.75-1.75-3-1.75-5.5 0-3.5 2.5-5.5 2.5-7 0-1.25-.75-2-.75-3.25 0-1.5.75-2.75 2.25-2.75Z')], d: [l(10.5, 9, 13.5, 9)] });
  add('games', 'Ping Pong', 'table tennis paddle', { b: [c(9.5, 9.5, 6.25), r(13, 15.5, 8.5, 3.25, 1.6, 'rotate(45 17.25 17.1)'), c(19.25, 4.75, 1.75)], d: [l(13.6, 13.6, 14.6, 14.6)] });
  add('games', 'Whistle', 'referee coach sport', { b: [p('M8.75 7.5H20a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1h-5.6A5.75 5.75 0 1 1 8.75 7.5Z')], d: [c(8.75, 13.25, 1.75)] });
  add('games', 'Playing Cards', 'poker casino deck', { b: [r(8, 4.5, 11, 15, 2.5)], d: [p('M13.5 14.75c-.15 0-2.5-1.35-2.5-2.85 0-.8.6-1.4 1.3-1.4.5 0 .95.3 1.2.7.25-.4.7-.7 1.2-.7.7 0 1.3.6 1.3 1.4 0 1.5-2.35 2.85-2.5 2.85Z')], o: [p('M8 7.25 5.6 7.9a1.5 1.5 0 0 0-1.05 1.85l2.6 9.6a1.5 1.5 0 0 0 1.85 1.05L12 19.5')] });
  add('games', 'Kettlebell', 'gym weight workout', { b: [p('M12 8.75a6.25 6.25 0 0 1 5.4 9.4c-.25.45-.75.6-1.25.6H7.85c-.5 0-1-.15-1.25-.6A6.25 6.25 0 0 1 12 8.75Z')], o: [p('M8.5 9.5 8 7.5a4 4 0 0 1 8 0l-.5 2')] });
  add('games', 'Tent', 'camping outdoor adventure', { b: [p('M12 3.75 20.75 19.5H3.25Z')], d: [p('M9.25 19.5 12 13.5l2.75 6')] });
  add('games', 'Handheld Console', 'retro game boy portable', { b: [r(5.5, 2.75, 13, 18.5, 3)], d: [r(8, 5.5, 8, 6.5, 1), p('M8.75 16h2.5M10 14.75v2.5'), c(14.75, 15, 0.45, 1), c(15.75, 17, 0.45, 1)] });
  add('games', 'VR Headset', 'virtual reality metaverse goggles', { b: [p('M2.75 9.5a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-3.1a1.5 1.5 0 0 1-1.3-.75L12 15l-.85 1.75a1.5 1.5 0 0 1-1.3.75h-4.1a3 3 0 0 1-3-3Z')] });
  add('games', 'Ghost', 'arcade halloween spooky', { b: [p('M5 20.5V11a7 7 0 0 1 14 0v9.5l-2.33-1.75-2.34 1.75L12 18.75l-2.33 1.75-2.34-1.75Z')], d: [c(9.5, 11, 0.6, 1), c(14.5, 11, 0.6, 1)] });
  add('games', 'Race Flag', 'checkered finish racing', { b: [p('M5 4h13.5l-2 4 2 4H5Z')], d: [l(9.5, 4.5, 9.5, 11.5), l(14, 4.5, 14, 11.5), l(5.5, 8, 16.75, 8)], o: [l(5, 3.5, 5, 21)] });
  add('games', 'Podium', 'leaderboard rank winner', { b: [r(9.25, 6.5, 5.5, 14, 1.25), r(2.75, 11, 5.5, 9.5, 1.25), r(15.75, 13.5, 5.5, 7, 1.25)] });

  /* ───────── Space & Galaxy ───────── */
  add('space', 'Galaxy', 'spiral cosmos universe', { b: [c(12, 12, 2)], o: [p('M12 4.5c4.5 0 7.5 3 7.5 6.5S16.5 17 13 17'), p('M12 19.5c-4.5 0-7.5-3-7.5-6.5S7.5 7 11 7')] });
  add('space', 'Moon Crescent', 'night lunar sky', { b: [p('M15.5 3.75A8.5 8.5 0 1 0 20.25 15 6.75 6.75 0 0 1 15.5 3.75Z')] });
  add('space', 'Star Four', 'twinkle shine sparkle', { b: [SPARK(12, 12, 1.25)] });
  add('space', 'Constellation', 'stars map astronomy', { b: [c(5, 7, 1.5), c(11, 4.5, 1.5), c(17.5, 9, 1.5), c(14, 15, 1.5), c(7, 18.5, 1.5)], o: [l(6.4, 6.4, 9.6, 5.1), l(12.3, 5.4, 16.2, 8.1), l(16.8, 10.3, 14.7, 13.7), l(12.6, 15.7, 8.4, 17.8)] });
  add('space', 'Telescope', 'astronomy observe stargazing', { b: [r(4.5, 6.5, 14, 5, 2, 'rotate(-20 11.5 9)')], o: [l(18.5, 4.5, 20.5, 9.5), p('M10.5 12.5 7 20.5'), p('M12.5 12.5l3.5 8'), l(11.5, 11.5, 11.5, 13.5)] });
  add('space', 'Astronaut', 'cosmonaut helmet space', { b: [c(12, 10, 6.5)], d: [r(8, 7.5, 8, 5, 2.5)], o: [p('M7.5 15.5v3a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-3')] });
  add('space', 'UFO', 'alien spaceship flying saucer', { b: [e(12, 13, 9.25, 3.25), p('M7.5 11.5a4.5 4.5 0 0 1 9 0')], d: [dot(8, 13.25), dot(12, 13.75), dot(16, 13.25)], o: [l(7, 17.5, 6, 20), l(17, 17.5, 18, 20)] });
  add('space', 'Orbit', 'rotation path planet', { b: [c(12, 12, 3)], o: [e(12, 12, 9.25, 4.5, 'rotate(-30 12 12)'), c(19.25, 6.75, 1, 1)] });
  add('space', 'Comet', 'meteor asteroid tail', { b: [c(16.5, 7.5, 3.5)], o: [l(3.5, 20.5, 13.5, 10.5), l(6.5, 13.5, 12, 8), l(10.5, 17.5, 16, 12)] });

  window.ICONLI_EXT = I;
  // Drawing kit shared with the per-category files (icons-cat-*.js), which append to the same list.
  window.IconLiDSL = { add, p, c, r, l, e, dot, star, rot, FLIP_X, FLIP_Y, FILE, FOLD, FOLDER, CLOUD, CLOUD_S, HEART, CIRCLE, SQUARE, THUMB, SPARK, USER_HEAD, USER_BODY, USER };
})();
