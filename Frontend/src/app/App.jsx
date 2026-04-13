import '../styles/main.scss'
import Register from '../features/auth/components/Register'
import Login from '../features/auth/components/Login'
import { Routes , Route } from 'react-router-dom'

const App = () => {
  return (
    <>
     <Routes>
      <Route path='/login' element = {<Login/>}/>
      <Route path='/register' element = {<Register/>}/>
     </Routes>
    </>
  )
}

export default App
