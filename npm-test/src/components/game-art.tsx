import type { ArtTheme } from "@/data/games";
import { cn } from "@/lib/utils";

export function GameArt({
  theme,
  title,
  className,
  decorative = true,
}: {
  theme: ArtTheme;
  title: string;
  className?: string;
  decorative?: boolean;
}) {
  const accessibilityProps = decorative
    ? { "aria-hidden": true as const, role: "presentation" as const }
    : { role: "img" as const, "aria-label": `Illustration for ${title}` };

  return (
    <div className={cn("relative isolate h-full w-full overflow-hidden", className)} {...accessibilityProps}>
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        focusable="false"
      >
        {theme === "paper" ? <PaperScene /> : null}
        {theme === "night" ? <NightScene /> : null}
        {theme === "forest" ? <ForestScene /> : null}
        {theme === "stage" ? <StageScene /> : null}
        {theme === "notes" ? <NotesScene /> : null}
        {theme === "manor" ? <ManorScene /> : null}
        {theme === "amber" ? <AmberScene /> : null}
        {theme === "grid" ? <GridScene /> : null}
        {theme === "buzzer" ? <BuzzerScene /> : null}
        {theme === "fold" ? <FoldScene /> : null}
      </svg>
      <div className="noise-overlay" aria-hidden="true" />
    </div>
  );
}

function PaperScene() {
  return (
    <>
      <rect width="800" height="520" fill="#E7DAC3" />
      <circle cx="628" cy="112" r="188" fill="#DDCAA9" />
      <path d="M0 410C150 360 260 388 402 430c142 42 260 16 398-27v117H0Z" fill="#D9CBB4" />
      <g transform="rotate(-9 280 300)">
        <rect x="155" y="168" width="278" height="344" rx="22" fill="#B9A98B" opacity=".5" />
        <rect x="143" y="152" width="278" height="344" rx="22" fill="#FBF6E9" />
        <circle cx="202" cy="211" r="15" fill="#A5B69A" />
        <path d="M184 266h194M184 296h166M184 326h122" stroke="#233D32" strokeWidth="8" strokeLinecap="round" opacity=".22" />
        <path d="M183 397c24-27 47 24 71-3s48 19 71-8" stroke="#C97959" strokeWidth="7" strokeLinecap="round" fill="none" />
      </g>
      <g transform="rotate(6 530 310)">
        <rect x="460" y="188" width="264" height="330" rx="22" fill="#B9A98B" opacity=".5" />
        <rect x="449" y="172" width="264" height="330" rx="22" fill="#F6EFDF" />
        <circle cx="505" cy="229" r="15" fill="#E4B85E" />
        <path d="M487 284h174M487 314h142M487 344h108" stroke="#233D32" strokeWidth="8" strokeLinecap="round" opacity=".2" />
        <circle cx="563" cy="416" r="32" fill="none" stroke="#233D32" strokeWidth="7" opacity=".3" />
        <path d="m550 416 10 10 19-23" stroke="#233D32" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity=".55" fill="none" />
      </g>
      <g transform="rotate(-15 359 307)">
        <rect x="275" y="152" width="205" height="300" rx="20" fill="#A85D40" opacity=".3" />
        <rect x="266" y="137" width="205" height="300" rx="20" fill="#C97959" />
        <circle cx="307" cy="180" r="11" fill="#F7F4EC" opacity=".8" />
        <path d="M301 239h128M301 272h102M301 305h70" stroke="#F7F4EC" strokeWidth="8" strokeLinecap="round" opacity=".5" />
        <path d="M305 374c22-39 51 14 78-21s43 8 63-18" stroke="#233D32" strokeWidth="8" strokeLinecap="round" opacity=".75" fill="none" />
      </g>
      <g transform="rotate(38 639 401)">
        <rect x="617" y="317" width="34" height="210" rx="8" fill="#233D32" />
        <path d="m617 329 34-38v44Z" fill="#E4B85E" />
      </g>
      <circle cx="115" cy="116" r="49" fill="#E4B85E" opacity=".85" />
      <path d="M91 116h48M115 92v48" stroke="#233D32" strokeWidth="7" strokeLinecap="round" opacity=".4" />
    </>
  );
}

function NightScene() {
  return (
    <>
      <rect width="800" height="520" fill="#182A23" />
      <circle cx="568" cy="168" r="119" fill="#E9D7AA" />
      <circle cx="618" cy="128" r="119" fill="#182A23" />
      <path d="M0 394c91-42 166-50 257-20 109 36 151 18 235-18 95-41 185-31 308 23v141H0Z" fill="#223A30" />
      <path d="M0 444c140-31 256-22 385 14 85 24 162 18 247-8 62-19 117-12 168 8v62H0Z" fill="#2D4A3D" />
      {[96, 148, 200, 710].map((x, index) => (
        <g key={x}>
          <path d={`M${x} 394V226l28-32 28 32v168Z`} fill="#101E19" />
          <rect x={x + 14} y={index % 2 === 0 ? 254 : 300} width="12" height="18" fill="#E4B85E" opacity=".7" />
          <rect x={x + 35} y={index % 2 === 0 ? 338 : 310} width="12" height="18" fill="#E4B85E" opacity=".35" />
        </g>
      ))}
      <g transform="rotate(8 560 340)">
        <rect x="466" y="245" width="194" height="260" rx="18" fill="#0F1F19" opacity=".35" />
        <rect x="456" y="232" width="194" height="260" rx="18" fill="#F4EBD8" />
        <path d="M553 274c28 18 48 48 48 79 0 17-7 33-19 44l12 33-22 11-12-22c-11 4-23 5-34 2l-12 21-22-11 12-32c-14-12-22-28-22-46 0-31 20-61 48-79Z" fill="#233D32" />
        <circle cx="524" cy="354" r="6" fill="#C97959" />
        <circle cx="582" cy="354" r="6" fill="#C97959" />
      </g>
      <g>
        <circle cx="214" cy="398" r="42" fill="#0F1F19" />
        <path d="M141 500c5-57 34-91 73-91s68 34 73 91Z" fill="#0F1F19" />
        <circle cx="339" cy="414" r="38" fill="#0F1F19" />
        <path d="M274 510c5-52 30-84 65-84s60 32 65 84Z" fill="#0F1F19" />
        <circle cx="431" cy="430" r="31" fill="#0F1F19" />
        <path d="M376 512c4-42 25-67 55-67s51 25 55 67Z" fill="#0F1F19" />
      </g>
      <path d="M95 176c26-23 59-23 84 0" stroke="#A5B69A" strokeWidth="3" fill="none" opacity=".36" />
    </>
  );
}

function ForestScene() {
  return (
    <>
      <rect width="800" height="520" fill="#20382E" />
      <circle cx="575" cy="162" r="130" fill="#F0DFB5" />
      <circle cx="621" cy="125" r="116" fill="#20382E" opacity=".25" />
      <path d="M0 382c83-24 143-27 227 4 79 29 126 37 214 8 97-32 177-38 359 17v109H0Z" fill="#192F27" />
      <path d="M0 442c129-21 238-12 339 13 127 31 216 7 314-9 55-9 101-3 147 8v66H0Z" fill="#2C4A3E" />
      {[42, 105, 172, 697, 748].map((x, index) => (
        <g key={x} opacity={index < 3 ? 0.95 : 0.8}>
          <path d={`M${x} 470  ${x + 8} 0h42l-25 470Z`} fill="#DDD2B9" opacity=".82" />
          <path d={`M${x + 24} 470  ${x + 18} 150h12l3 320Z`} fill="#1A2D25" opacity=".2" />
          <path d={`M${x + 7} ${150 + index * 37}h20M${x + 5} ${232 + index * 31}h12`} stroke="#1A2D25" strokeWidth="4" opacity=".35" />
        </g>
      ))}
      <g fill="#101F1A">
        <path d="M461 431c-3-31 8-67 37-91 12-10 21-23 21-37 0-10 8-18 18-18s18 8 18 18c0 12 7 22 19 31 25 20 42 53 44 97Z" />
        <path d="m543 337 30-65-10 68 42-37-24 60Z" />
        <circle cx="528" cy="347" r="4" fill="#E4B85E" />
        <path d="M464 430c-25-27-56-48-76-40-15 6-16 26-2 44 12 16 33 26 58 29Z" />
      </g>
      <path d="M494 463c29 37 78 39 108 2" stroke="#A5B69A" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".3" />
      <g opacity=".2" stroke="#F0DFB5" strokeWidth="4" strokeLinecap="round">
        <path d="M101 108v58M72 137h58" />
        <path d="M265 58v30M250 73h30" />
      </g>
    </>
  );
}

function StageScene() {
  return (
    <>
      <rect width="800" height="520" fill="#B9674B" />
      <path d="M0 0h256c-33 91-9 181 72 266-75 76-98 168-72 254H0Z" fill="#9A4F37" />
      <path d="M800 0H544c33 91 9 181-72 266 75 76 98 168 72 254h256Z" fill="#9A4F37" />
      <path d="M80 0c-7 111 25 194 103 273-86 79-120 162-111 247M198 0c-3 82 24 158 92 248" stroke="#7F3E2B" strokeWidth="7" fill="none" opacity=".45" />
      <path d="M720 0c7 111-25 194-103 273 86 79 120 162 111 247M602 0c3 82-24 158-92 248" stroke="#7F3E2B" strokeWidth="7" fill="none" opacity=".45" />
      <path d="M251 0h298l109 24H142Z" fill="#7F3E2B" opacity=".55" />
      <path d="M145 0h510l-96 94H241Z" fill="#F2DDB9" opacity=".16" />
      <ellipse cx="400" cy="484" rx="292" ry="57" fill="#7D3C2A" opacity=".55" />
      <circle cx="400" cy="175" r="51" fill="#233D32" />
      <path d="M356 244c9-33 33-54 65-54 34 0 59 21 69 54l30 142c8 37-17 70-55 70h-84c-38 0-62-33-54-70Z" fill="#233D32" />
      <path d="M499 266c30-12 61-55 81-101l27 27c-22 62-60 109-99 121Z" fill="#233D32" />
      <circle cx="616" cy="158" r="26" fill="#F2DDB9" />
      <path d="M299 240c-40 11-75 30-108 45" stroke="#233D32" strokeWidth="31" strokeLinecap="round" />
      <path d="M292 335h-37v151h-35V335h-13" stroke="#F2DDB9" strokeWidth="12" strokeLinecap="round" fill="none" />
      <g transform="translate(313 78)">
        <circle cx="0" cy="0" r="44" fill="#F7F4EC" opacity=".88" />
        <path d="M0-26v30l19 12" stroke="#233D32" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </>
  );
}

function NotesScene() {
  return (
    <>
      <rect width="800" height="520" fill="#E5D8BD" />
      <circle cx="153" cy="111" r="128" fill="#A5B69A" opacity=".45" />
      <path d="M660 0h140v191c-55-22-125-42-140-88Z" fill="#E4B85E" opacity=".45" />
      <g transform="rotate(-7 232 194)">
        <rect x="98" y="76" width="276" height="238" rx="8" fill="#B6A47F" opacity=".35" />
        <rect x="88" y="65" width="276" height="238" rx="8" fill="#E4B85E" />
        <rect x="88" y="65" width="276" height="47" fill="#D2A445" opacity=".55" />
        <path d="M213 146c-31 0-54 26-54 58 0 43 61 85 61 85s59-43 59-85c0-33-24-58-55-58Zm0 35c14 0 24 11 24 26 0 17-14 37-27 50-14-14-28-36-28-52 0-14 11-24 25-24Z" fill="#233D32" opacity=".65" />
      </g>
      <g transform="rotate(9 592 138)">
        <rect x="461" y="47" width="258" height="181" rx="8" fill="#2A483B" opacity=".14" />
        <rect x="452" y="36" width="258" height="181" rx="8" fill="#F7F4EC" />
        <path d="M573 78c-20 0-35 16-35 37 0 30 35 55 35 55s36-25 36-55c0-21-15-37-36-37Z" fill="#C97959" opacity=".7" />
      </g>
      <g transform="rotate(6 600 386)">
        <rect x="479" y="287" width="244" height="196" rx="8" fill="#2A483B" opacity=".18" />
        <rect x="470" y="276" width="244" height="196" rx="8" fill="#A5B69A" />
        <path d="M572 309c-23 0-40 18-40 42 0 31 40 61 40 61s41-30 41-61c0-24-18-42-41-42Z" fill="#233D32" opacity=".62" />
      </g>
      <g transform="translate(353 194)">
        <ellipse cx="58" cy="60" rx="83" ry="105" fill="#233D32" opacity=".92" />
        <path d="M-5 96c-18 38-24 78-16 136h172c8-58 2-98-16-136Z" fill="#233D32" opacity=".65" />
        <rect x="-1" y="26" width="117" height="57" rx="5" fill="#F7F4EC" transform="rotate(-4)" />
        <text x="58" y="68" textAnchor="middle" fontFamily="Georgia, serif" fontSize="38" fontWeight="600" fill="#233D32" transform="rotate(-4)">
          ?
        </text>
      </g>
      <path d="M344 154c-26-26-67 3-43 34 16 21 43 36 43 36s28-15 43-36c24-31-17-60-43-34Z" fill="#C97959" opacity=".8" />
    </>
  );
}

function ManorScene() {
  return (
    <>
      <rect width="800" height="520" fill="#2F3B33" />
      <rect x="0" y="0" width="800" height="520" fill="#4F3C2D" opacity=".24" />
      <path d="M81 515V254L188 167l103 87v261" fill="#1B2B23" opacity=".7" />
      <path d="M655 515V203l93-77 52 77v312" fill="#1B2B23" opacity=".55" />
      <ellipse cx="400" cy="460" rx="320" ry="56" fill="#19261F" opacity=".6" />
      <g>
        <rect x="295" y="82" width="218" height="328" rx="109" fill="#E7D8B9" opacity=".16" />
        <path d="M308 112c38 51 44 113 0 162-46 49-40 111 0 162" stroke="#E4B85E" strokeWidth="3" fill="none" opacity=".45" />
        <path d="M500 112c-38 51-44 113 0 162 46 49 40 111 0 162" stroke="#E4B85E" strokeWidth="3" fill="none" opacity=".45" />
        <circle cx="404" cy="194" r="57" fill="#E7D8B9" opacity=".88" />
        <path d="M326 352c4-73 34-116 78-116s75 43 79 116Z" fill="#E7D8B9" opacity=".88" />
      </g>
      <g transform="translate(440 202) rotate(9)">
        <circle cx="114" cy="114" r="98" fill="#F7F4EC" opacity=".13" />
        <circle cx="114" cy="114" r="87" fill="none" stroke="#F0DFB5" strokeWidth="12" opacity=".88" />
        <circle cx="114" cy="114" r="74" fill="#DDD2B9" opacity=".12" />
        <path d="m174 181 84 91" stroke="#F0DFB5" strokeWidth="20" strokeLinecap="round" />
        <path d="m248 258 34 38" stroke="#C97959" strokeWidth="24" strokeLinecap="round" />
        <path d="M82 117c19-25 47-62 78-51 25 9 20 48-3 77-26 31-55 51-74 41-15-8-16-39-1-67Z" fill="#1B2B23" opacity=".22" />
      </g>
      <g transform="translate(579 399) rotate(-11)">
        <rect width="144" height="97" rx="6" fill="#F1E3C7" />
        <path d="m0 0 72 47L144 0" stroke="#B9A98B" strokeWidth="3" fill="none" />
        <circle cx="72" cy="52" r="17" fill="#C97959" />
      </g>
      <path d="M112 353v-60c0-24 18-42 42-42s42 18 42 42v60" stroke="#E4B85E" strokeWidth="7" fill="none" opacity=".55" />
      <circle cx="154" cy="313" r="13" fill="#E4B85E" opacity=".7" />
    </>
  );
}

function AmberScene() {
  return (
    <>
      <rect width="800" height="520" fill="#D9AC58" />
      <path d="M0 358c169-73 330-41 464 5 132 45 230 25 336-17v174H0Z" fill="#C99741" opacity=".7" />
      <circle cx="109" cy="98" r="172" fill="#EBCB83" opacity=".6" />
      <circle cx="690" cy="461" r="180" fill="#B47E2C" opacity=".32" />
      <g transform="translate(370 225) rotate(-8)">
        <rect x="0" y="0" width="236" height="288" rx="16" fill="#B47E2C" opacity=".25" />
        <rect x="-12" y="-12" width="236" height="288" rx="16" fill="#FBF3DF" />
        <path d="M38 53h155M38 81h110" stroke="#233D32" strokeWidth="9" strokeLinecap="round" opacity=".25" />
        <path d="M62 190c0-43 23-79 51-79s52 36 52 79c0 30-20 52-52 52s-51-22-51-52Z" fill="#C97959" opacity=".75" />
        <path d="M113 139v54M86 166h54" stroke="#FBF3DF" strokeWidth="9" strokeLinecap="round" />
      </g>
      <g fill="#233D32">
        <circle cx="176" cy="322" r="43" />
        <circle cx="269" cy="371" r="39" opacity=".75" />
        <circle cx="187" cy="420" r="34" opacity=".55" />
        <circle cx="609" cy="129" r="37" opacity=".58" />
        <circle cx="677" cy="210" r="29" opacity=".38" />
      </g>
      {[0, 1, 2, 3, 4].map((index) => (
        <circle
          key={index}
          cx={127 + index * 26}
          cy={120 + (index % 2) * 20}
          r="12"
          fill="#FBF3DF"
          opacity={0.85 - index * 0.11}
        />
      ))}
      <g stroke="#233D32" strokeWidth="7" strokeLinecap="round" opacity=".5">
        <path d="M642 348v95M676 328v115M710 356v87M744 336v107" />
      </g>
      <path d="M45 261c41-28 82-36 122-29" stroke="#FBF3DF" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".35" />
    </>
  );
}

function GridScene() {
  return (
    <>
      <rect width="800" height="520" fill="#AABE9D" />
      <path d="M0 0h290l-84 520H0Z" fill="#B8C9AB" opacity=".65" />
      <path d="M800 0H546l69 520h185Z" fill="#94AA87" opacity=".5" />
      <g transform="rotate(-5 405 280)">
        {[
          { x: 132, y: 101, fill: "#F7F4EC", letter: "C" },
          { x: 267, y: 84, fill: "#233D32", letter: "A", light: true },
          { x: 403, y: 101, fill: "#E4B85E", letter: "T" },
          { x: 540, y: 84, fill: "#F7F4EC", letter: "E" },
          { x: 181, y: 222, fill: "#C97959", letter: "G", light: true },
          { x: 318, y: 205, fill: "#F7F4EC", letter: "O" },
          { x: 455, y: 222, fill: "#233D32", letter: "R", light: true },
          { x: 589, y: 205, fill: "#E4B85E", letter: "Y" },
          { x: 114, y: 342, fill: "#F7F4EC", letter: "W" },
          { x: 250, y: 326, fill: "#E4B85E", letter: "O" },
          { x: 386, y: 342, fill: "#F7F4EC", letter: "R" },
          { x: 523, y: 326, fill: "#C97959", letter: "D", light: true },
          { x: 661, y: 342, fill: "#233D32", letter: "S", light: true },
        ].map((tile, index) => (
          <g key={`${tile.x}-${tile.y}`} transform={`rotate(${index % 2 === 0 ? -2 : 2} ${tile.x + 60} ${tile.y + 60})`}>
            <rect x={tile.x + 8} y={tile.y + 11} width="120" height="120" rx="12" fill="#233D32" opacity=".16" />
            <rect x={tile.x} y={tile.y} width="120" height="120" rx="12" fill={tile.fill} />
            <text
              x={tile.x + 60}
              y={tile.y + 82}
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontSize="67"
              fontWeight="600"
              fill={tile.light ? "#F7F4EC" : "#233D32"}
            >
              {tile.letter}
            </text>
          </g>
        ))}
      </g>
      <path d="M73 72c37 0 63 19 63 52s-28 54-65 54H46V72Zm-7 78h7c22 0 37-9 37-26 0-16-14-24-35-24h-9Z" fill="#233D32" opacity=".26" />
    </>
  );
}

function BuzzerScene() {
  return (
    <>
      <rect width="800" height="520" fill="#1C342B" />
      <circle cx="129" cy="98" r="198" fill="#2D4C3E" opacity=".55" />
      <circle cx="707" cy="458" r="223" fill="#121F1A" opacity=".6" />
      <path d="M177 88c55-51 146-52 200 10" stroke="#E4B85E" strokeWidth="2" opacity=".35" fill="none" />
      <g transform="translate(175 112) skewY(-3)">
        <rect x="18" y="31" width="455" height="300" rx="37" fill="#0F1D18" opacity=".4" />
        <rect x="0" y="0" width="455" height="300" rx="37" fill="#F7F4EC" opacity=".16" />
        <rect x="1" y="1" width="453" height="298" rx="36" fill="none" stroke="#F7F4EC" strokeWidth="2" opacity=".34" />
        <circle cx="62" cy="55" r="13" fill="#E4B85E" />
        <rect x="91" y="46" width="133" height="15" rx="7.5" fill="#F7F4EC" opacity=".5" />
        <rect x="53" y="96" width="335" height="20" rx="10" fill="#F7F4EC" opacity=".8" />
        <rect x="53" y="130" width="238" height="20" rx="10" fill="#F7F4EC" opacity=".42" />
        <rect x="53" y="190" width="162" height="58" rx="12" fill="#F7F4EC" opacity=".23" />
        <rect x="230" y="190" width="162" height="58" rx="12" fill="#E4B85E" opacity=".9" />
      </g>
      <g transform="translate(580 137) rotate(8)">
        <rect x="16" y="22" width="154" height="293" rx="27" fill="#0F1D18" opacity=".4" />
        <rect width="154" height="293" rx="27" fill="#233D32" stroke="#F7F4EC" strokeOpacity=".3" strokeWidth="3" />
        <rect x="17" y="54" width="120" height="7" rx="3.5" fill="#F7F4EC" opacity=".3" />
        <rect x="17" y="82" width="120" height="64" rx="11" fill="#F7F4EC" opacity=".12" />
        <rect x="17" y="161" width="120" height="38" rx="9" fill="#E4B85E" opacity=".9" />
        <rect x="17" y="211" width="120" height="38" rx="9" fill="#F7F4EC" opacity=".16" />
        <circle cx="77" cy="272" r="7" fill="#F7F4EC" opacity=".35" />
      </g>
      <g transform="translate(103 398)">
        <ellipse cx="85" cy="86" rx="93" ry="26" fill="#0F1D18" opacity=".4" />
        <circle cx="85" cy="54" r="61" fill="#B25C40" />
        <circle cx="85" cy="47" r="47" fill="#C97959" />
        <circle cx="85" cy="47" r="31" fill="#E4B85E" />
        <circle cx="82" cy="38" r="11" fill="#F7F4EC" opacity=".5" />
      </g>
      <path d="M320 466h167" stroke="#F7F4EC" strokeWidth="2" opacity=".2" />
      <circle cx="374" cy="466" r="3" fill="#E4B85E" opacity=".8" />
      <circle cx="408" cy="466" r="3" fill="#F7F4EC" opacity=".25" />
      <circle cx="442" cy="466" r="3" fill="#F7F4EC" opacity=".25" />
    </>
  );
}

function FoldScene() {
  return (
    <>
      <rect width="800" height="520" fill="#DFC0A9" />
      <path d="M0 0h800v175C662 123 514 154 398 125 269 93 151 81 0 141Z" fill="#E9D2BF" opacity=".7" />
      <circle cx="688" cy="94" r="146" fill="#C97959" opacity=".22" />
      <g transform="rotate(-8 375 269)">
        <path d="M124 148h505v273H124Z" fill="#B6977F" opacity=".38" />
        <path d="M109 132h505l-70 273H39Z" fill="#FBF5E7" />
        <path d="M109 132h505l-23 91H86Z" fill="#F2E7D3" />
        <path d="M421 405 614 132" stroke="#BAC7B1" strokeWidth="2" opacity=".7" />
        <path d="M226 405 444 132" stroke="#BAC7B1" strokeWidth="2" opacity=".7" />
        <g transform="translate(156 177)">
          <path d="M13 41c23-26 46-24 63 1 12 18 38 15 46-3 8-17 31-14 39 5 8 20 31 26 48 10" stroke="#233D32" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M48 10c-6 20-21 23-35 14M201 8c-14 11-28 10-39 0" stroke="#233D32" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        <g transform="translate(461 178)">
          <circle cx="46" cy="42" r="30" fill="none" stroke="#C97959" strokeWidth="5" />
          <path d="M39 39h.1M55 39h.1" stroke="#C97959" strokeWidth="7" strokeLinecap="round" />
          <path d="M39 50c5 5 11 5 16 0M20 16 7 0m63 16 17-20" stroke="#C97959" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        <g transform="translate(297 190)">
          <path d="M3 37h124M3 59h79" stroke="#233D32" strokeWidth="7" strokeLinecap="round" opacity=".22" />
        </g>
        <g transform="translate(165 286)">
          <rect x="1" y="2" width="118" height="69" rx="5" fill="#A5B69A" opacity=".35" />
          <path d="M23 51c15-30 28-28 38-5 9 20 24 8 33-14" stroke="#233D32" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(438 285)">
          <path d="M5 30h86M5 51h57" stroke="#233D32" strokeWidth="6" strokeLinecap="round" opacity=".28" />
        </g>
      </g>
      <g transform="rotate(32 659 381)">
        <rect x="641" y="265" width="30" height="231" rx="6" fill="#233D32" />
        <path d="m641 279 30-34v41Z" fill="#E4B85E" />
        <path d="M641 290h30" stroke="#172A22" strokeWidth="4" />
      </g>
      <path d="M87 456c65-21 117-17 175 3" stroke="#B6977F" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
    </>
  );
}
