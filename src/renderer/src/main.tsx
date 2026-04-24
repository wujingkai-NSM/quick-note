import './assets/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="border-section">
      <input type="text" placeholder="/? 键入获取更多的提示信息" />
    </div>
  </StrictMode>
)
