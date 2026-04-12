import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import styles from './SplitPane.module.css'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SplitPaneHandle {
  /** Scroll both panels to the given scrollTop position */
  scrollTo: (position: number) => void
  /** Current scrollTop of the left panel */
  scrollTop: () => number
}

interface SplitPaneProps {
  leftContent: ReactNode
  rightContent: ReactNode
  syncScroll: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SplitPane = forwardRef<SplitPaneHandle, SplitPaneProps>(
  ({ leftContent, rightContent, syncScroll }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const isSyncingRef = useRef(false)

    const [leftWidthPct, setLeftWidthPct] = useState(50)
    const isDraggingRef = useRef(false)

    // Expose handle for parent-driven scroll (e.g., hunk navigation)
    useImperativeHandle(ref, () => ({
      scrollTo: (position: number) => {
        if (leftRef.current) leftRef.current.scrollTop = position
        if (rightRef.current) rightRef.current.scrollTop = position
      },
      scrollTop: () => leftRef.current?.scrollTop ?? 0,
    }))

    // ---------------------------------------------------------------------------
    // Scroll sync
    // ---------------------------------------------------------------------------

    const handleLeftScroll = useCallback(() => {
      if (!syncScroll || isSyncingRef.current) return
      isSyncingRef.current = true
      if (rightRef.current && leftRef.current) {
        rightRef.current.scrollTop = leftRef.current.scrollTop
      }
      setTimeout(() => { isSyncingRef.current = false }, 50)
    }, [syncScroll])

    const handleRightScroll = useCallback(() => {
      if (!syncScroll || isSyncingRef.current) return
      isSyncingRef.current = true
      if (leftRef.current && rightRef.current) {
        leftRef.current.scrollTop = rightRef.current.scrollTop
      }
      setTimeout(() => { isSyncingRef.current = false }, 50)
    }, [syncScroll])

    // ---------------------------------------------------------------------------
    // Divider drag
    // ---------------------------------------------------------------------------

    const handleDividerMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        isDraggingRef.current = true
        const startX = e.clientX
        const startWidth = leftWidthPct
        const containerWidth = containerRef.current?.offsetWidth ?? 1

        const onMouseMove = (ev: MouseEvent) => {
          if (!isDraggingRef.current) return
          const delta = ev.clientX - startX
          const newPct = startWidth + (delta / containerWidth) * 100
          setLeftWidthPct(Math.min(80, Math.max(20, newPct)))
        }

        const onMouseUp = () => {
          isDraggingRef.current = false
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
      },
      [leftWidthPct],
    )

    // Prevent text selection while dragging
    useEffect(() => {
      const prevent = (e: Event) => {
        if (isDraggingRef.current) e.preventDefault()
      }
      window.addEventListener('selectstart', prevent)
      return () => window.removeEventListener('selectstart', prevent)
    }, [])

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <div ref={containerRef} className={styles.container}>
        <div
          ref={leftRef}
          className={styles.panel}
          style={{ width: `${leftWidthPct}%` }}
          onScroll={handleLeftScroll}
        >
          {leftContent}
        </div>

        <div
          className={styles.divider}
          onMouseDown={handleDividerMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
        />

        <div
          ref={rightRef}
          className={styles.panel}
          style={{ width: `${100 - leftWidthPct}%` }}
          onScroll={handleRightScroll}
        >
          {rightContent}
        </div>
      </div>
    )
  },
)

SplitPane.displayName = 'SplitPane'
export default SplitPane
