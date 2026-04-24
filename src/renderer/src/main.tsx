import './assets/main.css'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

function App() {
  useEffect(() => {
    'Running'
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.key, 'pressed')
      if (e.key === 'Escape') {
        window.electron.ipcRenderer.send('minimize-window')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  return (
    <div className="border-section">
      <input type="text" placeholder="/? 键入获取更多的提示信息" />
    </div>
  )
}
