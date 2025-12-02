import React, { use, useEffect, useState } from 'react'
import { fetchData, send_data } from '../../../Fonction/Function';
import { API_URL } from '../../../Config/Config'
import { useFetch } from '../../../hooks/useFetch'
import Alert from '../../Alert/Alert';
import './Form.css';
import { useUserStore } from '../../../store/useUserStore';


export default function Form() {
    const user = useUserStore((state) => state.user);


    const [reset, setReset] = useState(true);
    const [result, setResult] = useState(null);



    const [file, setFile] = useState({
        "piece": "",
        "date_sje": "",
        "poste_comptable": "",
        "periode": "",
        "exercice": "",
        "mois": "",
        "decade": "",
        "date_arrivee": "",
        "fichier": "",
        "nom_fichier":"",
        "type_fichier": "",

    })


    const handleChange = (item, value) => {
        setFile(prev =>({
            ...prev,
            [item]: value,

        }));
    }


    const save_file = () => {
        const formData = new FormData();

        let nom_fichier = file['nom_fichier'];
        let mois = file['mois']
        let exercice = file['exercice']
        let info_supp = ''       

        if(file['decade'] != ""){
            info_supp += file['decade']
        }
        else if(file["date_sje"] != ""){
            info_supp += file['date_sje']
            const date = new Date(file['date_sje'])
            mois = date.getMonth() + 1;
            exercice = date.getFullYear();
        }
        
        formData.append('piece', file['piece']);
        formData.append('poste_comptable' , file['poste_comptable']);
        formData.append('date_arrivee',file['date_arrivee']);
        formData.append('fichier',file['fichier']);
        formData.append('nom_fichier', nom_fichier);
        formData.append('info_supp', info_supp);
        formData.append('exercice', exercice);
        if(mois < 10){
            formData.append('mois', `0${mois}`);
        }
        else{
            formData.append('mois', mois);
        }
        formData.append('type_fichier',file['type_fichier']);
        formData.append('periode', file['periode']);
        formData.append('action', 'ajouter');

        send_data(`${API_URL}/data/document/create`, formData, 'POST', setResult);
    }

    // const{data: poste_comptable} = useFetch(`${API_URL}/users/poste_comptable/get`, 'post', {'piece':'TSDMT'}, reset)
    
    // const{data: piece_comptable} = useFetch(`${API_URL}/data/piece_comptable/get`, 'get', {}, reset)
    const [piece_comptable, setPieceComptable] = useState(null)
    const [poste_comptable, setPosteComptable] = useState(null)


    useEffect(() => {
        fetchData(`${API_URL}/data/piece_comptable/get`, {}, 'get', setPieceComptable)
        fetchData(
            `${API_URL}/users/poste_comptable/all`,
            { action: "afficher_les_postes_comptables", user_id: user[0]["id"] },
            "post",
            setPosteComptable
        );
    }, [])



    const recuperer_image = (e) => {
        let fichier= document.querySelector('.file-input').files[0];
        let nom = fichier.name;
        let nom_split = nom.split(".");
        
        handleChange("fichier", fichier);
        handleChange("nom_fichier", fichier.name);
        handleChange("type_fichier", nom_split[nom_split.length - 1]);
        
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        save_file();
    };

  return (
    <div id='ajout-fichier'>
        {/* <p className='is-size-4 has-text-centered my-2'>Formulaire d'ajout</p> */}

        <form onSubmit={handleSubmit} className="">
        
            <div className='flex justify-center items-center gap-4 p-2'>

                {/* Pièce */}
                <div className='flex-1'>
                    <div className="">

                        <label className='label'>Pièce</label>

                        {/* <div className='select is-fullwidth'> */}

                            <select className='bg-white p-2 w-full border border-gray-300 rounded-lg' name="" id="" value={file['piece']} onChange={(e) => handleChange('piece', e.target.value)}>
                                <option value="">Choisissez une pièce</option>
                                {
                                    piece_comptable && piece_comptable.map((item, index) => (
                                        <option key={index} value={item["id"]}>{item["nom_piece"]}</option>
                                    ))
                                }
                            </select>

                        {/* </div> */}

                    </div>
                </div>

                {
                    piece_comptable && piece_comptable.find(p => p.id == Number(file['piece']))?.nom_piece === 'SJE' ?
                        <div className='w-1/2'>
                            <div className="">
                                <label className='label'>Date du SJE</label>
                                <div>
                                    <input type="date" className='input' value={file['date_sje']} onChange={(e) => handleChange('date_sje', e.target.value)}/>
                                </div>
                            </div>
                        </div>
                    : null
                }


            </div>

            {/* Poste conptable */}
            <div className='field'>
                <div className="control">

                    <label htmlFor="" className='label'>Poste comptable</label>

                    <div className='is-fullwidth'>

                        <input list="poste_comptable" className='input' value={file['poste_comptable']} onChange={(e) => handleChange('poste_comptable', e.target.value)}/>

                        <datalist id="poste_comptable" >
                            {
                                poste_comptable && poste_comptable.map((item, index) => (
                                    <option key={index} value={item['nom_poste']} />
                                ))
                            }
                        </datalist>

                    </div>

                </div>
            </div>

                   {/* Période */}
            <div className='columns is-marginless'>
                
                <div className='column'>

                    <label className="label">Période</label>

                    <div className="select is-fullwidth">

                        <select className="" id="" value={file['periode']}onChange={(e) => handleChange('periode' , e.target.value)}>
                            <option value=""></option>
                            <option value="Journaliere">Journalière</option>
                            <option value="Mensuelle">Mensuelle</option>
                            <option value="Décadaire">Décadaire</option>
                        </select>
                    </div>

                </div>

                {
                    file["periode"] != "Journaliere" ?
                        <>
                    
                            <div className='column'>
                                
                                    <label className="label">Exercice</label>

                                    <div className="select is-fullwidth">

                                        <select name="" id="" value={file['exercice']}onChange={(e) => handleChange('exercice', e.target.value)}>
                                            <option value=""></option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>

                                    </div>
                            
                            </div>

                            <div className='column'>
                            
                                <label className="label">Mois</label>

                                <div className="select is-fullwidth">
                                    <select name="" id="" value={file['mois']}onChange={(e) =>handleChange('mois', e.target.value)}>
                                        <option value=""></option>
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

                        </>
                    : null
                }


            </div>

            {
                file['periode'] == 'Décadaire' && (
                    <div className="field">
                        <div className="control">

                            <label htmlFor="" className='label'>Décade</label>

                            <div className="select is-fullwidth">
                                <select name="" id="" value={file['decade']} onChange={(e) => handleChange('decade', e.target.value)}>
                                    <option value=""></option>
                                    <option value="Decade 1">1ère</option>
                                    <option value="Decade 2">2ème</option>
                                    <option value="Decade 3">3ème</option>
                                </select>
                            </div>
                            
                        </div>
                    </div>
                )
            }

            {/* Fichier */}
            <div className="field">
                <div className="control">

                    <label className="label">Fichier</label>

                    <div className="file has-name is-fullwidth">

                        <label className="file-label">
                            <input
                            className="file-input"
                            type="file"
                            name="fichier"
                            onChange={recuperer_image}
                            required
                            />
                            <span className="file-cta">
                            <span className="file-icon">
                                📂
                            </span>
                            <span className="file-label">Choisir un fichier…</span>
                            </span>
                            <span className="file-name">
                            {file['nom_fichier'] || "Aucun fichier sélectionné"}
                            </span>
                            
                        </label>

                    </div>

                </div>
            </div>

            {/* Date */}
            <div className="field">
                <div className="control">
                    <label className="label">Date d'arrivée du fichier</label>

                    <input
                    className="input"
                    type="date"
                    name="date"
                    value={file['date_arrivee']}
                    onChange={(e) => handleChange('date_arrivee', e.target.value)}
                    required
                    />

                </div>
            </div>

            {
                result ?
                    result['succes'] ?
                        <Alert message={result['succes']} bgColor={'has-background-success'} icon={'fas fa-check'} setResult={setResult}/>
                    : <Alert message={result['error']} bgColor={'has-background-danger'} icon={'fas fa-times'} setResult={setResult}/>
                : null
            }

            {/* Boutton d'envoi du formulaire */}
            <div className="field is-grouped mt-5">
                <div className="control">
                <button type="submit" className="button is-link">
                    Enregistrer
                </button>
                </div>
                <div className="control">
                <button
                    type="button"
                    className="button is-light"
                >
                    Annuler
                </button>
                </div>
            </div>

        </form>
    </div>
  )
}
