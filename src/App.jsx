import { useState } from 'react'
import ArabicWordle from './components/ArabicWordle'

function App() {
  const [count, setCount] = useState(0)

  return (
<ArabicWordle/>
  )
}

export default App
