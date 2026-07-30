import { useState } from 'react'

type ButtonProps = {
  text: string
  /** Tailwind 크기 클래스 (예: "px-5 py-3", "h-12 w-[108px]") */
  size?: string
  onClick?: () => void
  className?: string
}

export default function Button({
  text,
  size = 'px-5 py-3',
  onClick,
  className = '',
}: ButtonProps) {
  const [active, setActive] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => {
        setActive((prev) => !prev)
        onClick?.()
        // iOS 등에서 탭 후 sticky hover/focus 잔상 제거
        e.currentTarget.blur()
      }}
      className={`btn btn-default ${active ? 'btn-active' : ''} ${size} ${className}`.trim()}
    >
      {text}
    </button>
  )
}
