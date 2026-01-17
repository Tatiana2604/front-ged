import React from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStore'

export default function PrivateRoute() {
    const user = useUserStore((state) => state.user);
    const location = useLocation();

    if(user[0]['utilisateur__fonction'].toLowerCase() == "auditeur" && location.pathname == "/main/form_procedure") return <Navigate to="/acces_denied" />
    
    if(user[0]['utilisateur__fonction'].toLowerCase() != "auditeur" && location.pathname == "/main/ajouter_document") return <Navigate to="/acces_denied" />

  return (
    <Outlet />
  )
}
