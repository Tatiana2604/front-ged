import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { API_URL } from "../../Config/Config";
import { month_int_to_string, paginateData, fetchData, send_data } from "../../Fonction/Function";
import { useUserStore } from "../../store/useUserStore";
import Pagination from "../Pagination/Pagination";
import Alert from "../Alert/Alert";

export default function DocumentManager() {
  const user = useUserStore((state) => state.user);

  const [documents, setDocuments] = useState(null);
  const [documents_a_filtrer, setDocumentsAFiltrer] = useState(null);

  const [data_paginate, setDataPaginate] = useState(null);
  const [reload_data, setReloaData] = useState(false);

  const [pieces, setPieces] = useState(null); // Va stocker toutes les pieces (utile pour filtrer les documents)

  const [zones , setZones] = useState(null) 

  const [poste_comptables , setPosteComptables] = useState(null)
  const [poste_comptables_copie, setPosteComptablesCopie] = useState(null);


  const [auditeurs , setAuditeurs] = useState(null);
  const [auditeurs_copie, setAuditeursCopie] = useState(null);

  const [zone_selected, setZoneSelected] = useState("");

  const [result, setResult] = useState(null);

  const [reset, setReset] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [liste_exercices, setListeExercices] = useState(null)

  const recherche= useRef({
    poste_comptable: "",
    piece: "",
    mois: "",
    annee: "",
    date_arrivee: "",
  });

  const currentPage = useRef(1);
  const itemsPerPage = useRef(3)

  const [selectedDocs, setSelectedDocs] = useState([]);


  const obtenir_liste_exercices = () => {
    fetchData(`${API_URL}/data/exercice/get`, {}, 'get', setListeExercices)
  }


  const recuperer_toutes_les_pieces = () => {
    fetchData(`${API_URL}/data/piece_comptable/get`, {}, 'get', setPieces);
  }


  // Filter les documents
  const filtrer_documents = (item, value) => {

    recherche.current[item] = value

      // Filtrage selon la recherche
      const filteredDocuments = documents_a_filtrer.filter((item) => {
    
        const matchPosteComptable =
          !recherche.current.poste_comptable ||
          item["poste_comptable__nom_poste"]?.toLowerCase().includes(recherche.current.poste_comptable.toLowerCase());
    
        const matchType =
          !recherche.current.piece || item["piece__nom_piece"].toLowerCase().includes(recherche.current.piece.toLowerCase());
    
        const matchMois =
          !recherche.current.mois || item["mois"]?.toString().padStart(2, "0") === recherche.current.mois;
    
        const matchAnnee = !recherche.current.annee || item["exercice"]?.toString() === recherche.current.annee;
    
        const matchDateArrivee =
          !recherche.current.date_arrivee || item["date_arrivee"]?.toString() === recherche.current.date_arrivee;
    
        return matchPosteComptable && matchType && matchMois && matchAnnee && matchDateArrivee;
        
      });;

      currentPage.current = 1
      setDocuments(filteredDocuments);

  }



  // Gerer les checkbox
  const handleCheckboxChange = (value, checked) => {

    
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
  };
  


  // Archiver tous les documents sélectionnés
  const handleArchiveAll = async () => {
    const docsToArchive = documents.filter((doc) => selectedDocs.includes(doc.id ?? doc.nom_document));

    try {
      const formData = new FormData()
      formData.append('id_docs', selectedDocs);
      formData.append('action', 'ajouter_archives');
      send_data(`${API_URL}/data/archives`, formData, 'post', setResult)
      
    } catch (error) {
      setResult({'error': error.toString()})
    }
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


  // Liste des documents
  const obtenir_liste_des_documents = (setState) => {

    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(
        `${API_URL}/data/document/liste`, 
        {
          'action': 'listes_documents_directeur',
          'fonction': user[0]['utilisateur__fonction'], 
          'utilisateur': user[0]['utilisateur_id']
        }, 
        'post', 
        setState
      )
    }

    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(
        `${API_URL}/data/document/liste`,
        {
          'action': 'listes_documents_chef_unite',
          'zone': user[0]['utilisateur__zone__nom_zone']
        }, 
        'post', 
        setState
      )
    }

    else{
      fetchData(
        `${API_URL}/data/document/liste`,
        {
          'action': 'listes_documents_auditeur',
          'utilisateur': user[0]['utilisateur_id']
        }, 'post', 
        setState
      )
    }

  }

  
  const obtenir_liste_poste_comptables = (setState) => {


    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_tous_les_postes_comptables', 'fonction': user[0]['utilisateur__fonction'],'user_id': user[0]['utilisateur_id']}, 'post', setState)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables_zone', 'zone': user[0]['utilisateur__zone__id']}, 'post', setState)
    }
    else{
      fetchData(`${API_URL}/users/poste_comptable/all`, {'action': 'afficher_les_postes_comptables', 'user_id': user[0]['utilisateur_id']}, 'post', setState)
    }

  }


  // Liste des auditeurs
  const obtenir_liste_auditeurs = (setState) => {

    // setAuditeurs(null);
    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/get_auditeurs`, {'action': 'recuperer_auditeurs'}, 'post', setState)
    }
    else if(user[0]['utilisateur__fonction'].toUpperCase() == 'chef_unite'.toUpperCase()){
      fetchData(`${API_URL}/users/get_auditeurs_zone`,{'action': 'recuperer_auditeurs_zone', 'zone': user[0]['utilisateur__zone__id']}, 'post', setState)
    }
  }


  const obtenir_liste_zones = () => {
    setZones(null);
    if(user[0]['utilisateur__fonction'].toUpperCase() == 'directeur'.toUpperCase()){
      fetchData(`${API_URL}/users/zone/get`, {}, 'get', setZones);
    }

  }


  // Composant pour chaque ligne
  const DocumentItem = ({ item, index }) => {
  
    const isSelected = selectedDocs.includes(item.id.toString());

    return (
      <tr key={index}>

        <td>
          <input
            type="checkbox"
            value={item.id}
            checked={isSelected}
            onChange={(e) => handleCheckboxChange(e.target.value, e.target.checked)}
          />
        </td>

        <td>
          {
            item.nom_fichier.length > 35 ?
              item.nom_fichier.slice(0, 35) + " ..."
            : item.nom_fichier
          }
        </td>

        <td className="has-text-centered">{item.version}</td>

        <td>{item.piece__nom_piece}</td>

        <td>{item.poste_comptable__nom_poste}</td>

        <td>{item.date_arrivee}</td>

        {/* <td>{item.created_at}</td> */}

        <td>{month_int_to_string(item.mois)}</td>

        <td>{item.exercice}</td>
      </tr>
    );
  };


  useEffect(() => {
    const original_title = document.title
    document.title = 'Liste des documents'

    obtenir_liste_exercices();
    recuperer_toutes_les_pieces();

    return () => {
      document.title = original_title
    }

  }, [])


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
    <div className="" style={{height: "100%"}}>

      <div className="">


        <p className="p-4 text-xl font-semibold">Liste des documents</p>

        {
          user ?
            user[0]['utilisateur__fonction'].toUpperCase() != 'Auditeur'.toUpperCase()?
              <>
                <div className="flex gap-6 justify-center items-center">
                  {
                    user[0]['utilisateur__fonction'].toUpperCase()== 'Directeur'.toUpperCase()?
                      <div className="w-1/2 flex items-center gap-4 container-zone">
                        <label className="label">Zone: </label>
                        <select className="bg-white p-2 w-full rounded-lg border border-gray-300" value={zone_selected} onChange={(e) => { setZoneSelected(e.target.value); filter_les_auditeurs_et_les_postes_comptables_par_zone(e.target.value)} }>
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

          <div className="flex gap-6 items-center justify-center bg-white rounded-sm shadow-sm p-2">

            {/* Poste comptable */}
            <div className='flex-1'>

              <div className="">
                <label className="label">Poste comptable</label>
              </div>

              <div className="">

                <input 
                  className="input"
                  list="poste_comptable"
                  name="poste_comptable" 
                  value={recherche.current.poste_comptable}
                  onChange={(e) => filtrer_documents('poste_comptable', e.target.value)}
                />
                <datalist id="poste_comptable">
                  {
                    poste_comptables && poste_comptables.map((item, index) => (
                      <option key={index} value={item['nom_poste']} />
                    ))
                  }
                </datalist>

              </div>
              
            </div>

            {/* Pièces */}
            <div className="flex-1">

              <div className="">
                <label className="label">Pièces</label>
              </div>

              <div className="select is-fullwidth">

                <select name="piece" value={recherche.current.type} onChange={(e) => filtrer_documents('piece', e.target.value)}>
                  <option value="">Toutes les pièces</option>
                  {
                    pieces && pieces.map((item, index) => (
                      <option key={index} value={item['nom_piece']}>{item['nom_piece']}</option>
                    ))
                  }
                      
                </select>

              </div>

              
            </div>

            {/* Mois */}
            <div className="flex-1">

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

            <div className="flex-1">

              <div className="">
                <label className="label">Exercice</label>
              </div>
  
              <div className="select is-fullwidth">

                <select className="" value={recherche.current.annee} onChange={(e) => filtrer_documents('annee', e.target.value)}>
                  <option value="">------</option>

                  {
                    liste_exercices && liste_exercices.map((item, index) => (
                      <option key={index} value={item['annee']}>{item['annee']}</option>
                    ))
                  }

                </select>

              </div>
            
            </div>
            

            <div className="flex-1">

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
        {selectedDocs.length > 0 && !result && (
          <div className="mb-3">
            <button className="button is-info mr-2" onClick={handleDownloadAll}>
              Télécharger ({selectedDocs.length})
            </button>
            <button className="button is-warning" onClick={handleArchiveAll}>
              Archiver ({selectedDocs.length})
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


        {/* Tableau */}
        <div className="table-container is-fullheight" style={{height: "350px"}}>

          {
            user[0]['utilisateur__fonction'].toLowerCase() == 'auditeur' && (
              <div className="mb-2">
                <NavLink
                  to="/main/ajouter_document"
                  className="button is-primary"
                >
                  Ajouter un document
                </NavLink>
              </div> )
          }

          <table className="table border border-b-4 border-pink-300 is-relative is-striped is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th className="">Choisir</th>
                <th>Document</th>
                <th>Version</th>
                <th>Pièce</th>
                <th>Poste Comptable</th>
                <th>Date arrivée</th>
                {/* <th>Date d'enregistrement</th> */}
                <th>Mois</th>
                <th>Exercice</th>
              </tr>
            </thead>
            <tbody>
              {
                data_paginate ? 
                  data_paginate.length > 0 ?
                    data_paginate.map((item, index) => (
                      <DocumentItem key={index} item={item} index={index} />
                    ))
                  :
                    <tr>
                      <td colSpan="8" className="has-text-centered">
                        Aucun document disponible
                      </td>
                    </tr>
                : 
                  <tr>
                    <td colSpan="8" className="has-text-centered">
                      En attente des données ...
                    </td>
                  </tr>
              }
            </tbody>
          </table>

          <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={documents} reload={reload_data} setReload={setReloaData} description="page" />  

        </div>
      </div>
    </div>
  );
}











