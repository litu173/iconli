/* IconLi — Animated category: icons that move on hover.
 * Parts wrapped with A('kind', …) get the motion named `kind` (see MOTIONS). Motions play when the icon, or the
 * button/link/tile containing it, is hovered or focused; `loop` makes them repeat (e.g. <iconli-icon animate="loop">).
 * All motion is disabled for people who prefer reduced motion.
 */
(function () {
  const { add, p, c, r, l, e, CIRCLE, SQUARE, HEART, THUMB, SPARK, star } = window.IconLiDSL;
  const A = (kind, ...els) => `<g class="ia ia-${kind}">${els.flat().join('')}</g>`;
  // Paths that "draw" themselves: normalised length so a single dash covers them.
  const D = (d) => `<path d="${d}" pathLength="1" stroke-dasharray="1"/>`;

  // name: [keyframes, duration, timing, transform-origin, delay]
  const MOTIONS = {
    ring: ['0%{transform:rotate(0)}15%{transform:rotate(14deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(9deg)}60%{transform:rotate(-6deg)}75%{transform:rotate(3deg)}100%{transform:rotate(0)}', '0.9s', 'ease-in-out', '50% 0'],
    clap: ['0%,100%{transform:translateX(0)}20%{transform:translateX(1.6px)}40%{transform:translateX(-1.4px)}60%{transform:translateX(1px)}80%{transform:translateX(-.6px)}', '0.9s', 'ease-in-out', '50% 50%'],
    beat: ['0%,100%{transform:scale(1)}20%{transform:scale(1.18)}40%{transform:scale(1)}60%{transform:scale(1.1)}80%{transform:scale(1)}', '1s', 'ease-in-out', '50% 50%'],
    spin: ['to{transform:rotate(360deg)}', '0.9s', 'cubic-bezier(.65,0,.35,1)', '50% 50%'],
    'spin-slow': ['to{transform:rotate(90deg)}', '1.1s', 'cubic-bezier(.65,0,.35,1)', '50% 50%'],
    turn: ['to{transform:rotate(90deg)}', '0.5s', 'cubic-bezier(.34,1.56,.64,1)', '50% 50%'],
    'nudge-r': ['0%,60%,100%{transform:translateX(0)}30%{transform:translateX(3.5px)}80%{transform:translateX(1.5px)}', '0.8s', 'ease-in-out', '50% 50%'],
    'nudge-d': ['0%,60%,100%{transform:translateY(0)}30%{transform:translateY(3px)}80%{transform:translateY(1.2px)}', '0.8s', 'ease-in-out', '50% 50%'],
    'nudge-u': ['0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}80%{transform:translateY(-1.2px)}', '0.8s', 'ease-in-out', '50% 50%'],
    fly: ['0%{transform:none;opacity:1}40%{transform:translate(7px,-7px);opacity:0}41%{transform:translate(-7px,7px);opacity:0}100%{transform:none;opacity:1}', '0.9s', 'cubic-bezier(.65,0,.35,1)', '50% 50%'],
    draw: ['from{stroke-dashoffset:1}to{stroke-dashoffset:0}', '0.7s', 'cubic-bezier(.65,0,.35,1)', '50% 50%'],
    lid: ['0%,100%{transform:rotate(0)}35%,65%{transform:rotate(-24deg) translateY(-1px)}', '0.9s', 'cubic-bezier(.34,1.56,.64,1)', '0% 100%'],
    wave1: ['0%,100%{opacity:1}30%{opacity:.15}', '0.9s', 'ease-in-out', '50% 50%', '0s'],
    wave2: ['0%,100%{opacity:1}30%{opacity:.15}', '0.9s', 'ease-in-out', '50% 50%', '.15s'],
    wave3: ['0%,100%{opacity:1}30%{opacity:.15}', '0.9s', 'ease-in-out', '50% 50%', '.3s'],
    blink: ['0%,100%{transform:scaleY(1)}45%,55%{transform:scaleY(.08)}', '0.5s', 'ease-in-out', '50% 50%'],
    bounce: ['0%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}55%{transform:translateY(0)}75%{transform:translateY(-1.5px)}', '0.8s', 'ease-out', '50% 100%'],
    shadow: ['0%,100%{transform:scaleX(1);opacity:1}30%{transform:scaleX(.55);opacity:.5}55%{transform:scaleX(1)}', '0.8s', 'ease-out', '50% 50%'],
    pop: ['0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(1.22) rotate(14deg)}70%{transform:scale(.96) rotate(-4deg)}', '0.7s', 'cubic-bezier(.34,1.56,.64,1)', '50% 50%'],
    like: ['0%,100%{transform:rotate(0)}35%{transform:rotate(-16deg) translateY(-1px)}70%{transform:rotate(4deg)}', '0.7s', 'ease-in-out', '20% 100%'],
    flash: ['0%,100%{opacity:1}20%{opacity:.15}40%{opacity:1}60%{opacity:.35}', '0.6s', 'linear', '50% 50%'],
    'fill-x': ['from{transform:scaleX(0)}to{transform:scaleX(1)}', '0.9s', 'cubic-bezier(.65,0,.35,1)', '0% 50%'],
    slide: ['from{transform:translateX(-8px)}to{transform:translateX(0)}', '0.5s', 'cubic-bezier(.34,1.56,.64,1)', '50% 50%'],
    pulse: ['0%,100%{transform:scale(1)}50%{transform:scale(1.4)}', '0.8s', 'ease-in-out', '50% 50%'],
    dot1: ['0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-2.2px)}', '0.8s', 'ease-in-out', '50% 50%', '0s'],
    dot2: ['0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-2.2px)}', '0.8s', 'ease-in-out', '50% 50%', '.12s'],
    dot3: ['0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-2.2px)}', '0.8s', 'ease-in-out', '50% 50%', '.24s'],
    shackle: ['0%,100%{transform:translateY(0)}35%,65%{transform:translateY(-2.5px)}', '0.8s', 'cubic-bezier(.34,1.56,.64,1)', '50% 100%'],
    launch: ['0%,100%{transform:translate(0,0)}40%{transform:translate(3px,-3px)}70%{transform:translate(-.5px,.5px)}', '0.9s', 'ease-in-out', '50% 50%'],
    flicker: ['0%,100%{transform:scale(1);opacity:1}25%{transform:scale(.6);opacity:.5}50%{transform:scale(1.15)}75%{transform:scale(.8);opacity:.7}', '0.45s', 'linear', '100% 0%'],
    flip: ['to{transform:rotate(180deg)}', '0.8s', 'cubic-bezier(.65,0,.35,1)', '50% 50%'],
    twinkle: ['0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(.6) rotate(45deg)}70%{transform:scale(1.15) rotate(0)}', '0.8s', 'ease-in-out', '50% 50%', '0s'],
    twinkle2: ['0%,100%{transform:scale(1)}40%{transform:scale(1.5)}70%{transform:scale(.7)}', '0.8s', 'ease-in-out', '50% 50%', '.15s'],
    scan: ['0%,100%{transform:translate(0,0)}25%{transform:translate(1.6px,-1.6px)}50%{transform:translate(-1.4px,-1px)}75%{transform:translate(.8px,1.2px)}', '1s', 'ease-in-out', '50% 50%'],
    roll: ['0%,100%{transform:translateX(0)}35%{transform:translateX(3px)}65%{transform:translateX(-1px)}', '0.8s', 'ease-in-out', '50% 50%'],
    shift: ['0%,100%{transform:translate(0,0)}45%{transform:translate(-2.5px,2.5px)}', '0.7s', 'ease-in-out', '50% 50%'],
    tick: ['to{transform:rotate(360deg)}', '1.2s', 'cubic-bezier(.65,0,.35,1)', '0% 100%'],
    drop: ['0%{transform:translateY(-3px);opacity:0}30%{opacity:1}70%{transform:translateY(0)}85%{transform:scale(1.08,.92)}100%{transform:none}', '0.8s', 'ease-in', '50% 100%'],
    float: ['0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}', '1s', 'ease-in-out', '50% 50%'],
    swing: ['0%,100%{transform:rotate(0)}25%{transform:rotate(10deg)}50%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}', '0.9s', 'ease-in-out', '50% 0'],
    write: ['0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-2px,1px) rotate(-6deg)}50%{transform:translate(1px,-1px) rotate(4deg)}75%{transform:translate(-1px,1px) rotate(-3deg)}', '0.8s', 'ease-in-out', '0% 100%'],
  };
  const css = (kinds) => {
    let out = '.iconli-anim .ia{transform-box:fill-box}';
    (kinds || Object.keys(MOTIONS)).forEach((k) => {
      const [kf, dur, tf, origin, delay] = MOTIONS[k];
      const sel = `.iconli-anim .ia-${k}`;
      const play = [`.iconli-anim:hover .ia-${k}`, `:is(a,button,label,.tile,.pg-cell,iconli-icon,[data-iconli]):is(:hover,:focus-visible) .iconli-anim .ia-${k}`, `.iconli-anim.il-play .ia-${k}`, `.iconli-anim[data-loop] .ia-${k}`].join(',');
      out += `${sel}{transform-origin:${origin}}${play}{animation:il-${k} ${dur} ${tf} ${delay || '0s'} both}.iconli-anim[data-loop] .ia-${k}{animation-iteration-count:infinite}@keyframes il-${k}{${kf}}`;
    });
    return out + '@media (prefers-reduced-motion:reduce){.iconli-anim .ia{animation:none!important}}';
  };
  window.IconLiAnim = { MOTIONS, css };

  const gear = (cx, cy, teeth, R, r0) => {
    let d = '';
    const n = teeth * 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 4 < 2 ? R : r0;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2);
    }
    return p(d + 'Z');
  };
  const BELL = 'M12 3.25a5.75 5.75 0 0 0-5.75 5.75v3.1c0 .95-.32 1.87-.9 2.62l-.7.9a1 1 0 0 0 .79 1.63h13.12a1 1 0 0 0 .79-1.63l-.7-.9c-.58-.75-.9-1.67-.9-2.62V9A5.75 5.75 0 0 0 12 3.25Z';
  const PLANE = 'M20.6 3.4 3.9 10.1a.6.6 0 0 0 0 1.1l6.5 2.4 2.4 6.5a.6.6 0 0 0 1.1 0L20.6 3.4Z';
  const EYE = 'M2.75 12C4.6 8 8 5.75 12 5.75S19.4 8 21.25 12C19.4 16 16 18.25 12 18.25S4.6 16 2.75 12Z';
  const PIN = 'M12 20.5s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0c0 5.1-6.5 10.5-6.5 10.5Z';
  const BOLT = 'M13.2 2.9 4.9 13.1a.6.6 0 0 0 .47.98H11l-1 7.02 8.3-10.2a.6.6 0 0 0-.47-.98H12.2Z';
  const ROCKET = 'M8 16c0-5.5 6.5-12.5 12.5-12.5 0 6-7 12.5-12.5 12.5Z';
  const BUBBLE = 'M12 3.5a8.5 8.5 0 0 0-7.4 12.7l-1 3.6a.6.6 0 0 0 .73.73l3.6-1A8.5 8.5 0 1 0 12 3.5Z';
  const T = 'animated motion hover interactive';

  add('animated', 'Bell Ring', 'notification alert ' + T, { b: [A('ring', p(BELL))], o: [A('clap', p('M9.75 19.75a2.5 2.5 0 0 0 4.5 0'))] });
  add('animated', 'Heart Beat', 'love like favourite ' + T, { b: [A('beat', p(HEART))] });
  add('animated', 'Settings Spin', 'gear cog preferences ' + T, { b: [A('spin', gear(12, 12, 8, 9.25, 7.4))], d: [A('spin', c(12, 12, 2.75))] });
  add('animated', 'Refresh Spin', 'reload sync update ' + T, { o: [A('spin', p('M20 12a8 8 0 0 1-14.3 4.9'), p('M4 12a8 8 0 0 1 14.3-4.9'), p('M18.5 3.5v3.75h-3.75'), p('M5.5 20.5v-3.75h3.75'))] });
  add('animated', 'Loader Spin', 'loading progress wait ' + T, { o: [`<path d="M12 3.25a8.75 8.75 0 1 0 8.75 8.75" opacity=".25"/>`, A('spin', p('M12 3.25a8.75 8.75 0 0 1 8.75 8.75'))] });
  add('animated', 'Arrow Nudge', 'next forward continue ' + T, { o: [A('nudge-r', l(4.5, 12, 19, 12), p('M13.5 6.5 19 12l-5.5 5.5'))] });
  add('animated', 'Download Drop', 'save get ' + T, { o: [A('nudge-d', l(12, 3.5, 12, 15), p('M7.5 10.5 12 15l4.5-4.5')), p('M4 16v2a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-2')] });
  add('animated', 'Upload Lift', 'send share ' + T, { o: [A('nudge-u', l(12, 15, 12, 3.5), p('M7.5 8 12 3.5 16.5 8')), p('M4 16v2a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18v-2')] });
  add('animated', 'Send Fly', 'paper plane message ' + T, { b: [A('fly', p(PLANE))], d: [A('fly', l(10.4, 13.6, 14, 10))] });
  add('animated', 'Check Draw', 'done success complete ' + T, { b: [CIRCLE], d: [A('draw', D('M8 12.25 10.75 15 16 9.25'))] });
  add('animated', 'Trash Lid', 'delete remove bin ' + T, { b: [p('M5.5 8.5h13l-1.05 10.3a2.5 2.5 0 0 1-2.49 2.2H9.04a2.5 2.5 0 0 1-2.49-2.2Z')], d: [l(10, 12, 10, 17), l(14, 12, 14, 17)], o: [A('lid', l(3.5, 6, 20.5, 6), p('M9.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6'))] });
  add('animated', 'WiFi Waves', 'signal internet wireless ' + T, { o: [A('wave3', p('M2.8 9.3a13 13 0 0 1 18.4 0')), A('wave2', p('M5.6 12.65a9 9 0 0 1 12.8 0')), A('wave1', p('M8.45 15.5a5 5 0 0 1 7.1 0')), c(12, 18.75, 0.75, 1)] });
  add('animated', 'Eye Blink', 'view watch visible ' + T, { b: [A('blink', p(EYE))], d: [A('blink', c(12, 12, 3))] });
  add('animated', 'Pin Bounce', 'location map place ' + T, { b: [A('bounce', p(PIN))], d: [A('bounce', c(12, 10, 2.25))], o: [A('shadow', e(12, 21.5, 3, 0.4))] });
  add('animated', 'Star Pop', 'favourite rating ' + T, { b: [A('pop', star(12, 12.4, 9.25, 4.1))] });
  add('animated', 'Thumbs Up Like', 'approve good ' + T, { b: [A('like', THUMB)], d: [A('like', l(7.5, 11, 7.5, 19.75))] });
  add('animated', 'Lightning Flash', 'zap energy power ' + T, { b: [A('flash', p(BOLT))] });
  add('animated', 'Sun Shine', 'day weather bright ' + T, { b: [c(12, 12, 4)], o: [A('spin-slow', l(12, 2.75, 12, 4.5), l(12, 19.5, 12, 21.25), l(2.75, 12, 4.5, 12), l(19.5, 12, 21.25, 12), l(5.45, 5.45, 6.7, 6.7), l(17.3, 17.3, 18.55, 18.55), l(5.45, 18.55, 6.7, 17.3), l(17.3, 6.7, 18.55, 5.45))] });
  add('animated', 'Battery Charge', 'power energy charging ' + T, { b: [A('fill-x', r(5.25, 9.25, 11.5, 5.5, 1))], o: [r(2.75, 6.75, 16.5, 10.5, 3), p('M21.25 10.5v3')] });
  add('animated', 'Toggle Switch', 'on off setting ' + T, { b: [r(2.75, 6.5, 18.5, 11, 5.5)], d: [A('slide', c(16, 12, 2.5))] });
  add('animated', 'Mail Notify', 'email inbox new ' + T, { b: [r(2.75, 5, 16, 14, 3)], d: [p('M5.5 9.25l4.85 3.2a1.6 1.6 0 0 0 1.8 0L17 9.25')], o: [A('pulse', c(19.5, 5.5, 2.25, 1))] });
  add('animated', 'Chat Typing Dots', 'message writing conversation ' + T, { b: [p(BUBBLE)], d: [A('dot1', c(8, 12, 0.5, 1)), A('dot2', c(12, 12, 0.5, 1)), A('dot3', c(16, 12, 0.5, 1))] });
  add('animated', 'Lock Open', 'unlock security password ' + T, { b: [r(5.25, 10.5, 13.5, 10.5, 3)], d: [l(12, 14.5, 12, 16.5)], o: [A('shackle', p('M8 10.5V7.5a4 4 0 0 1 8 0v3'))] });
  add('animated', 'Rocket Launch', 'startup boost go ' + T, { b: [A('launch', p(ROCKET))], d: [A('launch', c(15, 9, 1.75))], o: [A('launch', p('M9.6 9.6H6l-2.5 3 4.25.6'), p('M14.4 14.4V18l-3 2.5-.6-4.25')), A('flicker', p('M6.25 17.75C5 18.25 4.25 19.5 4 21c1.5-.25 2.75-1 3.25-2.25'))] });
  add('animated', 'Hourglass Flip', 'time wait timer ' + T, { b: [A('flip', p('M6.5 3.5h11v2.6a4 4 0 0 1-1.7 3.27L12 12 8.2 9.37A4 4 0 0 1 6.5 6.1Z'), p('M6.5 20.5h11v-2.6a4 4 0 0 0-1.7-3.27L12 12l-3.8 2.63A4 4 0 0 0 6.5 17.9Z'))], o: [A('flip', l(5, 3.5, 19, 3.5), l(5, 20.5, 19, 20.5))] });
  add('animated', 'Magic Sparkles', 'ai new shine ' + T, { b: [A('twinkle', SPARK(10.5, 10.5, 1)), A('twinkle2', SPARK(18.25, 18.25, 0.43))] });
  add('animated', 'Search Scan', 'find look magnify ' + T, { b: [A('scan', c(11, 11, 7))], o: [A('scan', l(16.25, 16.25, 20.5, 20.5))] });
  add('animated', 'Volume Waves', 'sound audio speaker ' + T, { b: [p('M3.5 9.75a1.5 1.5 0 0 1 1.5-1.5h2.5l4.1-3.3a.75.75 0 0 1 1.22.58v13a.75.75 0 0 1-1.22.58l-4.1-3.3H5a1.5 1.5 0 0 1-1.5-1.5Z')], o: [A('wave1', p('M16 9a4.25 4.25 0 0 1 0 6')), A('wave2', p('M18.75 6.25a8 8 0 0 1 0 11.5'))] });
  add('animated', 'Mic Pulse', 'record voice audio ' + T, { b: [A('pulse', r(8.75, 2.75, 6.5, 11.5, 3.25))], o: [p('M5.5 11a6.5 6.5 0 0 0 13 0'), l(12, 17.5, 12, 21)] });
  add('animated', 'Cart Roll', 'shop buy basket ' + T, { o: [A('roll', p('M2.75 3.5h1.6a1.5 1.5 0 0 1 1.46 1.15L7.6 13h10.2l2-7H6.6'), c(9, 19, 1.5), c(17, 19, 1.5))] });
  add('animated', 'Copy Shift', 'duplicate clone ' + T, { b: [r(8.5, 8.5, 12, 12, 3)], o: [A('shift', p('M15.5 8.5V6.5a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2'))] });
  add('animated', 'Plus Turn', 'add new create ' + T, { b: [SQUARE], d: [A('turn', l(12, 8, 12, 16), l(8, 12, 16, 12))] });
  add('animated', 'Clock Tick', 'time hour watch ' + T, { b: [CIRCLE], d: [l(12, 12, 12, 8), A('tick', l(12, 12, 15, 14))] });
  add('animated', 'Water Drop Fall', 'liquid rain ' + T, { b: [A('drop', p('M12 3.5c3.2 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 2.8-6.9 6-10.5Z'))] });
  add('animated', 'Balloon Float', 'party celebration ' + T, { b: [A('float', p('M12 3.25c3.6 0 6.25 2.75 6.25 6.4 0 3.9-3.1 7.35-6.25 7.35S5.75 13.55 5.75 9.65c0-3.65 2.65-6.4 6.25-6.4Z'))], o: [A('float', p('M11 17l-.6 1.2h3.2L13 17')), A('swing', p('M12 18.2c0 1.3-1.5 1.5-1.5 2.9'))] });
  add('animated', 'Pencil Write', 'edit draw sign ' + T, { b: [A('write', p('M15.2 4.3a2.1 2.1 0 0 1 3 0l1.5 1.5a2.1 2.1 0 0 1 0 3L9.4 19.1l-4.65 1.15 1.15-4.65Z'))], o: [p('M13.5 20.5h6.5')] });
})();
