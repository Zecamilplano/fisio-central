type EvolutionIconProps = {
  hasEvolution?: boolean
  onclick: () => void
}

export default function EvolutionIcon({
  hasEvolution,
  onclick,
}: EvolutionIconProps) {
  const label = hasEvolution ? "Visualizar evolução" : "Adicionar evolução"

  return (
    <button
      type="button"
      onClick={onclick}
      title={label}
      className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="20"
        height="20"
        role="img"
        aria-labelledby="title desc"
        className={` transition-all duration-200
          ${hasEvolution ? "opacity-100" : "grayscale opacity-45 hover:opacity-70"}
        `}
      >
        <title id="title">
          {hasEvolution ? "Visualizar evolução" : "Registrar evolução"}
        </title>
        <desc id="desc">
          Ícone vetorial de uma prancheta com três itens marcados e um lápis
          amarelo sobreposto.
        </desc>
        <rect x="8" y="42" width="376" height="460" rx="27" fill="#D48149" />
        <rect x="43" y="76" width="306" height="392" fill="#EEF3F5" />
        <path
          d="M122 34h41c4-21 20-34 40-34s36 13 40 34h41c8 0 14 6 14 14v37c0 8-6 14-14 14H122c-8 0-14-6-14-14V48c0-8 6-14 14-14Z"
          fill="#9AAEAE"
        />
        <rect x="78" y="117" width="77" height="77" rx="11" fill="#D7DDDB" />
        <rect x="78" y="236" width="77" height="77" rx="11" fill="#D7DDDB" />
        <rect x="78" y="355" width="77" height="77" rx="11" fill="#D7DDDB" />
        <path
          d="M104 154l14 14 43-43"
          fill="none"
          stroke="#00C66B"
          stroke-width="18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M104 273l14 14 43-43"
          fill="none"
          stroke="#00C66B"
          stroke-width="18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M104 392l14 14 43-43"
          fill="none"
          stroke="#00C66B"
          stroke-width="18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect x="188" y="125" width="128" height="17" rx="9" fill="#3E5D6D" />
        <rect x="188" y="168" width="77" height="17" rx="9" fill="#3E5D6D" />
        <rect x="188" y="244" width="128" height="17" rx="9" fill="#3E5D6D" />
        <rect x="188" y="287" width="77" height="17" rx="9" fill="#3E5D6D" />
        <rect x="188" y="363" width="128" height="17" rx="9" fill="#3E5D6D" />
        <rect x="188" y="406" width="77" height="17" rx="9" fill="#3E5D6D" />
        <g transform="rotate(-45 372 350)">
          <path d="M236 328h49v70h-49l-24-35Z" fill="#FFF4AF" />
          <path d="M212 363l24-14v28Z" fill="#E9D873" />
          <rect x="277" y="328" width="176" height="70" fill="#FFD100" />
          <rect
            x="277"
            y="328"
            width="176"
            height="20"
            fill="#FFE242"
            opacity=".45"
          />
          <polygon
            points="236,328 277,328 277,398 236,398 249,363"
            fill="#FFB000"
          />
          <rect x="453" y="328" width="45" height="70" fill="#9EAFB0" />
          <path
            d="M498 328h22c18 0 32 14 32 32v6c0 18-14 32-32 32h-22Z"
            fill="#FF6970"
          />
        </g>
      </svg>{" "}
    </button>
  )
}
