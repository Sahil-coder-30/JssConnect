import '../styles/main.scss'
import Register from '../features/auth/components/Register'
import Login from '../features/auth/components/Login'
import DeveloperLogin from '../features/auth/components/DeveloperLogin'
import DeveloperRegister from '../features/auth/components/DeveloperRegister'
import StaffRegister from '../features/auth/components/StaffRegister'
import SetPassword from '../features/auth/components/SetPassword'
import VerifyOtp from '../features/auth/components/VerifyOtp'
import { Routes , Route } from 'react-router-dom'

const App = () => {
  return (
    <>
     <Routes>
      <Route path='/login' element = {<Login/>}/>
      <Route path='/register' element = {<Register/>}/>
      <Route path='/verify-otp' element={<VerifyOtp />} />
      <Route path='/set-password' element={<SetPassword />} />
      <Route path='/developer' element = {<DeveloperLogin/>}/>
      <Route path='/developer-secret-register' element = {<DeveloperRegister/>}/>
      <Route path='/staff-register' element = {<StaffRegister/>}/>
     </Routes>
    </>
  )
}

export default App
