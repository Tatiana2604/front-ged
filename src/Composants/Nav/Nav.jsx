import React, { useRef } from 'react'
import './Nav.css'
import { NavLink } from 'react-router-dom'
import { useAuthentification } from '../../hooks/useAuthentification';
import { useUserStore } from '../../store/useUserStore';




export default function Nav({ref_nav}) {
    const user = useUserStore((state) => state.user);
    
    // const ref_nav = useRef(null);

    const show_button_menu = () =>{
        const drop = document.getElementById('drop');
        drop.classList.toggle('is-active');
    }  


    const {logout} = useAuthentification()

    

  return (
    <div className='nav_bar' ref={ref_nav}>
        <p className='has-text-centered is-size-4 has-text-white is-inline-block'>Gestion Electronique des Données (G.E.D) </p>

        {/* <div className=''> */}

            <div className='is-block dropdown container_user mt-6' id='drop' onClick={show_button_menu}>
                
                <div className='dropdown-trigger'>
                    <button className='button is-fullwidth px-2' aria-haspopup='true' aria-controls='dropdown-menu'>

                        <span className='icon mx-2'>
                            <i className='fas fa-user'></i>
                        </span>

                        {user[0]['utilisateur__fonction'] + " : " + user[0]['utilisateur__nom'] + " " + user[0]['utilisateur__prenom']}

                        <span className='mx-2 is-small'>
                            <i className='fas fa-angle-down' aria-hidden='true'></i>
                        </span>

                    </button>
                </div>

                <div className='dropdown-menu' id='dropdown-menu' role='menu'>

                    <div className='dropdown-content'>
                        <button className='dropdown-item' onClick={logout} style={{background: 'none', outline: 'none', border: 'none'}}>
                            <span className='icon mx-1'>
                                <i className='fas fa-sign-out-alt'></i>
                            </span>
                            Déconnexion
                        </button>

                    </div>

                </div>

            </div>

    </div>
    // </div>
  )
}
