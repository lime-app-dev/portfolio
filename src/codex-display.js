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

export function drawCodexDisplay(ctx, elapsed = 0, reduced = false) {
  ctx.fillStyle = '#141318';
  ctx.fillRect(0, 0, 720, 412);
  ctx.fillStyle = '#211f28';
  ctx.fillRect(0, 0, 174, 412);
  ctx.fillStyle = '#35313e';
  ctx.fillRect(173, 0, 1, 412);
  ctx.fillRect(174, 42, 546, 1);

  ['#ff625a', '#ffbd2e', '#28c940'].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(18 + index * 15, 21, 4.7, 0, Math.PI * 2);
    ctx.fill();
  });
  label(ctx, 'Codex', 17, 65, '#f4efff', '650 22px system-ui');
  label(ctx, 'Portfolio', 17, 108, '#a8a0b9', '600 14px system-ui');

  ctx.fillStyle = '#393041';
  ctx.beginPath();
  ctx.roundRect(10, 121, 154, 29, 6);
  ctx.fill();
  label(ctx, 'Cabin controls', 18, 141, '#f3eaff', '600 14px system-ui');
  label(ctx, 'Portfolio windows', 18, 173, '#aaa2b9', '14px system-ui');
  label(ctx, 'Mobile layout', 18, 202, '#aaa2b9', '14px system-ui');

  label(ctx, 'Cabin controls', 192, 27, '#e5def0', '600 16px system-ui');
  label(ctx, 'Refine the cabin movement controls', 193, 82, '#f1ecfa', '650 19px system-ui');
  label(ctx, 'Update the keyboard input bindings.', 193, 109, '#b8b0c8', '15px system-ui');

  ctx.fillStyle = '#292532';
  ctx.beginPath();
  ctx.roundRect(191, 128, 509, 263, 9);
  ctx.fill();
  ctx.fillStyle = '#1a1720';
  ctx.beginPath();
  ctx.roundRect(192, 129, 507, 261, 8);
  ctx.fill();
  label(ctx, 'movement.js', 206, 152, '#c8b8e5', '600 14px ui-monospace, monospace');
  ctx.fillStyle = '#3c3448';
  ctx.fillRect(192, 162, 507, 1);

  const phase = elapsed % cycle;
  const length = reduced ? source.length : Math.min(source.length, initial + Math.floor(phase / 24));
  const visible = source.slice(0, length).split('\n');
  const start = Math.max(0, visible.length - 10);
  const mono = '16px ui-monospace, monospace';
  for (let i = start; i < visible.length; i += 1) {
    const y = 187 + (i - start) * 20;
    const line = visible[i];
    label(ctx, String(i + 1).padStart(2, ' '), 205, y, '#837692', mono);
    let x = 237;
    for (const token of line.split(/(\b(?:export|function|const|new|if|return)\b|'[^']*')/)) {
      const color = token.startsWith("'") ? '#9adac3' : /^(export|function|const|new|if|return)$/.test(token) ? '#d9a8fa' : '#e5dced';
      label(ctx, token, x, y, color, mono);
      x += ctx.measureText(token).width;
    }
    if (!reduced && i === visible.length - 1 && (length < source.length || Math.floor(phase / 480) % 2 === 0)) {
      ctx.fillStyle = '#dac2f4';
      ctx.fillRect(x + 2, y - 14, 2, 16);
    }
  }
}
