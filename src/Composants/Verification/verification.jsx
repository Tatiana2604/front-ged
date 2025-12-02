import React, { useState, useRef, useEffect} from "react";
import { API_URL } from "../../Config/Config";
import { month_int_to_string, paginateData, fetchData, send_data } from "../../Fonction/Function";
import { useUserStore } from "../../store/useUserStore";


function Verification() {

  const user = useUserStore((state) => state.user);

  const [localFile, setLocalFile] = useState(null);

  const [result, setResult] = useState("");

  const [documents, setDocuments] = useState(null);


  const [poste_comptables, setPosteComptables] = useState([]);
  const [pieces, setPieces] = useState();

  const [poste_choisi, setPosteChoisi] = useState("")
  const [piece_choisie, setPieceChoisie] = useState("")
  const [date_arrivee, setDateArrivee] = useState("")
  const [mois, setMois] = useState("")
  const [exercice, setExercice] = useState("")

  const [documentChoisi, setDocumentChoisi] = useState(null);
  const [ligneSelect, setLigneSelect] = useState(null);

  const ref_local_file = useRef(null)


  


  const recuperer_toutes_les_pieces = () => {
    fetchData(`${API_URL}/data/piece_comptable/get`, {}, 'get', setPieces);
  }


  const recuperer_les_postes_comptables = () => {

    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_tous_les_postes_comptables', 'fonction': user[0]['utilisateur__fonction'],'user_id': user[0]['id']}, 'post', setPosteComptables)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables_zone', 'zone': user[0]['utilisateur__zone__id']}, 'post', setPosteComptables)
    }
    else{
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables', 'user_id': user[0]['id']}, 'post', setPosteComptables)
    }

  }


  const obtenir_documents_a_comparer = () => {
    fetchData(
      `${API_URL}/data/document/comparaison`,
      {
        'action' : 'recuperer_documents_a_comparer',
        'poste_comptable': poste_choisi,
        'piece': piece_choisie,
        'date_arrivee': date_arrivee,
        'mois': mois,
        'exercice': exercice
      },
      'post',
      setDocuments
    )
  }


  
  useEffect(() => {
    recuperer_toutes_les_pieces();
    recuperer_les_postes_comptables();
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localFile) return;

    const formData = new FormData();
    formData.append("local_file", localFile);
    formData.append('id_doc', documentChoisi);

    if(!documentChoisi){
      alert('Veuillez selectionné un document à comparer dans la base')
      return
    }

    const response = await fetch(`${API_URL}/data/verification`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    ref_local_file.current.value = ""
  };

  return (

    <form className="my-2" onSubmit={handleSubmit}>
      
      {/* FICHIER LOCAL EN HAUT */}
      <div className="mb-6 flex flex-col w-5/6 mx-auto">
        <label className="text-gray-700 font-medium mb-1">Fichier local</label>
        <input
          type="file"
          onChange={(e) => setLocalFile(e.target.files[0])}
          className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          required
          ref={ref_local_file}
        />
      </div>

      {/* FORMULAIRE DE RECHERCHE */}
      <div className="flex gap-6 flex-wrap items-center justify-center">

        {/* Poste comptable */}
        <div>

          <label className="label">Poste comptable</label>

          <input
            className="input"
            list="poste_comptable"
            value={poste_choisi}
            onChange={(e) => setPosteChoisi(e.target.value) }
          />

          <datalist id="poste_comptable">
            {poste_comptables?.map((item, index) => (
              <option key={index} value={item["nom_poste"]} />
            ))}
          </datalist>

        </div>

        {/* Pièces */}
        <div>
          <label className="label">Pièces</label>
          <div className="select is-fullwidth">
            <select
              value={piece_choisie}
              onChange={(e) => setPieceChoisie(e.target.value)}
            >
              <option value="">Toutes les pièces</option>
              {pieces?.map((item, index) => (
                <option key={index} value={item["nom_piece"]}>
                  {item["nom_piece"]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mois */}
        <div>
          <label className="label">Mois</label>
          <div className="select is-fullwidth">
            <select
              value={mois}
              onChange={(e) => setMois(e.target.value)}
            >
              <option value="" disabled>Mois</option>
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
        </div>

        {/* Exercice */}
        <div>
          <label className="label">Exercice</label>
          <div className="select is-fullwidth">
            <select
              value={exercice}
              onChange={(e) => setExercice(e.target.value)}
            >
              <option value="">------</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* Date Arrivée */}
        <div>
          <label className="label">Date Arrivée</label>
          <input
            className="input"
            type="date"
            value={date_arrivee}
            onChange={(e) =>
              setDateArrivee(e.target.value)
            }
          />
        </div>

        <div>
          <button type="button"  className="button is-primary" onClick={obtenir_documents_a_comparer}>Voir</button>
        </div>
       
      </div>

      <div>
        {documents ? (
          documents.length > 0 ? (
            <div className="w-3/4 mx-auto my-4 bg-white rounded-lg shadow-lg p-4">
              <table className="table is-fullwidth">
                <tbody>
                  {documents.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => {
                        setDocumentChoisi(item.id);   // on récupère l’ID du document
                        setLigneSelect(index);        // on mémorise la ligne sélectionnée
                      }}
                      className={`cursor-pointer ${
                        ligneSelect === index ? "bg-blue-200" : "hover:bg-gray-100"
                      }`}
                    >
                      <td>{item["poste_comptable__nom_poste"]} - {item["nom_fichier"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucun document correspondant</p>
          )
        ) : null}
      </div>


      {result && (
        <div
          className={`mt-6 w-2/4 mx-auto p-4 rounded-md text-center text-lg font-semibold shadow-md ${
            result.identique
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {/* Titre */}
          <p className="text-xl font-bold mb-1">
            {result.identique ? "✔ Documents identiques" : "✖ Documents différents"}
          </p>

          {/* Description */}
          <p className="opacity-80">{result.message}</p>

          {/* Nom du document dans la base */}
          {result.document && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Document en base :</span> {result.document}
            </p>
          )}
        </div>
      )}



      {/* BOUTON EN BAS */}
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          disabled={!localFile}
          className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
            !localFile ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Comparer
        </button>
      </div>
    </form>
  );
}

export default Verification;
