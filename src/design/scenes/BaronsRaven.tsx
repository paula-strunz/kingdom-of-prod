import { Keeper } from "./folk";
import { Appear, Cart, Fog, Leaf, Moon, Pumpkin, Sky, ink, thinInk, vars, type SceneProps } from "./parts";
import styles from "./scenes.module.css";

const POSTS = "M56 98 V122 M64 98 V122 M248 96 V120 M256 96 V120";

/** The bridge over the river: sagging before the choice, then mended or broken. */
function Bridge({ state }: { state: "sagging" | "mended" | "broken" }) {
  const wood = { stroke: "var(--color-ember)", strokeLinecap: "round", fill: "none" } as const;
  if (state === "broken") {
    return (
      <g>
        <path d={POSTS} {...wood} strokeWidth="3" />
        <path d="M56 110 Q96 114 118 138" {...wood} strokeWidth="4" />
        <path d="M256 108 Q220 112 200 136" {...wood} strokeWidth="4" />
        <path d="M76 112 V118 M94 117 V124 M108 126 V133 M236 110 V116 M220 116 V123 M208 125 V132" {...wood} strokeWidth="2.5" />
        <path d="M56 98 Q84 106 96 118 M256 96 Q232 104 222 116" fill="none" stroke="var(--color-stone)" strokeWidth="1.2" />
        <path d="M134 140 l10 -3 M176 142 l-9 -4" {...wood} strokeWidth="2.5" />
      </g>
    );
  }
  const deck = state === "mended" ? "M56 110 L256 108" : "M56 110 Q156 140 256 108";
  const planks =
    state === "mended"
      ? "M76 110 V116 M96 110 V116 M116 110 V116 M136 109 V115 M156 109 V115 M176 109 V115 M196 109 V115 M216 108 V114 M236 108 V114"
      : "M76 114 L76 119 M90 117 L90 123 M104 120 L104 126 M132 124 L132 130 M146 125 L146 131 M174 125 L174 130 M188 123 L188 129 M216 118 L216 124 M230 115 L230 120";
  return (
    <g>
      <path d={POSTS} {...wood} strokeWidth="3" />
      <path d={deck} {...wood} strokeWidth="4" />
      <path d={deck} fill="none" {...thinInk} />
      <path d={planks} {...wood} strokeWidth="2.5" />
      <path d={state === "mended" ? "M56 98 Q156 106 256 96" : "M56 98 Q156 124 256 96"} fill="none" stroke="var(--color-stone)" strokeWidth="1.2" />
    </g>
  );
}

/**
 * The raven, perched on the sill: the Baron's messenger, and well aware of it.
 * A ruffled crest, a heavy-lidded amber eye that blinks, and the Baron's red
 * ribbon with a gold seal at its throat.
 */
function Raven() {
  return (
    <g>
      <path d="M262 146 L284 156 L282 150 L290 152 L272 140 Z" fill="var(--color-ink)" {...ink} />
      <path d="M206 146 C198 128 206 108 226 104 C246 102 262 116 266 140 L262 146 Z" fill="var(--color-ink)" {...ink} />
      <path d="M222 118 C236 116 250 126 256 140" fill="none" stroke="var(--color-plum-light)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M230 124 C240 124 248 132 252 142" fill="none" stroke="var(--color-plum-light)" strokeWidth="1" strokeLinecap="round" />
      <path d="M238 132 C244 134 248 138 250 144" fill="none" stroke="var(--color-plum-light)" strokeWidth="0.8" strokeLinecap="round" />
      {/* A ruffled crest */}
      <path d="M214 90 C214 84 218 80 223 80 C220 83 220 86 221 88 C222 84 226 82 230 83 C226 85 224 89 224 93 Z" fill="var(--color-ink)" {...ink} />
      <circle cx="214" cy="100" r="11" fill="var(--color-ink)" {...ink} />
      <path d="M219 93 C222 95 223 98 222 101" fill="none" stroke="var(--color-plum-light)" strokeWidth="1" strokeLinecap="round" />
      {/* The eye: amber, half lidded, and it blinks */}
      <g className={styles.blink} style={{ transformOrigin: "209px 97.5px", ...vars({ d: "-1.2s" }) }}>
        <circle cx="209" cy="97.5" r="3.1" fill="var(--color-amber)" />
        <circle cx="208.4" cy="97.9" r="1.4" fill="var(--color-ink)" />
        <circle cx="209.6" cy="96.9" r="0.6" fill="#fff8ec" />
        <path d="M205.6 96.6 Q209 93.2 212.6 96.6 Q209 95.4 205.6 96.6 Z" fill="var(--color-ink)" />
      </g>
      <path d="M205.2 95.2 Q209.2 92.6 213 95.4" fill="none" stroke="var(--color-stone)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M204 99 L186 104 L204 105 Z" fill="var(--color-stone)" {...thinInk} />
      <path d="M195 102.4 L201 101.4" {...thinInk} strokeWidth={0.6} />
      {/* The Baron's ribbon and seal */}
      <path d="M207 109 Q216 115 225 110" fill="none" stroke="var(--color-leaf-red)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M214 113 L211 121 L214.6 119.4 L216.6 122 L217.4 113 Z" fill="var(--color-leaf-red)" {...thinInk} strokeWidth={0.6} />
      <circle cx="215.6" cy="113" r="2.6" fill="var(--color-leaf-gold)" {...thinInk} />
      <path d="M220 146 V150 L216 152 M220 150 L224 152 M238 146 V150 L234 152 M238 150 L242 152" {...thinInk} stroke="var(--color-stone)" strokeWidth={1.2} />
    </g>
  );
}

/**
 * The keeper's window over the river. Before the choice: the raven flies in
 * and lands on the sill with the Baron's letter, and the bridge sags beyond.
 * After: the bridge mended with a cart crossing, mended with no word from the
 * Baron, or broken under his new statue while the pumpkins float away.
 */
export function BaronsRaven({ outcome, thinking }: SceneProps) {
  const bridge = !outcome ? "sagging" : outcome === "poor" ? "broken" : "mended";

  return (
    <g>
      {/* The view: hills, a misty river and the bridge */}
      <Sky horizon={96} tint="var(--place-river)" />
      <Moon x={70} y={36} r={10} />
      <path d="M0 96 C50 82 90 90 130 86 S220 76 260 86 S300 92 320 88 V180 H0 Z" fill="var(--color-plum-light)" opacity="0.8" />
      {/* The Baron's statue, built first */}
      {outcome === "poor" && (
        <Appear rise delay={0.3}>
          <rect x="106" y="80" width="20" height="8" fill="var(--color-stone)" {...ink} />
          <path d="M109 80 C108 66 111 60 116 58 C121 60 124 66 123 80 Z" fill="var(--color-stone)" {...ink} />
          <circle cx="116" cy="53" r="5" fill="var(--color-stone)" {...ink} />
          <path d="M111 49 l2 -5 l3 4 l3 -4 l2 5 Z" fill="var(--color-leaf-gold)" {...thinInk} />
          <path d="M123 68 L132 60" {...ink} stroke="var(--color-stone)" strokeWidth={3} />
        </Appear>
      )}
      <path d="M0 108 C60 100 120 106 180 102 S280 100 320 106 V180 H0 Z" fill="var(--color-plum)" />
      <path d="M0 118 C80 112 200 116 320 114 V150 C220 154 100 150 0 154 Z" fill="var(--color-stone)" opacity="0.55" />
      <path d="M30 128 H60 M90 136 H130 M170 130 H200 M230 140 H270 M50 146 H80" stroke="var(--color-mist)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <Fog y={116} opacity={0.24} amp={4} />

      <Bridge state={bridge} />
      {/* The harvest carts cross again */}
      {outcome === "wise" && (
        <g className={styles.cross}>
          <Cart x={222} y={109} s={0.8} load />
        </g>
      )}
      {/* The harvest, floating downstream */}
      {outcome === "poor" &&
        [
          [150, 140, 0],
          [176, 146, 2.3],
          [128, 144, 4.6],
        ].map(([x, y, d]) => (
          <g key={x} className={styles.float} style={vars({ d: `${d}s` })}>
            <Pumpkin x={x!} y={y!} s={0.5} />
          </g>
        ))}
      <Fog y={132} opacity={0.3} amp={5} />

      {/* The raven in flight, on its way to the sill */}
      {!outcome && (
        <g className={styles.fly}>
          <ellipse cx="226" cy="112" rx="9" ry="4" fill="var(--color-ink)" />
          <path d="M218 111 L212 114 L218 113 Z" fill="var(--color-stone)" />
          <path className={styles.flap} style={{ transformOrigin: "226px 112px" }} d="M208 112 Q217 96 226 110 Q235 96 246 112 Q235 106 226 114 Q217 106 208 112 Z" fill="var(--color-ink)" />
        </g>
      )}

      {/* The room around the window, and the sill */}
      <path d="M0 0 H320 V180 H0 Z M28 12 V146 H292 V12 Z" fillRule="evenodd" fill="var(--color-plum)" />
      <rect x="28" y="12" width="264" height="134" fill="none" stroke="var(--color-ember)" strokeWidth="5" />
      <rect x="28" y="12" width="264" height="134" fill="none" {...thinInk} />
      <path d="M160 12 V146" stroke="var(--color-ember)" strokeWidth="3" />
      <path d="M16 146 H304 V158 H16 Z" fill="var(--color-ember)" {...ink} />
      <path d="M22 158 H298 V164 H22 Z" fill="var(--color-ink)" />

      {/* The raven on the sill. It stays away when it is sent back with a bare "no". */}
      {outcome !== "muddled" && (
        <g className={outcome ? undefined : styles.land}>
          <Raven />
          {/* The sealed letter in its beak, then a shorter note */}
          {!outcome && (
            <g transform="rotate(-10 176 108)">
              <rect x="160" y="100" width="30" height="20" rx="1.5" fill="var(--color-parchment)" {...ink} />
              <path d="M160 100 L175 112 L190 100" fill="none" {...thinInk} />
              <circle cx="175" cy="112" r="4" fill="var(--color-leaf-red)" {...thinInk} />
            </g>
          )}
          {outcome === "wise" && (
            <Appear delay={0.6}>
              <rect x="170" y="100" width="18" height="11" rx="1" fill="var(--color-parchment)" {...ink} transform="rotate(-10 179 105)" />
            </Appear>
          )}
        </g>
      )}
      {outcome === "muddled" && (
        <Appear delay={0.4}>
          <path d="M226 145 C236 138 248 138 258 142 C248 142 238 144 226 145 Z" fill="var(--color-ink)" stroke="var(--color-plum-light)" strokeWidth="0.8" />
        </Appear>
      )}

      <Leaf x={110} y={152} rot={-60} s={1.1} color="var(--color-leaf-gold)" />
      <Leaf x={110} y={40} rot={20} s={0.9} color="var(--color-pumpkin)" />

      {/* The keeper, close to us, at their own window */}
      <Keeper x={52} y={204} s={2.3} from={-50} thinking={thinking} />
    </g>
  );
}
