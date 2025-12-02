import React, { useEffect, useRef, useState } from "react";
import { fetchData, paginateData } from "../../Fonction/Function";
import { API_URL } from "../../Config/Config";
import { useUserStore } from "../../store/useUserStore";
import Pagination from "../Pagination/Pagination";

export default function PiecesStatus() {
  const user = useUserStore((state) => state.user);

  const [postes, setPostes] = useState([]);
  const [posteId, setPosteId] = useState("");
  const [piecesOptions, setPiecesOptions] = useState([]);
  const [periode, setPeriode] = useState("");
  const [mois, setMois] = useState("");
  const [exercice, setExercice] = useState("");
  const [pieces, setPieces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtrer_documents, setFiltrer_documents] = useState("");
  const [recherche, setRecherche] = useState("");

  const [data_paginate, setDataPaginate] = useState(null);
  const [reload_data, setReloaData] = useState(false);

  const currentPage = useRef(1);
  const itemsPerPage = useRef(4);

  // ➕ États pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    arrived: 0,
    percentage: 0,
  });


  const obtenir_liste_poste_comptables = () => {


    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_tous_les_postes_comptables', 'fonction': user[0]['utilisateur__fonction'],'user_id': user[0]['id']}, 'post', setPostes)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables_zone', 'zone': user[0]['utilisateur__zone__id']}, 'post', setPostes)
    }
    else{
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables', 'user_id': user[0]['id']}, 'post', setPostes)
    }

  }



  const rechercherPieces = async (e) => {
    currentPage.current = 1;
    e.preventDefault();
    if (!posteId) {
      alert("Veuillez choisir un poste comptable");
      return;
    }


    // 🔹 Réinitialiser les données avant la nouvelle recherche
    setPieces([]);
    setLoading(true);

    const payload = { poste_comptable: posteId, mois, exercice };
    if (periode) payload.periode = periode;

      await fetchData(`${API_URL}/data/pieces/status`, payload, "post", (data) => {
      setPieces(data);

      // 🔹 Calcul des statistiques une fois les données récupérées
      let totalPieces = 0;
      let totalArrived = 0;

      data.forEach((piece) => {
        // Si décadaire → 3 lignes
        if (piece.periode?.toLowerCase() === "decadaire") {
          totalPieces += 3;
          totalArrived += piece.arrived.filter((a) => a).length;
        } else {
          totalPieces += 1;
          if (piece.arrived[0]) totalArrived += 1;
        }
      });

      const percentage =
        totalPieces > 0 ? ((totalArrived / totalPieces) * 100).toFixed(2) : 0;

      setStats({
        total: totalPieces,
        arrived: totalArrived,
        percentage,
      });
    });

    setLoading(false);
  };


  // Générer les lignes pour le tableau selon la période et décades
  const RenderPieceRows = ({piece}) => {
    if (piece.periode?.toLowerCase() === "decadaire") {
      const decades = [0, 1, 2];
      return decades.map((idx) => {
        const docsInDecade = piece.documents[idx] || [];
        const arrived = piece.arrived[idx] || false;
        const late = piece.late[idx] || false;

        return (
          <tr className={late ? "bg-red-50" : ""}>
            <td className="p-2 border">{piece.nom_piece} (Décade {idx + 1})</td>
            <td className="p-2 border">{piece.periode}</td>
            <td
              className={`p-2 text-center border font-semibold ${
                arrived ? "text-green-600" : "text-red-600"
              }`}
            >
              {arrived ? "✅ Arrivée" : "❌ Non arrivée"}
              {late ? " ⏰ Retard" : ""}
            </td>
            <td className="p-2 border">
              {docsInDecade.length > 0 ? (
                <ul className="list-disc list-inside">
                  {docsInDecade.map((doc) => (
                    <li key={doc.id}>
                      {doc.nom_fichier} —{" "}
                      <span className="text-gray-600">{doc.date_arrivee}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">Aucun document</span>
              )}
            </td>
          </tr>
        );
      });
    }

    // Pièce mensuelle ou autre
    const arrived = piece.arrived[0] || false;
    const late = piece.late[0] || false;
    const docs = piece.documents[0] || [];

    return (
      <tr key={piece.id}>
        <td className="p-2 border">{piece.nom_piece}</td>
        <td className="p-2 border">{piece.periode || "-"}</td>
        <td
          className={`p-2 text-center border font-semibold ${
            arrived ? "text-green-600" : "text-red-600"
          }`}
        >
          {arrived ? "✅ Arrivée" : "❌ Non arrivée"}
          {late ? " ⏰ Retard" : ""}
        </td>
        <td className="p-2 border">
          {docs.length > 0 ? (
            <ul className="list-disc list-inside">
              {docs.map((doc) => (
                <li key={doc.id}>
                  {doc.nom_fichier} —{" "}
                  <span className="text-gray-600">{doc.date_arrivee}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400">Aucun document</span>
          )}
        </td>
      </tr>
    );
  };


  // Charger les postes comptables
  useEffect(() => {
    obtenir_liste_poste_comptables()
  }, []);


  // Charger les pièces disponibles pour le poste sélectionné
  useEffect(() => {
    if (!posteId) {
      setPiecesOptions([]);
      setPeriode("");
      return;
    }
  }, [posteId]);


  useEffect(() =>{
    if(pieces){
      paginateData(currentPage.current, itemsPerPage.current, pieces, setDataPaginate)
    }
  }, [pieces, reload_data])


  useEffect(() => {
    console.log('pagination', data_paginate);
  }, [data_paginate])


  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">
        Suivi des pièces comptables par poste
      </h2>

      {/* Barre de recherche */}
      <div className="bg-gray-50 border p-4 rounded-xl shadow-sm mb-6">

        <form onSubmit={rechercherPieces}>
          {/* <div className="grid grid-cols-5 gap-4"> */}
          <div className="flex items-center justify-center gap-4">

            {/* Poste comptable */}
            <div>
              <label className="block text-sm font-medium">Poste comptable</label>
              <input
              list="poste_comptable"
                className="border p-2 rounded w-full"
                value={posteId}
                onChange={(e) => setPosteId(e.target.value)}
                required
              />
              <datalist id="poste_comptable">
                {postes.map((p) => (
                  <option key={p.id} value={p.nom_poste} />
                ))}
              </datalist>
              
            </div>

            {/* Periode */}
            <div>
              <label className="block text-sm font-medium">Periode</label>
              <select
                className="border p-2 rounded w-full"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                required
              >
                <option value="">-- Toutes les periodes --</option>
                <option value="Journalière">Journalière</option>
                <option value="Mensuelle">Mensuelle</option>
                <option value="Décadaire">Décadaire</option>
              </select>
            </div>

            {/* Mois */}
            <div>
              <label className="block text-sm font-medium">Mois</label>
              <select
                className="border p-2 rounded w-full"
                value={mois}
                onChange={(e) => setMois(e.target.value)}
                required
              >
                <option value="" disabled>
                  Mois
                </option>
                <option value="01">Janvier</option>
                <option value="02">Février</option>
                <option value="03">Mars</option>
                <option value="04">Avril</option>
                <option value="05">Mai</option>
                <option value="06">Juin</option>
                <option value="07">Juillet</option>
                <option value="08">Août</option>
                <option value="09">Septembre</option>
                <option value="10">Octobre</option>
                <option value="11">Novembre</option>
                <option value="12">Décembre</option>
              </select>
            </div>

            {/* Exercice */}
            <div>
              <label className="block text-sm font-medium">Exercice</label>
              <select
                className="w-full bg-white p-2 rounded-sm border border-gray-300"
                value={exercice}
                onChange={(e) => setExercice(e.target.value)}
                required
              >
                <option value="">------</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Suivre
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ➕ Statistiques globales */}
      {pieces?.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-gray-700 font-medium text-lg">
            📊 <strong>Total pièces :</strong> {stats.total} &nbsp; | &nbsp;
            <strong>Arrivées :</strong> {stats.arrived} &nbsp; | &nbsp;
            <strong>Pourcentage :</strong> {stats.percentage}%
          </p>
        </div>
      )}

      {/* Résultats */}
      {loading ? (
        <p>Chargement...</p>
      ) : pieces?.length === 0 ? (
        <p>Aucune donnée à afficher</p>
      ) : (
        <>

        <table className="w-full border border-gray-300 rounded-xl shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left border">Nom de la pièce</th>
              <th className="p-2 text-left border">Période</th>
              <th className="p-2 text-center border">Statut</th>
              <th className="p-2 text-left border">Documents disponibles</th>
            </tr>
          </thead>
          <tbody>
            {
              data_paginate ?
                data_paginate.map((piece, index) => (
                  <RenderPieceRows key={index} piece={piece}/>
                ))
                
              : null
            }
          </tbody>
        </table>

        <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={pieces} reload={reload_data} setReload={setReloaData} description="page" />  

        </>
      )}


    </div>
  );
}


