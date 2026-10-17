/* IconLi — Office & Business (roadmap P1). Original drawings on the Signature grid. */
(function () {
  const { add, p, c, r, l, e, FILE, FOLD } = window.IconLiDSL;
  const C = 'office';
  const DOLLAR = (cx, cy, s = 1) => [
    p(`M${cx + 1.75 * s} ${cy - 2.25 * s}c-.3-.6-1-1-1.85-1-1.05 0-1.8.55-1.8 1.3 0 1.8 3.8 1 3.8 2.9 0 .8-.8 1.35-1.95 1.35-.9 0-1.65-.4-1.95-1`),
    l(cx, cy - 4.25 * s, cx, cy - 3.4 * s), l(cx, cy + 2.4 * s, cx, cy + 3.25 * s),
  ];

  add(C, 'Handshake', 'deal agreement partner business welcome', { b: [p('M2.75 13V8.25l3.25-2 3.5 1.25h2.25l-3.5 3.25a1.25 1.25 0 0 0 1.75 1.8L12.75 10l5.75 5a1.25 1.25 0 0 1-1.7 1.8l-.8-.7a1.25 1.25 0 0 1-1.75 1.75l-.75-.65a1.25 1.25 0 0 1-1.75 1.6L9.5 16.5 7 14.75Z')], o: [p('M21.25 13V8.25L18 6.25l-3.75 1.25'), l(18.5, 15, 21.25, 13)] });
  add(C, 'Meeting', 'team conference table people discussion', { b: [c(7.25, 7.75, 2.25), c(12, 5.75, 2.25), c(16.75, 7.75, 2.25), r(3.25, 12.5, 17.5, 4.75, 2.25)], o: [l(6.5, 17.25, 6.5, 20.5), l(17.5, 17.25, 17.5, 20.5)] });
  add(C, 'Contract', 'agreement signed document legal paper', { b: [p(FILE)], d: [FOLD, l(8.5, 11, 15.5, 11), p('M8.5 16.75c1-1.5 1.75-1.5 2 0s1.25 1.25 2-.5 1.5-.5 2.5.5')] });
  add(C, 'Stamp', 'approve seal official rubber', { b: [p('M9.5 3.5h5a1 1 0 0 1 1 1v.8a3 3 0 0 1-1 2.2l-.6.6a2 2 0 0 0-.65 1.5V12H17a2 2 0 0 1 2 2v2H5v-2a2 2 0 0 1 2-2h3.75V9.6a2 2 0 0 0-.65-1.5l-.6-.6a3 3 0 0 1-1-2.2v-.8a1 1 0 0 1 1-1Z')], o: [l(5, 20, 19, 20)] });
  add(C, 'Org Chart', 'hierarchy team structure organisation', { b: [c(12, 5, 2.25), c(5.5, 17.5, 2.25), c(12, 17.5, 2.25), c(18.5, 17.5, 2.25)], o: [l(12, 7.25, 12, 15.25), p('M5.5 15.25V13a1.5 1.5 0 0 1 1.5-1.5h10a1.5 1.5 0 0 1 1.5 1.5v2.25')] });
  add(C, 'Invoice', 'bill payment receipt dollar', { b: [p('M5.5 3.5h13v17l-2.2-1.5-2.2 1.5-2.1-1.5-2.1 1.5-2.2-1.5-2.2 1.5Z')], d: [...DOLLAR(12, 10, 0.9), l(8.5, 16.25, 15.5, 16.25)] });
  add(C, 'Gauge', 'kpi performance speed dashboard meter', { b: [p('M3.25 16.5a8.75 8.75 0 0 1 17.5 0 1.5 1.5 0 0 1-1.5 1.5H4.75a1.5 1.5 0 0 1-1.5-1.5Z')], d: [l(12, 15.25, 15.5, 10.5), c(12, 15.25, 0.6, 1)] });
  add(C, 'ID Badge', 'employee pass lanyard staff', { b: [r(6, 7, 12, 14, 3)], d: [c(12, 12.25, 2), p('M8.75 18a3.25 3.25 0 0 1 6.5 0')], o: [p('M10 7V3.5h4V7')] });
  add(C, 'Whiteboard', 'presentation board class plan', { b: [r(3, 3.5, 18, 12.5, 2.5)], d: [l(7, 8, 13, 8), l(7, 11.5, 11, 11.5)], o: [l(8, 20.5, 10, 16), l(16, 20.5, 14, 16)] });
  add(C, 'Clipboard Check', 'task done checklist approved', { b: [r(4.5, 4.5, 15, 16.5, 3)], d: [r(8.5, 3, 7, 3.5, 1.25), p('M8.75 13.5 11 15.75l4.25-4.5')] });
  add(C, 'Clipboard List', 'tasks todo checklist agenda', { b: [r(4.5, 4.5, 15, 16.5, 3)], d: [r(8.5, 3, 7, 3.5, 1.25), c(8.75, 11, 0.45, 1), c(8.75, 15, 0.45, 1), l(11, 11, 15.5, 11), l(11, 15, 15.5, 15)] });
  add(C, 'Business Card', 'contact vcard profile', { b: [r(2.75, 5.5, 18.5, 13, 3)], d: [l(6.5, 9.5, 12.5, 9.5), l(6.5, 12.5, 10, 12.5), l(6.5, 15.5, 14, 15.5), c(16.75, 11, 1.5)] });
  add(C, 'Shredder', 'destroy document privacy paper', { b: [r(3.5, 8, 17, 5.5, 1.5)], o: [p('M6 8V4.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V8'), l(7, 15.5, 7, 20.5), l(10, 15.5, 10, 19), l(14, 15.5, 14, 20.5), l(17, 15.5, 17, 18.5)] });
  add(C, 'Signature', 'sign autograph contract', { o: [p('M3 16.5c2-4 4.5-9 6-9s-1 7.5 1 7.5 3-4 4.5-4-1 4 1 4 2.5-1.5 3.5-2.5'), l(3, 20.5, 21, 20.5)] });
  add(C, 'Money Bag', 'budget funds revenue savings', { b: [p('M9 3.5h6l-1.5 3.5a7 7 0 0 1 6 7.25c0 3.5-2.75 6.25-7.5 6.25S4.5 17.75 4.5 14.25A7 7 0 0 1 10.5 7Z')], d: [...DOLLAR(12, 14, 0.85)], o: [l(10.5, 7, 13.5, 7)] });
  add(C, 'Coins Stack', 'money savings finance cash', { b: [e(12, 6.5, 7, 2.75), p('M5 6.5v11c0 1.5 3.1 2.75 7 2.75s7-1.25 7-2.75v-11Z')], d: [p('M5 10.25c0 1.5 3.1 2.75 7 2.75s7-1.25 7-2.75'), p('M5 14c0 1.5 3.1 2.75 7 2.75s7-1.25 7-2.75'), p('M5.25 7c.75 1.25 3.6 2.25 6.75 2.25s6-1 6.75-2.25')] });
  add(C, 'Filing Cabinet', 'archive drawer records storage', { b: [r(5, 3, 14, 18, 2.5)], d: [l(5.5, 12, 18.5, 12), l(10, 7.5, 14, 7.5), l(10, 16.5, 14, 16.5)] });
  add(C, 'Projector', 'presentation beamer screen meeting', { b: [r(2.75, 8, 18.5, 9, 3)], d: [c(16, 12.5, 2.25), l(6.5, 12.5, 10, 12.5)], o: [l(6, 17, 5, 20), l(18, 17, 19, 20)] });
  add(C, 'Video Conference', 'call meeting remote team zoom', { b: [r(2.75, 4, 18.5, 13, 3)], d: [c(9, 9.25, 1.6), c(15, 9.25, 1.6), p('M6.5 14a2.5 2.5 0 0 1 5 0'), p('M12.5 14a2.5 2.5 0 0 1 5 0')], o: [l(8, 20.5, 16, 20.5)] });
  add(C, 'Balance Scale', 'compare decision justice weigh', { b: [p('M2.25 13.5h4.5a2.25 2.25 0 0 1-4.5 0Z'), p('M17.25 13.5h4.5a2.25 2.25 0 0 1-4.5 0Z')], o: [l(12, 3.5, 12, 20.5), l(4.5, 7, 19.5, 7), l(8, 20.5, 16, 20.5), p('M4.5 7 2.25 13.5M4.5 7l2.25 6.5M19.5 7l-2.25 6.5M19.5 7l2.25 6.5')] });
  add(C, 'Mailbox', 'post letter delivery mail', { b: [p('M4 10.25a4.25 4.25 0 0 1 8.5 0V18H4Z'), p('M8.25 6h8.5a3.75 3.75 0 0 1 3.75 3.75V18h-8')], d: [l(6.25, 11, 10.25, 11)], o: [l(12, 18, 12, 21), p('M15 10V4h2.75')] });
  add(C, 'Deadline', 'due date calendar clock schedule', { b: [r(3, 5, 14, 13.5, 3)], d: [l(3.5, 9.25, 16.5, 9.25)], o: [l(7, 3, 7, 6.5), l(13, 3, 13, 6.5), c(17, 17, 4), p('M17 15.25V17l1.25 1')], k: [c(17, 17, 4)] });
  add(C, 'Briefcase Check', 'job hired approved work', { b: [r(3, 7, 18, 13, 3)], d: [p('M9 13.5l2 2 4-4')], o: [p('M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7')] });
  add(C, 'Growth', 'increase profit progress chart business', { b: [r(4, 14, 3.5, 6.5, 1.25), r(10.25, 10.5, 3.5, 10, 1.25), r(16.5, 7, 3.5, 13.5, 1.25)], o: [p('M3.5 9.5 9 5l3.5 2.5 7-4'), p('M15.75 3.5h3.75v3.5')] });
  add(C, 'Strategy', 'plan tactics game chess knight', { b: [p('M7 20.5v-1.5a3 3 0 0 1 1-2.2l.8-.7c.5-.45.7-1.15.5-1.8L8.5 12l1.25-.5-.35-1.35L8 10.6l-.5-1.75L11 5l1-1.5h1.5L13 5c3.25.75 5 3.75 5 7.25v6.75a1.5 1.5 0 0 1-1.5 1.5Z')], d: [c(11, 8.25, 0.55, 1)], o: [l(5, 20.5, 19, 20.5)] });
  add(C, 'Lightbulb Money', 'investment idea profit innovation', { b: [p('M12 3a6.25 6.25 0 0 0-3.75 11.25c.6.45 1 1.15 1 1.9V17h5.5v-.85c0-.75.4-1.45 1-1.9A6.25 6.25 0 0 0 12 3Z')], d: [...DOLLAR(12, 9.25, 0.7)], o: [l(9.75, 20.5, 14.25, 20.5)] });
  add(C, 'Target Arrow', 'goal aim objective focus', { b: [c(11, 13, 7.75)], d: [c(11, 13, 4), c(11, 13, 0.75, 1)], o: [l(11, 13, 19.5, 4.5), p('M16.5 4.5h3v3')], k: [p('M15.5 4.5h4.25v4.25')] });
  add(C, 'Workspace', 'desk office computer work', { b: [r(5, 4, 14, 9.5, 2)], o: [l(3, 16.5, 21, 16.5), l(12, 13.5, 12, 16.5), l(5, 16.5, 5, 20.5), l(19, 16.5, 19, 20.5)] });
  add(C, 'Hierarchy Users', 'manager team lead group', { b: [c(12, 6, 2.75), e(12, 13, 5, 2.25)], o: [c(5, 16.5, 1.75), c(19, 16.5, 1.75), p('M2.25 21a2.75 2.75 0 0 1 5.5 0'), p('M16.25 21a2.75 2.75 0 0 1 5.5 0')] });
  add(C, 'Pin Board', 'notes board corkboard ideas', { b: [r(3, 4, 18, 16.5, 3)], d: [r(6.5, 8, 4.5, 4.5, 1), r(13, 8, 4.5, 3.5, 1), r(8, 14.5, 6, 3, 1)], o: [] });
})();
