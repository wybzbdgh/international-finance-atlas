// Lucide 0.468.0 icon geometry, ISC license (public/licenses/ISC-Lucide.txt).
import { html } from "lit-html";
export const Sun = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-sun ${props.className || ""}"
  >
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="m19.07 4.93-1.41 1.41"></path>
  </svg>`;
export const Moon = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-moon ${props.className || ""}"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>`;
export const Menu = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-menu ${props.className || ""}"
  >
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>`;
export const Check = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-check ${props.className || ""}"
  >
    <path d="M20 6 9 17l-5-5"></path>
  </svg>`;
export const ArrowUpRight = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-up-right ${props.className || ""}"
  >
    <path d="M7 7h10v10"></path>
    <path d="M7 17 17 7"></path>
  </svg>`;
export const Plus = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-plus ${props.className || ""}"
  >
    <path d="M5 12h14"></path>
    <path d="M12 5v14"></path>
  </svg>`;
export const X = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-x ${props.className || ""}"
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>`;
export const Globe2 = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-earth ${props.className || ""}"
  >
    <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path>
    <path
      d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"
    ></path>
    <path
      d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"
    ></path>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>`;
export const Maximize2 = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-maximize-2 ${props.className || ""}"
  >
    <polyline points="15 3 21 3 21 9"></polyline>
    <polyline points="9 21 3 21 3 15"></polyline>
    <line x1="21" x2="14" y1="3" y2="10"></line>
    <line x1="3" x2="10" y1="21" y2="14"></line>
  </svg>`;
export const RotateCcw = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-rotate-ccw ${props.className || ""}"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
  </svg>`;
export const ArrowDown = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-down ${props.className || ""}"
  >
    <path d="M12 5v14"></path>
    <path d="m19 12-7 7-7-7"></path>
  </svg>`;
export const ArrowRight = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-right ${props.className || ""}"
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>`;
export const ChevronRight = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-chevron-right ${props.className || ""}"
  >
    <path d="m9 18 6-6-6-6"></path>
  </svg>`;
export const ArrowUp = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-up ${props.className || ""}"
  >
    <path d="m5 12 7-7 7 7"></path>
    <path d="M12 19V5"></path>
  </svg>`;
export const Move = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-move ${props.className || ""}"
  >
    <path d="M12 2v20"></path>
    <path d="m15 19-3 3-3-3"></path>
    <path d="m19 9 3 3-3 3"></path>
    <path d="M2 12h20"></path>
    <path d="m5 9-3 3 3 3"></path>
    <path d="m9 5 3-3 3 3"></path>
  </svg>`;
export const ArrowDownRight = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-down-right ${props.className || ""}"
  >
    <path d="m7 7 10 10"></path>
    <path d="M17 7v10H7"></path>
  </svg>`;
export const ChevronDown = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-chevron-down ${props.className || ""}"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>`;
export const Pause = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-pause ${props.className || ""}"
  >
    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
  </svg>`;
export const Play = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-play ${props.className || ""}"
  >
    <polygon points="6 3 20 12 6 21 6 3"></polygon>
  </svg>`;
export const Search = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-search ${props.className || ""}"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>`;
export const ArrowLeft = ({ size = 24, ...props } = {}) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size}
    height=${size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-arrow-left ${props.className || ""}"
  >
    <path d="m12 19-7-7 7-7"></path>
    <path d="M19 12H5"></path>
  </svg>`;
