import React, { useEffect, useRef, useState } from 'react'
import './Main.css'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Composants/Sidebar/Sidebar'
import { useUserStore } from './store/useUserStore'
import { useAuthentification } from './hooks/useAuthentification'
import Nav from './Composants/Nav/Nav'

export default function Main() {
  const location = useLocation()

  const { user, setUser } = useUserStore()
  const [isMaximize, setIsMaximize] = useState(false)

  const {getUser} = useAuthentification()

  const ref_bloc_main = useRef(null);
  const ref_nav = useRef(null);


  const maximize_or_minimize = () => {
    ref_bloc_main.current.classList.toggle('maximize')
    ref_nav.current.classList.toggle('maximize');

  }

  useEffect(() => {
    getUser(setUser)
  },[location.pathname])


  return (
    <>
      {
        user ?
          <section id='main' className='bg-gray-100'>

            <Nav ref_nav={ref_nav}/>

            <Sidebar setIsMaximize={setIsMaximize} maximize_or_minimize={maximize_or_minimize}/>

            <div className='body bg-gray-100 p-2' ref={ref_bloc_main}>
              <Outlet />
            </div>

          </section>
        : null
      }
    </>
 
    
  )
}
