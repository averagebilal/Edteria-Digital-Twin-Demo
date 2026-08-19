import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../assets'

type StageProps = {
  width?: number
  height?: number
  focalX?: number
  focalY?: number
  children: ReactNode
  className?: string
}

export default function Stage({
  width = DESIGN_WIDTH,
  height = DESIGN_HEIGHT,
  focalX = 0.5,
  focalY = 0.5,
  children,
  className = '',
}: StageProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const update = () => {
      const viewportWidth = viewport.clientWidth
      const viewportHeight = viewport.clientHeight
      const scale = Math.max(viewportWidth / width, viewportHeight / height)
      const renderedWidth = width * scale
      const renderedHeight = height * scale
      setTransform({
        scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
        x: (viewportWidth - renderedWidth) * focalX,
        y: (viewportHeight - renderedHeight) * focalY,
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [width, height, focalX, focalY])

  return (
    <div ref={viewportRef} className={`stage-viewport ${className}`.trim()}>
      <div
        className="stage-canvas"
        style={{
          width,
          height,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
