// Generates the compass rose tick marks (36 ticks, every 10 degrees)
// for the Home page hero/brand illustration.
export function renderCompassTicks() {
    const ticksGroup = document.getElementById("ticks");
    if (!ticksGroup) return;

    const cx = 140, cy = 140, outerR = 116, innerRShort = 108, innerRLong = 100;
    let svgMarkup = "";
    for (let deg = 0; deg < 360; deg += 10) {
        const isMajor = deg % 90 === 0;
        const innerR = isMajor ? innerRLong : innerRShort;
        const rad = (deg - 90) * (Math.PI / 180);
        const x1 = cx + outerR * Math.cos(rad);
        const y1 = cy + outerR * Math.sin(rad);
        const x2 = cx + innerR * Math.cos(rad);
        const y2 = cy + innerR * Math.sin(rad);
        svgMarkup += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="compass-tick"></line>`;
    }
    ticksGroup.innerHTML = svgMarkup;
}