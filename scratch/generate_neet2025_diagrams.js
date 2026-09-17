const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "neet2025_fixes");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function renderSvg(svgStr, outFile, width = 800) {
  const pngBuffer = await sharp(Buffer.from(svgStr), { density: 300 })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(outDir, outFile), pngBuffer);
  console.log(`Rendered ${outFile}`);
}

async function main() {
  // -------------------------------------------------------------
  // Q41: Physics Circuit Diagram
  // -------------------------------------------------------------
  const q41Svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650" width="900" height="650">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Outer battery loop -->
      <path d="M 220 300 L 120 300 L 120 540 L 420 540" />
      <path d="M 480 540 L 780 540 L 780 300 L 680 300" />
      
      <!-- Battery at bottom -->
      <line x1="420" y1="505" x2="420" y2="575" stroke-width="5"/>
      <line x1="440" y1="520" x2="440" y2="560" stroke-width="8"/>
      <line x1="460" y1="505" x2="460" y2="575" stroke-width="5"/>
      <line x1="480" y1="520" x2="480" y2="560" stroke-width="8"/>
      
      <!-- Bridge Left Junction A -->
      <path d="M 220 300 L 260 300 L 260 180 L 310 180" />
      <path d="M 260 300 L 260 420 L 310 420" />
      
      <!-- Top Left Resistor 1 Ohm -->
      <!-- 310 to 410 -->
      <path d="M 310 180 L 320 180 L 327.5 155 L 342.5 205 L 357.5 155 L 372.5 205 L 387.5 155 L 402.5 205 L 410 180 L 450 180" />
      
      <!-- Top Right Resistor 2 Ohm -->
      <!-- 450 to 590 -->
      <path d="M 450 180 L 490 180 L 497.5 155 L 512.5 205 L 527.5 155 L 542.5 205 L 557.5 155 L 572.5 205 L 580 180 L 640 180" />
      
      <!-- Bottom Left Resistor 3 Ohm -->
      <!-- 310 to 410 -->
      <path d="M 310 420 L 320 420 L 327.5 395 L 342.5 445 L 357.5 395 L 372.5 445 L 387.5 395 L 402.5 445 L 410 420 L 450 420" />
      
      <!-- Bottom Right Resistor 4 Ohm -->
      <!-- 450 to 590 -->
      <path d="M 450 420 L 490 420 L 497.5 395 L 512.5 445 L 527.5 395 L 542.5 445 L 557.5 395 L 572.5 445 L 580 420 L 640 420" />
      
      <!-- Bridge Right Junction B -->
      <path d="M 640 180 L 640 300 L 680 300" />
      <path d="M 640 420 L 640 300" />
      
      <!-- Central vertical branch CD -->
      <line x1="450" y1="180" x2="450" y2="420" stroke-width="4"/>
    </g>

    <!-- Terminal dots and labels -->
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="#000000" text-anchor="middle">
      <circle cx="220" cy="300" r="6" fill="#000000"/>
      <text x="195" y="308" font-size="32" font-style="italic">A</text>
      
      <circle cx="680" cy="300" r="6" fill="#000000"/>
      <text x="705" y="308" font-size="32" font-style="italic">B</text>
      
      <circle cx="450" cy="180" r="5" fill="#000000"/>
      <text x="450" y="140" font-size="32" font-style="italic">C</text>
      
      <circle cx="450" cy="420" r="5" fill="#000000"/>
      <text x="450" y="470" font-size="32" font-style="italic">D</text>
      
      <!-- Resistor labels -->
      <text x="360" y="240" font-size="28">1 Ω</text>
      <text x="540" y="240" font-size="28">2 Ω</text>
      <text x="360" y="375" font-size="28">3 Ω</text>
      <text x="540" y="375" font-size="28">4 Ω</text>
      
      <!-- Battery label -->
      <text x="450" y="610" font-size="30">50 V</text>
    </g>
  </svg>
  `;
  await renderSvg(q41Svg, "q041-question-image.png");

  // -------------------------------------------------------------
  // Q45: Physics Liquid Tank Profile
  // -------------------------------------------------------------
  const q45Svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Axes -->
      <line x1="80" y1="480" x2="720" y2="480" stroke-width="4"/>
      <path d="M 705 470 L 725 480 L 705 490" stroke-width="4" fill="none"/>
      
      <line x1="160" y1="540" x2="160" y2="80" stroke-width="4"/>
      <path d="M 150 95 L 160 75 L 170 95" stroke-width="4" fill="none"/>
      
      <!-- Wall at x = L -->
      <line x1="560" y1="480" x2="560" y2="100" stroke-width="5"/>
      
      <!-- Meniscus / Surface Curve y(x) -->
      <path d="M 160 360 Q 380 350, 560 220" stroke-width="5"/>
      <path d="M 560 220 L 670 145" stroke-width="4"/>
      
      <!-- Tangent dashed line at x = L -->
      <line x1="560" y1="220" x2="680" y2="220" stroke-width="3" stroke-dasharray="8,6"/>
      
      <!-- Angle arc theta_0 -->
      <path d="M 620 220 A 60 60 0 0 0 610 186" stroke-width="3"/>
    </g>

    <g font-family="Times New Roman, serif" fill="#000000">
      <!-- Axis Labels -->
      <text x="735" y="488" font-size="34" font-style="italic">x</text>
      <text x="120" y="90" font-size="34" font-style="italic">y</text>
      <text x="515" y="525" font-size="32" font-style="italic">x = L</text>
      <text x="635" y="195" font-size="32" font-style="italic">θ<tspan font-size="22" dy="6">0</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q45Svg, "q045-question-image.png");

  // -------------------------------------------------------------
  // Q64: Chemistry Reaction Progress Curves (Options A, B, C, D)
  // -------------------------------------------------------------
  function makeQ64Option(isExo, arrowType) {
    const rY = isExo ? 240 : 340;
    const pY = isExo ? 340 : 240;
    const peakY = 120;
    
    let arrowSvg = "";
    if (arrowType === "none_label") {
      // Option A: Exothermic, 74.8 text next to P
      arrowSvg = `
        <text x="540" y="320" font-family="Times New Roman, serif" font-size="30">74.8</text>
      `;
    } else if (arrowType === "ea_arrow") {
      // Option B: Endothermic, activation arrow
      arrowSvg = `
        <line x1="470" y1="135" x2="470" y2="330" stroke="#000000" stroke-width="3"/>
        <path d="M 464 145 L 470 130 L 476 145" fill="#000000"/>
        <path d="M 464 315 L 470 330 L 476 315" fill="#000000"/>
        <text x="530" y="245" font-family="Times New Roman, serif" font-size="30" text-anchor="middle">74.8</text>
      `;
    } else if (arrowType === "delta_h_exo") {
      // Option C: Exothermic, delta H arrow between R and P levels
      arrowSvg = `
        <line x1="480" y1="250" x2="480" y2="330" stroke="#000000" stroke-width="3"/>
        <path d="M 474 260 L 480 248 L 486 260" fill="#000000"/>
        <path d="M 474 320 L 480 332 L 486 320" fill="#000000"/>
        <text x="430" y="300" font-family="Times New Roman, serif" font-size="30" text-anchor="middle">74.8</text>
      `;
    } else if (arrowType === "delta_h_endo") {
      // Option D: Endothermic, delta H arrow between R and P levels
      arrowSvg = `
        <line x1="530" y1="250" x2="530" y2="330" stroke="#000000" stroke-width="3"/>
        <path d="M 524 260 L 530 248 L 536 260" fill="#000000"/>
        <path d="M 524 320 L 530 332 L 536 320" fill="#000000"/>
        <text x="600" y="300" font-family="Times New Roman, serif" font-size="30" text-anchor="middle">74.8</text>
      `;
    }

    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 500" width="700" height="500">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Axes -->
        <line x1="260" y1="420" x2="660" y2="420" stroke-width="3.5"/>
        <path d="M 648 412 L 662 420 L 648 428" stroke-width="3.5" fill="none"/>
        
        <line x1="260" y1="420" x2="260" y2="60" stroke-width="3.5"/>
        <path d="M 252 72 L 260 58 L 268 72" stroke-width="3.5" fill="none"/>
        
        <!-- Energy Curve -->
        <!-- R plateau, climb to peak, descent to P plateau -->
        <path d="M 285 ${rY} L 380 ${rY} C 400 ${rY}, 410 ${peakY}, 450 ${peakY} C 490 ${peakY}, 500 ${pY}, 530 ${pY} L 620 ${pY}" stroke-width="4"/>
      </g>

      ${arrowSvg}

      <!-- Axis Labels & Text -->
      <g font-family="Times New Roman, serif" fill="#000000">
        <!-- Vertical Axis Label -->
        <text x="140" y="110" font-size="28" text-anchor="middle">Energy</text>
        <text x="140" y="145" font-size="24" text-anchor="middle">(kJ mol<tspan font-size="16" dy="-10">-1</tspan><tspan font-size="24" dy="10">)</tspan></text>
        <line x1="190" y1="260" x2="190" y2="180" stroke="#000000" stroke-width="3"/>
        <path d="M 183 192 L 190 178 L 197 192" fill="#000000"/>

        <!-- Horizontal Axis Label -->
        <text x="470" y="465" font-size="28" text-anchor="middle">Reaction progress</text>
        <line x1="200" y1="475" x2="270" y2="475" stroke="#000000" stroke-width="3"/>
        <path d="M 258 468 L 272 475 L 258 482" fill="#000000"/>

        <!-- R and P labels -->
        <text x="330" y="${rY - 20}" font-size="32" font-weight="bold">R</text>
        <text x="${isExo ? 560 : 570}" y="${pY - 20}" font-size="32" font-weight="bold">P</text>
      </g>
    </svg>
    `;
  }

  await renderSvg(makeQ64Option(true, "none_label"), "q064-option-a-image.png");
  await renderSvg(makeQ64Option(false, "ea_arrow"), "q064-option-b-image.png");
  await renderSvg(makeQ64Option(true, "delta_h_exo"), "q064-option-c-image.png");
  await renderSvg(makeQ64Option(false, "delta_h_endo"), "q064-option-d-image.png");

  // -------------------------------------------------------------
  // Q81: Chemistry Decolorize Bromine Water Cards (A: Styrene, B: Cyclohexane, C: Phenol, D: Aniline)
  // -------------------------------------------------------------
  // Option A: Styrene
  const q81aSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" width="500" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Benzene Ring -->
      <polygon points="120,60 170,90 170,150 120,180 70,150 70,90" />
      <circle cx="120" cy="120" r="30" />
      <!-- Substituent bond -->
      <line x1="170" y1="120" x2="240" y2="120" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="34" fill="#000000">
      <text x="250" y="132">CH=CH<tspan font-size="24" dy="8">2</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q81aSvg, "q081-option-a-image.png");

  // Option B: Cyclohexane
  const q81bSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Clean Cyclohexane Ring -->
      <polygon points="200,50 270,90 270,170 200,210 130,170 130,90" />
    </g>
  </svg>
  `;
  await renderSvg(q81bSvg, "q081-option-b-image.png");

  // Option C: Phenol
  const q81cSSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 280" width="450" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Benzene Ring -->
      <polygon points="130,60 180,90 180,150 130,180 80,150 80,90" />
      <circle cx="130" cy="120" r="30" />
      <!-- Substituent bond -->
      <line x1="180" y1="120" x2="250" y2="120" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="36" fill="#000000">
      <text x="260" y="132">OH</text>
    </g>
  </svg>
  `;
  await renderSvg(q81cSSvg, "q081-option-c-image.png");

  // Option D: Aniline
  const q81dSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 280" width="480" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Benzene Ring -->
      <polygon points="130,60 180,90 180,150 130,180 80,150 80,90" />
      <circle cx="130" cy="120" r="30" />
      <!-- Substituent bond -->
      <line x1="180" y1="120" x2="250" y2="120" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="34" fill="#000000">
      <text x="260" y="132">NH<tspan font-size="24" dy="8">2</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q81dSvg, "q081-option-d-image.png");

  // -------------------------------------------------------------
  // Q82: Chemistry 1-Methylcyclopentene Reaction Scheme & Options
  // -------------------------------------------------------------
  const q82QuestionSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 320" width="850" height="320">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Cyclopentene Ring -->
      <polygon points="120,80 180,125 155,195 85,195 60,125" stroke-width="4"/>
      <!-- Double bond between C1 (top right 180,125) and bottom right 155,195 -->
      <line x1="165" y1="130" x2="145" y2="185" stroke-width="3.5"/>
      <!-- Methyl branch at C1 -->
      <line x1="180" y1="125" x2="235" y2="95" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="245" y="95">CH<tspan font-size="20" dy="6">3</tspan></text>
    </g>

    <!-- Reaction Arrow -->
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" fill="none">
      <line x1="330" y1="160" x2="680" y2="160" stroke-width="4"/>
      <path d="M 665 148 L 685 160 L 665 172" stroke-width="4" fill="#000000"/>
    </g>

    <!-- Arrow Reagents -->
    <g font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#000000">
      <text x="340" y="85">(i) HBr, benzoyl peroxide</text>
      <text x="340" y="120">(ii) KCN</text>
      <text x="340" y="210">(iii) Na(Hg) / C<tspan font-size="16" dy="5">2</tspan><tspan font-size="22" dy="-5">H</tspan><tspan font-size="16" dy="5">5</tspan><tspan font-size="22" dy="-5">OH</tspan></text>
    </g>

    <!-- Product Label -->
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="#000000" text-anchor="middle">
      <text x="750" y="150" font-size="36">P</text>
      <text x="750" y="190" font-size="24">(Major)</text>
    </g>
  </svg>
  `;
  await renderSvg(q82QuestionSvg, "q082-question-image.png");

  // Q82 Options A, B, C, D
  // Option A: 1-methyl, 2-NC
  const q82aSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 300" width="450" height="300">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="160,65 230,115 200,195 120,195 90,115" />
      <line x1="230" y1="115" x2="295" y2="85" />
      <line x1="200" y1="195" x2="265" y2="235" />
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="305" y="90">CH<tspan font-size="20" dy="6">3</tspan></text>
      <text x="275" y="255">NC</text>
    </g>
  </svg>
  `;
  await renderSvg(q82aSvg, "q082-option-a-image.png");

  // Option B: 1-methyl, 1-NC
  const q82bSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 300" width="450" height="300">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="160,65 230,115 200,195 120,195 90,115" />
      <line x1="230" y1="115" x2="280" y2="60" />
      <line x1="230" y1="115" x2="305" y2="135" />
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="285" y="55">NC</text>
      <text x="315" y="145">CH<tspan font-size="20" dy="6">3</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q82bSvg, "q082-option-b-image.png");

  // Option C: 1-methyl, 2-CH2NH2 (Correct)
  const q82cSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="150,65 220,115 190,195 110,195 80,115" />
      <line x1="220" y1="115" x2="285" y2="85" />
      <line x1="190" y1="195" x2="255" y2="235" />
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="295" y="90">CH<tspan font-size="20" dy="6">3</tspan></text>
      <text x="265" y="255">CH<tspan font-size="20" dy="6">2</tspan><tspan font-size="30" dy="-6">NH</tspan><tspan font-size="20" dy="6">2</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q82cSvg, "q082-option-c-image.png");

  // Option D: 1-methyl, 1-CH2NH2
  const q82dSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="150,65 220,115 190,195 110,195 80,115" />
      <line x1="220" y1="115" x2="285" y2="60" />
      <line x1="220" y1="115" x2="275" y2="175" />
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="295" y="60">CH<tspan font-size="20" dy="6">3</tspan></text>
      <text x="285" y="195">CH<tspan font-size="20" dy="6">2</tspan><tspan font-size="30" dy="-6">NH</tspan><tspan font-size="20" dy="6">2</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q82dSvg, "q082-option-d-image.png");

  // -------------------------------------------------------------
  // Q90: Chemistry Grignard Reaction Scheme & Options
  // -------------------------------------------------------------
  const q90QuestionSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 280" width="820" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Benzene Ring -->
      <polygon points="80,110 120,135 120,185 80,210 40,185 40,135" />
      <circle cx="80" cy="160" r="24" />
      <!-- Carbonyl chain -->
      <line x1="120" y1="160" x2="165" y2="160" stroke-width="4"/>
      <!-- C=O -->
      <line x1="161" y1="160" x2="161" y2="105" stroke-width="3.5"/>
      <line x1="169" y1="160" x2="169" y2="105" stroke-width="3.5"/>
      <!-- CH2 - CH2 - CN -->
      <line x1="165" y1="160" x2="205" y2="185" stroke-width="4"/>
      <line x1="205" y1="185" x2="245" y2="160" stroke-width="4"/>
      <line x1="245" y1="160" x2="285" y2="185" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" fill="#000000">
      <text x="165" y="90" text-anchor="middle">O</text>
      <text x="295" y="195">CN</text>
    </g>

    <!-- Reaction Arrow -->
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" fill="none">
      <line x1="370" y1="160" x2="760" y2="160" stroke-width="4"/>
      <path d="M 745 148 L 765 160 L 745 172" stroke-width="4" fill="#000000"/>
    </g>

    <g font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#000000">
      <text x="400" y="105">(i) CH<tspan font-size="18" dy="5">3</tspan><tspan font-size="24" dy="-5">MgBr (excess)</tspan></text>
      <text x="400" y="210">(ii) H<tspan font-size="18" dy="5">3</tspan><tspan font-size="24" dy="-5">O</tspan><tspan font-size="18" dy="-10">+</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q90QuestionSvg, "q090-question-image.png");

  // Q90 Option A: Ph-C(OH)(CH3)-CH2-CH2-C(OH)(CH3)2
  const q90aSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="70,120 110,145 110,195 70,220 30,195 30,145" />
      <circle cx="70" cy="170" r="24" />
      <line x1="110" y1="170" x2="165" y2="170" stroke-width="4"/>
      <!-- C1 substituents: OH, CH3 -->
      <line x1="165" y1="170" x2="135" y2="120" stroke-width="3.5"/>
      <line x1="165" y1="170" x2="185" y2="120" stroke-width="3.5"/>
      <!-- chain -->
      <line x1="165" y1="170" x2="215" y2="200" stroke-width="4"/>
      <line x1="215" y1="200" x2="265" y2="170" stroke-width="4"/>
      <line x1="265" y1="170" x2="315" y2="200" stroke-width="4"/>
      <!-- C4 substituents: OH, CH3, CH3 -->
      <line x1="315" y1="200" x2="315" y2="135" stroke-width="3.5"/>
      <line x1="315" y1="200" x2="375" y2="180" stroke-width="3.5"/>
      <line x1="315" y1="200" x2="355" y2="245" stroke-width="3.5"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="26" fill="#000000">
      <text x="60" y="105">H<tspan font-size="18" dy="5">3</tspan><tspan font-size="26" dy="-5">C</tspan></text>
      <text x="180" y="105">OH</text>
      <text x="315" y="120" text-anchor="middle">OH</text>
      <text x="385" y="188">CH<tspan font-size="18" dy="5">3</tspan></text>
      <text x="365" y="260">CH<tspan font-size="18" dy="5">3</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q90aSvg, "q090-option-a-image.png");

  // Q90 Option B: Ph-C(=O)-CH2-CH2-C(=O)CH3 (Diketone)
  const q90bSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 280" width="520" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="70,120 110,145 110,195 70,220 30,195 30,145" />
      <circle cx="70" cy="170" r="24" />
      <line x1="110" y1="170" x2="160" y2="170" stroke-width="4"/>
      <!-- C=O 1 -->
      <line x1="156" y1="170" x2="156" y2="115" stroke-width="3.5"/>
      <line x1="164" y1="170" x2="164" y2="115" stroke-width="3.5"/>
      <!-- chain -->
      <line x1="160" y1="170" x2="205" y2="200" stroke-width="4"/>
      <line x1="205" y1="200" x2="255" y2="170" stroke-width="4"/>
      <line x1="255" y1="170" x2="305" y2="200" stroke-width="4"/>
      <!-- C=O 2 -->
      <line x1="301" y1="200" x2="301" y2="250" stroke-width="3.5"/>
      <line x1="309" y1="200" x2="309" y2="250" stroke-width="3.5"/>
      <!-- CH3 -->
      <line x1="305" y1="200" x2="355" y2="170" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="28" fill="#000000">
      <text x="160" y="100" text-anchor="middle">O</text>
      <text x="305" y="275" text-anchor="middle">O</text>
      <text x="365" y="175">CH<tspan font-size="18" dy="5">3</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q90bSvg, "q090-option-b-image.png");

  // Q90 Option C: Ph-C(OH)(CH3)-CH2-CH2-CN
  const q90cSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 280" width="520" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="70,120 110,145 110,195 70,220 30,195 30,145" />
      <circle cx="70" cy="170" r="24" />
      <line x1="110" y1="170" x2="165" y2="170" stroke-width="4"/>
      <!-- substituents at C1 -->
      <line x1="165" y1="170" x2="125" y2="120" stroke-width="3.5"/>
      <line x1="165" y1="170" x2="205" y2="120" stroke-width="3.5"/>
      <!-- chain -->
      <line x1="165" y1="170" x2="215" y2="200" stroke-width="4"/>
      <line x1="215" y1="200" x2="265" y2="170" stroke-width="4"/>
      <line x1="265" y1="170" x2="315" y2="200" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="28" fill="#000000">
      <text x="65" y="110">CH<tspan font-size="18" dy="5">3</tspan></text>
      <text x="210" y="110">OH</text>
      <text x="325" y="210">CN</text>
    </g>
  </svg>
  `;
  await renderSvg(q90cSvg, "q090-option-c-image.png");

  // Q90 Option D: Ph-C(OH)(CH3)-CH2-CH2-C(=O)CH3 (Correct)
  const q90dSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 280" width="580" height="280">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <polygon points="70,120 110,145 110,195 70,220 30,195 30,145" />
      <circle cx="70" cy="170" r="24" />
      <line x1="110" y1="170" x2="165" y2="170" stroke-width="4"/>
      <!-- substituents at C1: CH3, OH -->
      <line x1="165" y1="170" x2="125" y2="120" stroke-width="3.5"/>
      <line x1="165" y1="170" x2="205" y2="120" stroke-width="3.5"/>
      <!-- chain -->
      <line x1="165" y1="170" x2="215" y2="200" stroke-width="4"/>
      <line x1="215" y1="200" x2="265" y2="170" stroke-width="4"/>
      <line x1="265" y1="170" x2="315" y2="200" stroke-width="4"/>
      <!-- C=O at C4 -->
      <line x1="311" y1="200" x2="311" y2="250" stroke-width="3.5"/>
      <line x1="319" y1="200" x2="319" y2="250" stroke-width="3.5"/>
      <!-- CH3 at C5 -->
      <line x1="315" y1="200" x2="365" y2="170" stroke-width="4"/>
    </g>
    <g font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="28" fill="#000000">
      <text x="65" y="110">CH<tspan font-size="18" dy="5">3</tspan></text>
      <text x="210" y="110">OH</text>
      <text x="315" y="275" text-anchor="middle">O</text>
      <text x="375" y="175">CH<tspan font-size="18" dy="5">3</tspan></text>
    </g>
  </svg>
  `;
  await renderSvg(q90dSvg, "q090-option-d-image.png");

  // -------------------------------------------------------------
  // Q164: Biology Nephron Tubule Absorption & Secretion (Options A, B, C, D)
  // -------------------------------------------------------------
  function makeNephronOption(pTop, pBottom, dTop, dBottom) {
    // Generate tubule P on left and tubule D on right with arrows
    function renderArrows(arrows, isTop, startX, startY) {
      return arrows.map((item, idx) => {
        const x = startX + idx * 85;
        const arrowY = isTop ? startY - 45 : startY + 45;
        const textY = isTop ? startY - 55 : startY + 80;
        const arrowHead = isTop 
          ? `<path d="M ${x-6} ${arrowY+12} L ${x} ${arrowY} L ${x+6} ${arrowY+12}" fill="#000000"/>`
          : `<path d="M ${x-6} ${startY+12} L ${x} ${startY} L ${x+6} ${startY+12}" fill="#000000"/>`;
        
        return `
          <line x1="${x}" y1="${isTop ? startY : startY + 45}" x2="${x}" y2="${isTop ? arrowY : startY}" stroke="#000000" stroke-width="3.5"/>
          ${arrowHead}
          <text x="${x}" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="24" fill="#000000" text-anchor="middle">${item}</text>
        `;
      }).join("");
    }

    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 400" width="750" height="400">
      <rect width="100%" height="100%" fill="#ffffff"/>
      
      <!-- Tubule P (Left) -->
      <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Bowman capsule cup -->
        <path d="M 60 190 C 50 190, 45 200, 55 205 C 45 210, 50 220, 60 220" />
        <!-- Upper convoluted wall -->
        <path d="M 60 190 Q 80 180, 100 190 T 140 190 T 180 190 T 220 190 T 260 190 L 320 190 L 320 350" />
        <!-- Lower convoluted wall -->
        <path d="M 60 220 Q 80 210, 100 220 T 140 220 T 180 220 T 220 220 T 260 220 L 290 220 L 290 350" />
      </g>
      
      <!-- Tubule D (Right) -->
      <g stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Ascending limb to convoluted wall -->
        <path d="M 440 350 L 440 190 L 490 190 Q 510 180, 530 190 T 570 190 T 610 190 T 650 190 L 700 190" />
        <path d="M 470 350 L 470 220 L 490 220 Q 510 210, 530 220 T 570 220 T 610 220 T 650 220 L 700 220" />
      </g>

      <!-- Section Labels -->
      <text x="180" y="60" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="34" fill="#000000" text-anchor="middle">P</text>
      <text x="580" y="60" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="34" fill="#000000" text-anchor="middle">D</text>

      <!-- Arrows for P -->
      ${renderArrows(pTop, true, 100, 190)}
      ${renderArrows(pBottom, false, 120, 220)}

      <!-- Arrows for D -->
      ${renderArrows(dTop, true, 520, 190)}
      ${renderArrows(dBottom, false, 550, 220)}
    </svg>
    `;
  }

  // Format chemical formulas with sub/sup for SVG
  const hco3 = 'HCO<tspan font-size="16" dy="5">3</tspan><tspan font-size="16" dy="-10">-</tspan>';
  const h2o = 'H<tspan font-size="16" dy="5">2</tspan><tspan font-size="24" dy="-5">O</tspan>';
  const nacl = 'NaCl';
  const h_plus = 'H<tspan font-size="16" dy="-8">+</tspan>';
  const nh3 = 'NH<tspan font-size="16" dy="5">3</tspan>';
  const k_plus = 'K<tspan font-size="16" dy="-8">+</tspan>';

  // Option A:
  // P top: HCO3-, NaCl, H2O; P bot: H+, NH3
  // D top: H2O, HCO3-; D bot: NaCl, H+
  await renderSvg(makeNephronOption([hco3, nacl, h2o], [h_plus, nh3], [h2o, hco3], [nacl, h_plus]), "q164-option-a-image.png");

  // Option B:
  // P top: NaCl, HCO3-; P bot: H+, H2O
  // D top: NaCl, NH3; D bot: K+, H2O
  await renderSvg(makeNephronOption([nacl, hco3], [h_plus, h2o], [nacl, nh3], [k_plus, h2o]), "q164-option-b-image.png");

  // Option C:
  // P top: HCO3-, NaCl; P bot: H+, H2O
  // D top: NaCl, H2O, HCO3-; D bot: K+, H+
  await renderSvg(makeNephronOption([hco3, nacl], [h_plus, h2o], [nacl, h2o, hco3], [k_plus, h_plus]), "q164-option-c-image.png");

  // Option D (Correct NCERT Standard):
  // P top: HCO3-, NaCl, H2O; P bot: H+, NH3
  // D top: NaCl, H2O, HCO3-; D bot: K+, H+
  await renderSvg(makeNephronOption([hco3, nacl, h2o], [h_plus, nh3], [nacl, h2o, hco3], [k_plus, h_plus]), "q164-option-d-image.png");

  console.log("All NEET 2025 diagrams rendered successfully!");
}

main().catch(console.error);
