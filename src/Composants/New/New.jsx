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

  const currentPage = useRef(1)
  const itemsPerPage = useRef(5)

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


//   const download_travail = (procedureId) => {
//     window.open(
//         `${API_URL}/log/procedures/${procedureId}/download_travail_valide`)
// }

const download_travail = (procedureId) => {
  window.open(
      `${API_URL}/log/procedures/${procedureId}/download_travail_valide`,
      "_blank"
  )
}


const download_procedure = (procedureId) => {
  window.open(
      `${API_URL}/log/procedures/${procedureId}/download_procedure`,
      "_blank"
  )
}





  useEffect(() => {
    const original_title = document.title
    document.title = "Liste des documents d'audits"

    loadProcedures(setProcedures);
    loadProcedures(setProceduresCopie);
    loadPhases();

    return () => {
      document.title = original_title
    }
  }, []);


    useEffect(() =>{
    if(procedures){
      paginateData(currentPage.current, itemsPerPage.current, procedures, setDataPaginate)
    }
  }, [procedures, reload_data])



  return (

    
    <div className="mx-auto">

      <p className="text-xl font-semibold my-2 p-4">Gestion des Procédures</p>

      {/* Formulaire d'ajout et de modification */}
      <form className="flex items-center gap-4 my-2 bg-white rounded-sm shadow-sm p-2">

        <div className="mx-2">
          <p className="">Rechercher des procédures : </p>
        </div>

        <div className="flex-1">
          <select
            value={recherche.current.phase}
            onChange={(e) => recherche_procedure('phase', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg shadow-lg bg-white p-2"
          >
            <option value="" disabled>------</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.nom_phase}>{phase.nom_phase}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <input
            type="number"
            placeholder="Numéro d'ordre"
            value={recherche.current.numero_ordre}
            onChange={(e) => recherche_procedure('numero_ordre', e.target.value)}
            required
            className="input"
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

        { user[0]['utilisateur__fonction'].toLowerCase() != 'auditeur' && (
          <div className="my-2">
            <NavLink to='/main/form_procedure' className='button is-primary'>
              Ajouter une procedure
            </NavLink>
          </div>
        )}

        <table className="w-full table border border-b-4 border-pink-300">

          <thead>
            <tr className="">
              <th className="border p-2 text-left">Phase</th>
              <th className="border p-2 text-left">N° d'ordre</th>
              <th className="border p-2 text-left">Procédure</th>
              <th className="border p-2 text-left">Document procédure</th>
              <th className="border p-2 text-left">Document travail validé</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {
              data_paginate ?
                data_paginate.length > 0 ?
                  data_paginate.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border p-2">{p.nom_phase || "N/A"}</td>
                      <td className="border p-2">{p.numero_orde}</td>
                      <td className="border p-2">{p.procedure || "N/A"}</td>
                      <td className="border p-2">
                        {p.document_procedure ? (
                          <button
                            className="text-blue-600 cursor-pointer duration-150 ease-in-out hover:underline"
                            onClick={() => download_procedure(p.id) }
                          >
                            Télécharger
                          </button>
                        ) : (
                          "Manquant"
                        )}
                      </td>
                      <td className="border p-2">
                        {p.document_travail_valide ? (
                          <button
                            className="text-blue-600 cursor-pointer duration-150 ease-in-out hover:underline"
                            onClick={() => download_travail(p.id)}
                          >
                            Télécharger
                          </button>
                        ) : (
                          "Manquant"
                        )}
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="button is-danger is-outlined"
                          disabled={ user[0]['utilisateur__fonction'].toLowerCase() == "auditeur" }
                        >
                          <span className="icon">
                            <i className="fas fa-trash-alt"></i>
                          </span>
                          
                        </button>
                      </td>
                    </tr>
                  ))
                : 
                  <tr>
                    <td colspan="6" className="has-text-centered">Aucune donnée à afficher</td>
                  </tr>
              : 
                <tr>
                  <td colspan="6" className="has-text-centered">En attente des données ...</td>
                </tr>
            }
          </tbody>
        </table>


        <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={procedures} reload={reload_data} setReload={setReloaData} description="page" />  

      </div>
    </div>
  );
}

