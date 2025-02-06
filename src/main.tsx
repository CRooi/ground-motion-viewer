import ReactDOM from 'react-dom/client'
import App from './App'
import './global.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import File from './pages/file'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/file' element={<File />} />
        </Routes>
    </BrowserRouter>
)