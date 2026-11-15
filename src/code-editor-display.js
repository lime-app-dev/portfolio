const snippet = [
  'export function bindMovement(root, input) {',
  '  const bindings = new Map([',
  "    ['w', 'forward'], ['ArrowUp', 'forward'],",
  "    ['a', 'left'],    ['ArrowLeft', 'left'],",
  "    ['s', 'back'],    ['ArrowDown', 'back'],",
  "    ['d', 'right'],   ['ArrowRight', 'right'],",
  '  ]);',
  '',
  "  root.addEventListener('keydown', event => {",
  '    const direction = bindings.get(event.key);',
  '    if (!direction) return;',
  '    input.press(direction);',
  '  });',
  '',
  "  root.addEventListener('keyup', event => {",
  '    const direction = bindings.get(event.key);',
  '    if (direction) input.release(direction);',
  '  });',
  '}'
];
const source = snippet.join('\n');
const initial = snippet.slice(0, 6).join('\n').length;
const cycle = (source.length - initial) * 24 + 4300;

function label(ctx, text, x, y, color, font) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

export function drawCodeEditor(ctx, elapsed = 0, reduced = false) {
  ctx.fillStyle = '#181a20';
  ctx.fillRect(0, 0, 720, 412);
  ctx.fillStyle = '#22252d';
  ctx.fillRect(0, 0, 720, 32);
  ctx.fillRect(0, 32, 160, 359);
  ctx.fillStyle = '#292c37';
  ctx.fillRect(0, 32, 29, 359);
  ctx.fillRect(160, 32, 560, 35);
  ctx.fillStyle = '#181a20';
  ctx.fillRect(160, 32, 139, 35);

  ['#ff625a', '#ffbd2e', '#28c940'].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(15 + index * 14, 16, 4.2, 0, Math.PI * 2);
    ctx.fill();
  });
  label(ctx, 'Portfolio — Code Editor', 277, 20, '#afb6c8', '13px system-ui');
  label(ctx, 'EXPLORER', 39, 56, '#b8c1d3', '600 12px system-ui');
  label(ctx, '⌄ PORTFOLIO', 39, 84, '#dde2ee', '700 13px system-ui');
  label(ctx, '⌄ src', 47, 112, '#b8c1d3', '14px system-ui');
  ctx.fillStyle = '#354259';
  ctx.fillRect(29, 120, 131, 25);
  label(ctx, 'JS', 55, 138, '#e7ce7b', '600 12px system-ui');
  label(ctx, 'main.js', 76, 138, '#e3eafb', '14px system-ui');
  label(ctx, 'desktop.js', 63, 167, '#adb7cd', '14px system-ui');
  label(ctx, 'style.css', 63, 192, '#adb7cd', '14px system-ui');
  label(ctx, 'index.html', 47, 217, '#adb7cd', '14px system-ui');

  ctx.fillStyle = '#7ea3fc';
  ctx.fillRect(160, 32, 139, 2);
  label(ctx, 'JS', 172, 54, '#e7ce7b', '600 12px system-ui');
  label(ctx, 'main.js', 197, 54, '#e1e7f2', '14px system-ui');
  label(ctx, 'src  ›  main.js', 174, 86, '#8e9cb6', '13px system-ui');

  ctx.fillStyle = '#30496e';
  ctx.fillRect(0, 390, 720, 22);
  label(ctx, 'main', 14, 406, '#e1e9f8', '12px system-ui');
  label(ctx, 'UTF-8     JavaScript', 588, 406, '#e1e9f8', '12px system-ui');

  const phase = elapsed % cycle;
  const length = reduced ? source.length : Math.min(source.length, initial + Math.floor(phase / 24));
  const visible = source.slice(0, length).split('\n');
  const start = Math.max(0, visible.length - 13);
  const mono = '16px ui-monospace, monospace';
  for (let i = start; i < visible.length; i += 1) {
    const y = 111 + (i - start) * 20;
    const line = visible[i];
    label(ctx, String(i + 1).padStart(2, ' '), 172, y, '#837692', mono);
    let x = 205;
    for (const token of line.split(/(\b(?:export|function|const|new|if|return)\b|'[^']*')/)) {
      const color = token.startsWith("'") ? '#9cd2b9' : /^(export|function|const|new|if|return)$/.test(token) ? '#c5a8fa' : '#e5dced';
      label(ctx, token, x, y, color, mono);
      x += ctx.measureText(token).width;
    }
    if (!reduced && i === visible.length - 1 && (length < source.length || Math.floor(phase / 480) % 2 === 0)) {
      ctx.fillStyle = '#dac2f4';
      ctx.fillRect(x + 2, y - 14, 2, 16);
    }
  }
}
