import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../Config/Config";
import { fetchData, paginateData } from "../../Fonction/Function";
import Alert from "../Alert/Alert";
import Pagination from "../Pagination/Pagination";
import { NavLink } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";

export default function New() {
  const user = useUserStore((state) => state.user);

  const [procedures, setProcedures] = useState(null); 
  const [procedures_copie, setProceduresCopie] = useState(null);
  const [data_paginate, setDataPaginate] = useState(null);
  const [reload_data, setReloaData] = useState(false);

  const [phases, setPhases] = useState([]);

  const [phaseId, setPhaseId] = useState("");

  const [numero, setNumero] = useState("");

  const [procedureName, setProcedureName] = useState("");

  const [docProcedure, setDocProcedure] = useState(null);

  const [docTravail, setDocTravail] = useState(null);

  const fileInputRefDocProcedure = useRef(null);
  const fileInputRefDocTravail = useRef(null);

  const [result, setResult] = useState(null);

  const recherche = useRef({
    'phase': '',
    'numero_ordre': ''
  })

  const currentPage = useRef(1);
  const itemsPerPage = useRef(3)

  // Recupérer toutes les données depuis PostgresQL vers l'API
  const loadProcedures = async (setState) => {
    fetchData(`${API_URL}/log/procedures`, {}, 'GET', setState)
  };


  // Recupérer toutes les phases depuis PostgresQL vers l'API
  const loadPhases = async () => {
    try {
      const res = await fetch(`${API_URL}/log/phases`);
      const data = await res.json();
      setPhases(data);
      // if (data.length > 0) setPhaseId(data[0].id);
    } catch (err) {
      console.error("Erreur chargement phases :", err);
    }
  };


  // Filtrer les procedures (recherche)
  const recherche_procedure = (nom, value) => {

    recherche.current[nom] = value

    const filter = procedures_copie?.filter(item => {
      if( recherche.current.phase != '' && item.nom_phase != recherche.current.phase ){
        return false
      }
      if( recherche.current.numero_ordre != '' && item.numero_orde != recherche.current.numero_ordre){
        return false
      }
      return true
    }) 

    currentPage.current = 1
    setProcedures(filter)
  }


  // Cette fonction va supprimer une procédure
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette procédure ?"
    );

    if (!confirmDelete) return; // L'utilisateur a annulé

    try {
      await fetch(
        `${API_URL}/log/procedures/${id}`, { 
          method: "DELETE" }
        )
        .then(res => {
        if(!res.ok){
          throw new Error("Erreur HTTP : " + res.status)
        }
        return res.json();
      })
      .then(response => {
        setResult(response);
      })
      .catch(error => {
        setResult(error);
      })
      loadProcedures(setProcedures);
      loadProcedures(setProceduresCopie);
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };


  useEffect(() => {
    loadProcedures(setProcedures);
    loadProcedures(setProceduresCopie);
    loadPhases();
  }, []);


    useEffect(() =>{
    if(procedures){
      paginateData(currentPage.current, itemsPerPage.current, procedures, setDataPaginate)
    }
  }, [procedures, reload_data])



  return (

    
    <div className="mx-auto p-4 px-6 shadow rounded-md">

      <p className="text-2xl font-bold my-4 text-gray-800">Gestion des Procédures</p>

      { user[0]['utilisateur__fonction'].toLowerCase() != 'auditeur' && (<div className="my-2">
        <NavLink to='/main/form_procedure' className='button is-primary'>
          Ajouter une procedure
        </NavLink>
      </div>) }

      {/* Formulaire d'ajout et de modification */}
      <form className="flex items-center gap-4 mb-6">

        <div className="mx-2">
          <p className="font-bold text-xl">Rechercher des procédures : </p>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Phase</label>
          <select
            value={recherche.current.phase}
            onChange={(e) => recherche_procedure('phase', e.target.value)}
            required
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>------</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.nom_phase}>{phase.nom_phase}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Numéro d'ordre</label>
          <input
            type="number"
            placeholder="Numéro"
            value={recherche.current.numero_ordre}
            onChange={(e) => recherche_procedure('numero_ordre', e.target.value)}
            required
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>


      </form>

      {/* Tableau des procédures */}
      <div className="overflow-x-auto">

          {
            result ?
                result['succes'] ?
                    <Alert message={result['succes']} bgColor={'has-background-success'} icon={'fas fa-check'} setResult={setResult}/>
                : null
            : null
          }

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Phase</th>
              <th className="border p-2 text-left">N° d'ordre</th>
              <th className="border p-2 text-left">Procédure</th>
              <th className="border p-2 text-left">Document procédure</th>
              <th className="border p-2 text-left">Document travail validé</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data_paginate && data_paginate.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border p-2">{p.nom_phase || "N/A"}</td>
                <td className="border p-2">{p.numero_orde}</td>
                <td className="border p-2">{p.procedure || "N/A"}</td>
                <td className="border p-2">
                  {p.document_procedure ? (
                    <a
                      href={`${API_URL}/procedures/${p.id}/download_procedure/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Télécharger
                    </a>
                  ) : (
                    "Manquant"
                  )}
                </td>
                <td className="border p-2">
                  {p.document_travail_valide ? (
                    <a
                      href={`${API_URL}/procedures/${p.id}/download_travail/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Télécharger
                    </a>
                  ) : (
                    "Manquant"
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={procedures} reload={reload_data} setReload={setReloaData} description="page" />  

      </div>
    </div>
  );
}

