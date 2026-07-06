const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
)

export const BookIcon = () => (
  <svg {...base}>
    <path d="M12 6.5C10 4.8 7 4.5 4 5v14c3-.5 6 -.2 8 1.5 2-1.7 5-2 8-1.5V5c-3-.5-6-.2-8 1.5Z" />
    <path d="M12 6.5V20.5" />
  </svg>
)

export const QuillIcon = () => (
  <svg {...base}>
    <path d="M20 4c-6 0-12 4-14 12l-2 4 4-2c8-2 12-8 12-14Z" />
    <path d="M6 16c3-4 7-7 10-8" />
  </svg>
)

export const UsersIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19c.7-3.2 2.9-5 5.5-5s4.8 1.8 5.5 5" />
    <circle cx="16.5" cy="9.5" r="2.4" />
    <path d="M16 14.2c2.3.2 4 1.8 4.5 4.3" />
  </svg>
)

export const GearIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.5h4l.4-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2Z" />
  </svg>
)

export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
