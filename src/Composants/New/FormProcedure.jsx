import React, { useEffect, useRef, useState } from 'react'
import { API_URL } from '../../Config/Config';
import { fetchData } from '../../Fonction/Function';
import Alert from '../Alert/Alert';

export default function FormProcedure() {

  const [procedures, setProcedures] = useState(null); 

  const [phases, setPhases] = useState([]);
  const [phaseId, setPhaseId] = useState("");

  const [numero, setNumero] = useState("");

  const [procedureName, setProcedureName] = useState("");

  const [docProcedure, setDocProcedure] = useState(null);

  const [docTravail, setDocTravail] = useState(null);

  const fileInputRefDocProcedure = useRef(null);
  const fileInputRefDocTravail = useRef(null);

  const [result, setResult] = useState(null);


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


  // Recupérer toutes les données depuis PostgresQL vers l'API
  const loadProcedures = async () => {
    fetchData(`${API_URL}/log/procedures`, {}, 'GET', setProcedures)
  };


  // Cette fonction va créer ou modifier le procédure (selon la phase et le numéro d'ordre de la procédure)
  const handleCreateOrUpdate = async (e) => {

    e.preventDefault();
    const formData = new FormData();
    formData.append("phase_id", phaseId);
    formData.append("numero_orde", numero);
    formData.append("procedure", procedureName);
    formData.append("document_procedure", docProcedure);
    formData.append("document_travail_valide", docTravail);
    console.log('doc travail', docTravail);

    try {
      // Cherche si la procédure existe déjà (même phase_id et numero_orde)
      const existing = procedures.find(
        (p) => p.phase_id === parseInt(phaseId) && p.numero_orde === parseInt(numero)
      );
      const url = existing
        ? `${API_URL}/log/procedures/${existing.id}`
        : `${API_URL}/log/procedures`;
      const method = existing ? "PUT" : "POST";

      await fetch(url, { 
        method, 
        body: formData
      })
      .then(res => {
        if(!res.ok){
          throw new Error("Erreur HTTP : " + res.status)
        }
        return res.json();
      })
      .then(response => {
        setResult(response);
         // // Reset formulaire
        setNumero("");
        setPhaseId("");
        setProcedureName("");
        setDocProcedure(null);
        setDocTravail(null);
      })
      .catch(error => {
        setResult(error);
      })

     
      if (fileInputRefDocProcedure.current) {
        fileInputRefDocProcedure.current.value = "";
      }
      if (fileInputRefDocTravail.current) {
        fileInputRefDocTravail.current.value = "";
      }
      loadProcedures();
    } catch (err) {
      console.error("Erreur création/mise à jour :", err);
    }
  };


  useEffect(() => {
    loadPhases()
    loadProcedures()
  }, []) 
  
  
  // useEffect(() => {
  //   if(result){
  //     if(result['succes']){

  //     }
  //   }
  // }, [result])



  return (
    <div className='px-6 py-1'>
      <p className='my-2 text-xl font-bold'>Formulaire de procédure</p>
      {/* Formulaire d'ajout et de modification */}
      <form onSubmit={handleCreateOrUpdate} className="my-2">

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Phase</label>
          <select
            value={phaseId}
            onChange={(e) => setPhaseId(e.target.value)}
            required
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>------</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>{phase.nom_phase}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Numéro d'ordre</label>
          <input
            type="number"
            placeholder="Numéro"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Procédure</label>
          <input
            type="text"
            placeholder="Nom de la procédure"
            value={procedureName}
            onChange={(e) => setProcedureName(e.target.value)}
            required
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Document procédure</label>
          <input
            type="file"
            ref={fileInputRefDocProcedure}
            onChange={(e) => setDocProcedure(e.target.files[0])}
            className="border rounded-md p-1"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-1">Document travail validé</label>
          <input
            type="file"
            ref={fileInputRefDocTravail}
            onChange={(e) => setDocTravail(e.target.files[0])}
            className="border rounded-md p-1"
          />
        </div>


          <div className='my-2'>
            {
              result ?
                  result['succes'] ?
                      <Alert message={result['succes']} bgColor={'has-background-success'} icon={'fas fa-check'} setResult={setResult}/>
                  : null
              : null
            }
          </div>

        <div className="md:col-span-5 flex justify-end my-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Ajouter / Mettre à jour
          </button>
        </div>
      </form>
    </div>
  )
}
