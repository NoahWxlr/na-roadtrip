(function () {
  'use strict';

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  }

  function download(content, filename, mime) {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: mime })),
      download: filename
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  window.downloadGPX = function () {
    const wpts = STOPS.map(s =>
      `  <wpt lat="${s.lat}" lon="${s.lng}">
    <name>Stop ${String(s.num).padStart(2, '0')}: ${esc(s.name)}</name>
    <desc>${esc(s.state)} · ${esc(s.sub)}</desc>
  </wpt>`
    ).join('\n');

    const trk = STOPS.map(s => `      <trkpt lat="${s.lat}" lon="${s.lng}"></trkpt>`).join('\n');

    download(
      `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NA Road Trip" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>NA Road Trip — Noah's Route</name></metadata>
${wpts}
  <trk>
    <name>NA Road Trip Route</name>
    <trkseg>
${trk}
    </trkseg>
  </trk>
</gpx>`,
      'na-roadtrip-route.gpx',
      'application/gpx+xml'
    );
  };

  window.downloadKML = function () {
    const groups = { np: [], city: [], climb: [] };
    const labels = { np: 'National Parks', city: 'Cities & Towns', climb: 'Climbs & Summits' };
    STOPS.forEach(s => (groups[s.type] || groups.city).push(s));

    const folders = Object.entries(groups).map(([type, stops]) => {
      const marks = stops.map(s =>
        `    <Placemark>
      <name>Stop ${s.num}: ${esc(s.name)}</name>
      <description>${esc(s.state)} · ${esc(s.sub)}</description>
      <Point><coordinates>${s.lng},${s.lat},0</coordinates></Point>
    </Placemark>`
      ).join('\n');
      return `  <Folder><name>${labels[type]}</name>\n${marks}\n  </Folder>`;
    }).join('\n');

    const coords = STOPS.map(s => `${s.lng},${s.lat},0`).join('\n          ');

    download(
      `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>NA Road Trip</name>
${folders}
  <Placemark>
    <name>Route</name>
    <LineString><coordinates>${coords}</coordinates></LineString>
  </Placemark>
</Document>
</kml>`,
      'na-roadtrip-route.kml',
      'application/vnd.google-earth.kml+xml'
    );
  };
})();
