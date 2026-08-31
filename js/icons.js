/* ScaleSee — line glyphs for the category bar and the fact cards.
   24×24, stroked in currentColor, so they take the colour of whatever
   they sit in. Drawn rather than typed, because emoji render differently
   on every machine and none of them are quiet. */
const ICONS = {
  money: '<rect x="2.8" y="6.5" width="18.4" height="11" rx="2.4"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
  height: '<path d="M2.5 20.5h19"/><path d="M5.5 20.5V12h4.6v8.5"/><path d="M14 20.5V4h4.6v16.5"/><path d="M16.3 4V1.8"/>',
  distance: '<path d="M4.5 12h15" stroke-dasharray="2.6 3"/><circle cx="4.2" cy="12" r="2.2"/><circle cx="19.8" cy="12" r="2.2"/><path d="M4.2 16.6v3.4M19.8 16.6v3.4"/>',
  land: '<path d="M12 4.2 21.4 12 12 19.8 2.6 12Z"/><path d="M12 19.8 7.2 15.8 12 11.9l4.8 3.9Z"/>',
  weight: '<path d="M12 4.4v15.2M7 19.6h10M3.4 8.6h17.2"/><path d="M12 4.4 3.4 8.6M12 4.4l8.6 4.2"/><path d="M.9 13.4a2.5 2.5 0 0 0 5 0ZM18.1 13.4a2.5 2.5 0 0 0 5 0Z"/>',
  temp: '<path d="M14 13.6V4.9a2 2 0 1 0-4 0v8.7a4.2 4.2 0 1 0 4 0Z"/><path d="M12 8.6v6.6"/>',
  time: '<path d="M6.6 2.8h10.8M6.6 21.2h10.8"/><path d="M7.7 2.8v3.3c0 2 4.3 3.9 4.3 5.9s-4.3 3.8-4.3 5.8v3.4M16.3 2.8v3.3c0 2-4.3 3.9-4.3 5.9s4.3 3.8 4.3 5.8v3.4"/>',
  data: '<ellipse cx="12" cy="5.8" rx="7.6" ry="3"/><path d="M4.4 5.8v12.4c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V5.8"/><path d="M19.6 12c0 1.7-3.4 3-7.6 3s-7.6-1.3-7.6-3"/>',
  speed: '<path d="M3.4 18.4a9.2 9.2 0 1 1 17.2 0"/><path d="m12.9 14.1 4.3-4.8"/><circle cx="12" cy="15.4" r="1.5"/>',
  volume: '<path d="m12 2.8 8.4 4.7v9L12 21.2l-8.4-4.7v-9Z"/><path d="m12 12.2 8.4-4.7M12 12.2v9M12 12.2 3.6 7.5"/>',
  energy: '<path d="M13.4 2.2 4.6 13.1h5.6l-1.2 8.7 8.8-10.9h-5.6l1.2-8.7Z"/>'
};
function icon(id, size) {
  const d = ICONS[id];
  if (!d) return '';
  return `<svg class="ic" viewBox="0 0 24 24" width="${size || 17}" height="${size || 17}" fill="none"`
    + ` stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
