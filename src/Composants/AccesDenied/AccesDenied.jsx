import { NavLink, useNavigate } from "react-router-dom"

export default function AccesDenied() {
  const navigate = useNavigate()

    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <p className="text-3xl font-bold text-red-600 mb-2">
          Accès refusé
        </p>
  
        <p className="text-gray-600 text-lg max-w-md">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
  
        <button
            className="button is-link my-4"
            onClick={() => navigate('/main/accueil')}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }
  
