import React, { useState } from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

export default function Sidebar({maximize_or_minimize}) {

  const user = useUserStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      id="sidebar"
      style={{
        width: collapsed ? '60px' : '240px', // Réduit la sidebar
        transition: 'width 0.3s',
      }}
    >
      {/* Bouton pour rétracter/ouvrir la sidebar */}
      <div
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '0.5rem',
          cursor: 'pointer',
        }}
        onClick={() => { setCollapsed(!collapsed); maximize_or_minimize() } }
      >
        <i
          className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}
          style={{ color: 'white' }}
        ></i>

      </div>

      <nav className='nav has-shadow'></nav>

      <div className='container'>
        <div className='nav-left'></div>
        {!collapsed && <a className="nav-item">Manipulation de document</a>}
      </div>

      <ul className="menu">

        <li>
          <NavLink to='/main/new'>
            <i className='fas fa-file-alt'></i>
            {!collapsed && 'Document d\'audit'}
          </NavLink>
        </li>

        
        <li>
          <NavLink to='/main/accueil'>
            <i className='fas fa-chart-line'></i>
            {!collapsed && 'Suivi des pièces'}
          </NavLink>
        </li>
        

        <li>
          <NavLink to="./enregistrer">
            <i className="fas fa-save"></i>
            {!collapsed && 'Liste des documents'}
          </NavLink>
        </li>

        <li>
          <NavLink to="./archivage">
            <i className="fas fa-file-archive"></i>
            {!collapsed && 'Archivage des documents'}
          </NavLink>
        </li>

        <li>
          <NavLink to="./Verification">
            <i className="fas fa-folder-open"></i>
             {!collapsed && 'Correspondence des documents'}
          </NavLink>
        </li>

    

        <li>
          <NavLink to="/main/journaux">
            <i className="fas fa-tractor"></i>
            {!collapsed && 'Traçabilité'}
          </NavLink>
        </li>
      </ul>
    </div>
  );
}














// import React, { useEffect, useState } from 'react'
// import './Sidebar.css'
// import { NavLink } from 'react-router-dom'
// import { useUserStore } from '../../store/useUserStore';

// export default function Sidebar() {
//   const user = useUserStore((state) => state.user);

//   return (
//     <div id='sidebar'>
                                                        

//       <nav className='nav has-shadow'></nav>

//       <div className='container'>
//         <div className='nav-left'></div>
//         <a className="nav-item"> Manipulation de document</a>
//       </div>
     
//       <ul className="menu">

//         <li>
//           <NavLink to='/main/new'>
//             <i className='fas fa-home'></i>
//              Document d'audit
//             </NavLink>
//         </li>
     
//         {
//           user && user[0]['utilisateur__fonction'].toUpperCase() == 'auditeur'.toUpperCase() ?
//             <li>
//               <NavLink to='/main/accueil'>
//                 <i className='fas fa-home'></i>
//                   Suivi des pièces
//                 </NavLink>
//             </li>
//           : null
//         }

//         <li>
//           <NavLink to="./enregistrer">
//             <i className="fas fa-save"></i>
//            Liste des documents
//           </NavLink>
//         </li>

//         {/* <li>
//           <NavLink to="./recherche">
//             <i className="fas fa-search"></i>
//             Recherche des documents
//            </NavLink>
//         </li> */}

//         {/* <li>
//           <NavLink to="./versionning">
//             <i className="fas fa-code-branch"></i> 
//            Versionning
//            </NavLink>
//         </li> */}

//         <li>
//           <NavLink to="./archivage">
//             <i className="fas fa-file-archive"></i> 
//             Archivage des fichiers
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="./Verification signature">
//             <i className="fas fa-file-signature"></i>
//               verification signature
//           </NavLink>
//         </li>


//         <li>
//           <NavLink to="/main/journaux">
//             <i className="fas fa-tractor"></i>
//              Traçabilité 
//           </NavLink>
//         </li>
//       </ul>


   
//     </div>
//   )
// }
