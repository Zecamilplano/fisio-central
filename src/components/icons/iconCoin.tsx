export default function IconCoin({ className }: { className: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 680 680"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="340"
        cy="340"
        r="300"
        fill="none"
        stroke="currentColor"
        stroke-width="22"
      />
      <text
        x="340"
        y="420"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-weight="900"
        font-size="280"
        fill="currentColor"
        letter-spacing="-10"
      >
        R$
      </text>
    </svg>
  )
}
