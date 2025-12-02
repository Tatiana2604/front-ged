import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../Config/Config"; // ou ton config API
import { month_int_to_string, paginateData, fetchData, send_data } from "../../Fonction/Function";
import { useUserStore } from "../../store/useUserStore";
import Alert from "../Alert/Alert";
import Pagination from "../Pagination/Pagination";


const Archive = () => {

  const user = useUserStore((state) => state.user);

  // const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [documents, setDocuments] = useState(null);
  const [documents_a_filtrer, setDocumentsAFiltrer] = useState(null);

  const [data_paginate, setDataPaginate] = useState(null);
  const [reload_data, setReloaData] = useState(false);

  const [pieces, setPieces] = useState(null); // Va stocker toutes les pieces (utile pour filtrer les documents)


  const recherche= useRef({
    poste_comptable: "",
    piece: "",
    mois: "",
    annee: "",
    date_arrivee: "",
  });

  const currentPage = useRef(1);
  const itemsPerPage = useRef(5);

  const [result, setResult] = useState(null);

  const [poste_comptables , setPosteComptables] = useState(null);
  const [poste_comptables_copie, setPosteComptablesCopie] = useState(null);

  const [auditeurs , setAuditeurs] = useState(null);
  const [auditeurs_copie, setAuditeursCopie] = useState(null);

  const [zone_selected, setZoneSelected] = useState("");
  const [zones , setZones] = useState(null) 


  const [selectedDocs, setSelectedDocs] = useState([]);


  const saisie = (e) => {
    const { name, value } = e.target;
    // setRecherche((prev) => ({
    //   ...prev,
    //   [name]: value,
    // }));
  };


  const search = (e) => {
    e.preventDefault();
  };


  // Cette fonction va recuprer toutes les pieces dans la BD
  const recuperer_toutes_les_pieces = () => {
    fetchData(`${API_URL}/data/piece_comptable/get`, {}, 'get', setPieces);
  }


  const filtrer_documents = (item, value) => {

    recherche.current[item] = value

      // Filtrage selon la recherche
      const filteredDocuments = documents_a_filtrer.filter((item) => {
    
        const matchPosteComptable =
          !recherche.current.poste_comptable ||
          item["document__poste_comptable__nom_poste"]?.toLowerCase().includes(recherche.current.poste_comptable.toLowerCase());
    
        const matchPiece =
          !recherche.current.piece || recherche.current.piece?.toLowerCase().includes(item["document__piece__nom_piece"].toLowerCase());
    
        const matchMois =
          !recherche.current.mois || item["document__mois"]?.toString().padStart(2, "0") === recherche.current.mois;
    
        const matchAnnee = !recherche.current.annee || item["document__exercice"]?.toString() === recherche.current.annee;
    
        const matchDateArrivee =
          !recherche.current.date_arrivee || item["document__date_arrivee"]?.toString() === recherche.current.date_arrivee;
    
        return matchPosteComptable && matchPiece && matchMois && matchAnnee && matchDateArrivee;
        
      });;

      setDocuments(filteredDocuments);

  }


   //  la checkbox
  const handleCheckboxChange = (value, checked) => {
    // console.log('checked', checked);
    
    if (!checked) {
      // setSelectedDocs(selectedDocs.filter((docId) => docId !== id));
      const filter = selectedDocs.filter(itemId => {
        if(itemId == value){
          return false;
        }
        return true
      })
      setSelectedDocs(filter)

    } else {
      setSelectedDocs([...selectedDocs, value]);
    }

    console.log('checked', checked);
    
    
    
  };


   // Télécharger les documents sélectionnés
  const handleDownloadAll = () => {
    const formData = new FormData();
    formData.append('id_docs', selectedDocs);  // Assure-toi que c'est une liste
    formData.append('action', 'telecharger');
  
    fetch(`${API_URL}/data/document/telecharger`, {
      method: "POST",
      body: formData,
    })
    .then((res) => res.blob()) // <-- important : récupérer le ZIP en binaire
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "documents.zip"; // nom du fichier téléchargé
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      setResult({'error': err.toString()})
    });
    setSelectedDocs([]);
  };


  // Composant pour chaque ligne
  const ArchiveItem = ({ item, index }) => {
    // const docKey = item.id; // clé unique
    const isSelected = selectedDocs.includes(item.document__id.toString());

    return (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            value={item.document__id}
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(e.target.value, e.target.checked)}
          />
        </td>
        <td>{item.document__nom_fichier}</td>
        <td>{item.document__piece__nom_piece}</td>
        <td>{item.document__poste_comptable__nom_poste}</td>
        <td>{item.document__date_arrivee}</td>
        <td>{item.document__created_at}</td>
        <td>{month_int_to_string(item.document__mois)}</td>
        <td>{item.document__exercice}</td>
      </tr>
    );
  };


  //cette fonction va filtrer les donnees initial(auditeur et poste comptable) recupérer par rapport au zone selectionnée (pour un directeur)
  const filter_les_auditeurs_et_les_postes_comptables_par_zone = (value) => {
    const auditeurs_filter = auditeurs_copie.filter((item) => {
      if(item['zone_id']?.toString() != value){
         return false
      }
      return true
    })
    setAuditeurs(auditeurs_filter)

    const poste_comptable_filter = poste_comptables_copie.filter((item) => {
      if (item['utilisateur__zone_id']?.toString() != value){
        return false
      }
      return true
    })

    currentPage.current = 1
    setPosteComptables(poste_comptable_filter)

  }


  const recuperer_les_postes_comptables_liees_a_un_auditeur = (value) =>{

    if(value != ""){
      const id = value.split(" ")[0];
      const filter = poste_comptables_copie.filter((item) => {
        if( item['utilisateur_id']?.toString() != id ){
            return false
        }
        return true
      })
      setPosteComptables(filter)
    }

    else{
      if(zone_selected != ""){
        filter_les_auditeurs_et_les_postes_comptables_par_zone(zone_selected)
      }
      else{
        setPosteComptables(poste_comptables_copie)
      }
    }

  }


  // Cette fonction va recuperer la liste des documents en se basant sur la fonction de l'utilisateur
  const obtenir_liste_des_documents = (setState) => {

    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(
        `${API_URL}/data/archive/list`, 
        {
          'action': 'archives_documents_directeur',
          'fonction': user[0]['utilisateur__fonction'], 
          'utilisateur': user[0]['id']
        }, 
        'post', 
        setState
      )
    }

    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(
        `${API_URL}/data/archive/list`,
        {
          'action': 'archives_documents_chef_unite',
          'zone': user[0]['utilisateur__zone__nom_zone']
        }, 
        'post', 
        setState
      )
    }

    else{
      fetchData(
        `${API_URL}/data/archive/list`,
        {
          'action': 'archives_documents_auditeur',
          'utilisateur': user[0]['id']
        }, 'post', setState
      )
    }

  }


  // Cette fonction va recuperer la les poste comptables en se basant sur la fonction de l'utilisateur
  const obtenir_liste_poste_comptables = (setState) => {

    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_tous_les_postes_comptables', 'fonction': user[0]['utilisateur__fonction'],'user_id': user[0]['id']}, 'post', setState)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables_zone', 'zone': user[0]['utilisateur__zone__id']}, 'post', setState)
    }
    else{
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables', 'user_id': user[0]['id']}, 'post', setState)
    }

  }


  const obtenir_liste_auditeurs = (setState) => {
 
    
    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/get_auditeurs`, {'action': 'recuperer_auditeurs'}, 'post', setState)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/get_auditeurs_zone`,{'action': 'recuperer_auditeurs_zone','zone': user[0]['utilisateur__zone__id']}, 'post', setState)
    }

  }


  const obtenir_liste_zones = () => {
    setZones(null);
    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/zone/get`, {}, 'get', setZones);
    }

  }


  useEffect(() => {
    if(user){
      obtenir_liste_des_documents(setDocuments);
      obtenir_liste_des_documents(setDocumentsAFiltrer);

      obtenir_liste_poste_comptables(setPosteComptables);
      obtenir_liste_poste_comptables(setPosteComptablesCopie);

      obtenir_liste_auditeurs(setAuditeurs);
      obtenir_liste_auditeurs(setAuditeursCopie);

      obtenir_liste_zones();
    }
  }, [user])



  useEffect(() => {
    recuperer_toutes_les_pieces();
  }, [])



  useEffect(() =>{
    if(documents){
      paginateData(currentPage.current, itemsPerPage.current, documents, setDataPaginate)
    }
  }, [documents, reload_data])


  useEffect(() => { 
    if(result){
      if(result['succes']){
        setSelectedDocs([]);
        obtenir_liste_des_documents(setDocuments);
        obtenir_liste_des_documents(setDocumentsAFiltrer);
      }
    }
  }, [result])


  return (

    <div className="w-full px-6 bg-red-400">

      <p className="text-xl font-semibold my-2 mx-4 text-xl">📂 Archives</p>

        {
          user ?

            user[0]['utilisateur__fonction'].toUpperCase() != 'Auditeur'.toUpperCase()?
              <>
                <div className="flex gap-6 justify-center items-center px-4">
                  {
                    user[0]['utilisateur__fonction'].toUpperCase()== 'Directeur'.toUpperCase() ?
                      <div className="w-1/2 flex items-center gap-4 container-zone">
                        <label className="label">Zone: </label>
                        <select className="bg-white p-2 w-full rounded-lg border border-gray-300" value={zone_selected} onChange={(e) => { setZoneSelected(e.target.value); filter_les_auditeurs_et_les_postes_comptables_par_zone(e.target.value) } }>
                          <option value="" disabled>Choisissez une zone</option>
                          {
                            zones && zones.map((item, index) => (
                              <option key={index} value={item['id']}>{item['nom_zone']}</option>
                            ))
                          }
                        </select>
                      </div>
                    : null
                  }

                  <div className="flex-1 p-4 flex items-center gap-4">
                    <label className="label">Auditeur: </label>
                    <input list="auditeur" className="bg-white p-2 rounded-lg border border-gray-300 w-full" placeholder="votre auditeur ?" onChange={ (e) => recuperer_les_postes_comptables_liees_a_un_auditeur(e.target.value)} />
                    <datalist id='auditeur'>
                      {
                        auditeurs && auditeurs.map((auditeur, index) =>(
                          <option key={index} value={auditeur['id']+ " " + auditeur['nom'] + " " + auditeur['prenom']} />
                        ))
                      }

                    </datalist>
                  </div>

                </div>
              </>

            : null
          : null
        }

      
      {/* 🔽 Formulaire de recherche  */}
      <form className="my-2">

        <div className="flex gap-6 items-center justify-center">

        {/* Poste comptable */}
        <div className=''>

          <div className="">
            <label className="label">Poste comptable</label>
          </div>

          {/* <div className=""> */}

            <input 
              className="input"
              list="poste_comptable"
              name="poste_comptable" 
              value={recherche.current.poste_comptable}
              onChange={(e) => filtrer_documents('poste_comptable', e.target.value)}
            />
            <datalist id="poste_comptable">
              {
                poste_comptables && poste_comptables.length > 0 ?
                  poste_comptables.map((item, index) => (
                  <option key={index} value={item['nom_poste']} />
                  ))
                : <option value="" />
                
              }
            </datalist>

          {/* </div> */}
          
        </div>

        {/* Pièces */}
        <div className="">

          <div className="">
            <label className="label">Pièces</label>
          </div>

          <div className="select is-fullwidth">

            <select name="piece" value={recherche.current.type} onChange={(e) => filtrer_documents('piece', e.target.value)}>
              <option value="">Toutes les pièces</option>
              {
                pieces && pieces.map((item, index) => (
                  <option value={item['nom_piece']}>{item['nom_piece']}</option>
                ))
              }
                  
            </select>

          </div>

          
        </div>

        {/* Mois */}
        <div className="">

          <div className="">
            <label className="label">Mois</label>
          </div>

          <div className="select is-fullwidth">
            
            <select name="mois" value={recherche.current.mois} onChange={(e) => filtrer_documents('mois', e.target.value)}>

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
        <div className="">

          <div className="">
            <label className="label">Exercice</label>
          </div>

          <div className="select is-fullwidth">

            <select className="" value={recherche.current.annee} onChange={(e) => filtrer_documents('annee', e.target.value)}>
              <option value="">------</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

          </div>

        </div>


        <div className="">

          <div className="">
            <label className="label">Date Arrivée</label>
          </div>

          <div className="">
            <input
              className="input" 
              type="date"
              name="date_arrivee"
              value={recherche.current.date_arrivee}
              onChange={(e) => filtrer_documents('date_arrivee', e.target.value)}
            />
          </div>
          
        </div>

        </div>

      </form>


      {/* les actions:archive et telehargement */}
      {selectedDocs.length > 0 && (
          <div className="mb-3">

            <button className="button is-info mr-2" onClick={handleDownloadAll}>
              Télécharger ({selectedDocs.length})
            </button>
            
          </div>
        )}


          {
            result ?
                result['succes'] ?
                    <Alert message={result['succes']} bgColor={'has-background-success'} icon={'fas fa-check'} setResult={setResult}/>
                : result['error'] ?
                  <Alert message={result['error']} bgColor={'has-background-danger'} icon={'fas fa-times'} setResult={setResult}/>
                : null
            : null
          }


      {documents?.length === 0 ? (
        <p>Aucune archive trouvée.</p>
      ) : (  
        <>
        <table className="table is-fullwidth">

          <thead className="bg-gray-100 text-left">

            <tr>
            <th className="">Choisir</th>
                <th>Document</th>
                <th>Pièce</th>
                <th>Poste Comptable</th>
                <th>Date arrivée</th>
                <th>Date d'enregistrement</th>
                <th>Mois</th>
                <th>Exercice</th>
            </tr>

          </thead>

          <tbody>
          {data_paginate ? (
                data_paginate.map((item, index) => (
                  <ArchiveItem key={index} item={item} index={index} />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="has-text-centered">
                    Aucun document trouvé
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={documents} reload={reload_data} setReload={setReloaData} description="page" /> 

        </>

      )}

    </div>
  );
};

export default Archive;




