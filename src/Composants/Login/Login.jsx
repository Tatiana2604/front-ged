import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentification } from '../../hooks/useAuthentification';
import './Login.css';

export default function Login() {
  const Navigate = useNavigate();

  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const { login } = useAuthentification();

  const handleLogin = (e) => {
    e.preventDefault();
    alert('connexion réussi');
    Navigate("/accueil");
  };


  useEffect(() => {
    const original_title = document.title
    document.title = 'Login'
    return () => {
      document.title = original_title
    }

  }, [])


  return (
    <div id="login" className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4">

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl grid md:grid-cols-2">
        
        {/* Section formulaire */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">S'authentifier</h2>
          
          <form
            onSubmit={(e) => {
              setResult(null);
              login(e, identifiant, password, setIsSubmitting, setResult);
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Identifiant</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Entrer votre identifiant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrer votre mot de passe"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>

            {result && (
              <p className="text-center text-red-500 text-sm mt-2">{result}</p>
            )}
          </form>
        </div>

        {/* Section droite */}
        <div className="hidden md:flex bg-gradient-to-br from-green-500 to-green-800 text-white flex-col items-center justify-center p-10">
          <h3 className="text-4xl font-bold mb-3">BIENVENUE</h3>
          <p className="text-center text-gray-100 text-lg">
            Heureux de vous revoir<br />
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>
      </div>
      
    </div>
  );
}
