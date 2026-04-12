import { useState, useCallback } from 'react'
import type { FileContent } from '@core/interfaces/types'
import DiffViewer from '@ui/components/diff/DiffViewer'
import '@ui/styles/variables.css'
import styles from './App.module.css'

export default function App(): JSX.Element {
  const [leftFile, setLeftFile] = useState<FileContent | null>(null)
  const [rightFile, setRightFile] = useState<FileContent | null>(null)

  const openLeft = useCallback(async () => {
    const file = await window.electronAPI?.openFile()
    if (file) setLeftFile(file)
  }, [])

  const openRight = useCallback(async () => {
    const file = await window.electronAPI?.openFile()
    if (file) setRightFile(file)
  }, [])

  return (
    <div data-theme="dark" className={styles.app}>
      <header className={styles.toolbar}>
        <span className={styles.brand}>TreeGraft</span>
        <div className={styles.toolbarActions}>
          <button className={styles.btn} onClick={() => void openLeft()}>
            Open Left
          </button>
          <button className={styles.btn} onClick={() => void openRight()}>
            Open Right
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <DiffViewer
          {...(leftFile !== null ? { leftFile } : {})}
          {...(rightFile !== null ? { rightFile } : {})}
        />
      </main>
    </div>
  )
}
