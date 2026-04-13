import { Check } from "lucide-react"

type StepBallTypes = {
  number: number
  step: {
    active: boolean
    completed: boolean
  }
}

function StepBall({ number, step }: StepBallTypes) {
  return (
    <li>
      <button
        className={`
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold
          ${step.active ? "bg-[#FFA726] text-white" : "bg-[#F5F0EB] text-[#8C7B6B]"}
          ${step.completed && "bg-[#FFD29A] text-[#FFA726]"}
        `}
      >
        {step.completed ? <Check /> : <span>{number}</span>}
      </button>
    </li>
  )
}

function LineStep({ completed }: { completed: boolean }) {
  return (
    <li
      className={`
          w-16 sm:w-24 md:w-32 h-0.5 mx-2
          ${completed ? "bg-[#FFA726]" : "bg-[#8C7B6B]"}
        `}
    />
  )
}

export { StepBall, LineStep }
