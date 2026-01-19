import { useState, useEffect } from "react"
import { fetchData } from "../../Fonction/Function"
import { API_URL } from "../../Config/Config"
import Alert from '../Alert/Alert';
import { getCSRFToken } from "../../utils/csrf";

export default function SendEmail() {

    const [email, setEmail] = useState("")
    const [sujet, setSujet] = useState("")
    const [message, setMessage] = useState("")
    const [fichier, setFichier] = useState("")
    const [result, setResult] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)


    const recuperer_fichier = () => {
        const file = document.querySelector(".file-input")
        setFichier(file.files[0]);
    }


    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('sujet', sujet)
        formData.append('message', message)
        formData.append('fichier', fichier)
        formData.append('action', 'envoyer_documents')

        const csrftoken = getCSRFToken()

        fetch(`${API_URL}/data/document/send`, {
            method: 'post',
            headers:{
                // "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            credentials: "include",
            body: formData
        })
        .then(response => {
            if(!response.ok){
                throw new Error('Erreur HTTP : ' + response.status)
            }
            return response.json()
        })
        .then(data => {
            setResult(data)
            setIsSubmitting(false)
        })
        .catch(e => {
            setResult({'error' : e.toString()})
            setIsSubmitting(false)
        })
    }


    useEffect(() => {
        const original_title = document.title
        document.title = 'Envoyer des documents'

        return () => {
            document.title = original_title
        }
    }, [])

    
  return (
    <div id="email">
      <p className="p-4 text-center text-xl font-semibold">Envoyer des documents</p>

      <div className="bloc-form bg-white w-2/3 mx-auto p-4 rounded-sm shadow-sm">
        <form onSubmit={handleSubmit}>

            {/* Email du destinataire */}
            <div className="field">
                <div className="control">
                    <label className="label">Email du destinataire</label>
                    <input type="email" className="input" placeholder="exemple@gmail.com" required value={email} onChange={ (e) => setEmail(e.target.value) }/>
                </div>
            </div>

            {/* Sjuet */}
            <div className="field">
                <div className="control">
                    <label className="label">Sujet</label>
                    <input type="text" className="input" placeholder="Entrer le sujet du message" required value={sujet} onChange={ (e) => setSujet(e.target.value) }/>
                </div>
            </div>

            {/* Message */}
            <div className="field">
                <div className="control">
                    <label className="label">Message</label>
                    <textarea className="textarea" placeholder="Votre message ici" value={message} onChange={ (e) => setMessage(e.target.value) }></textarea>
                </div>
            </div>

            {/* Fichier */}
            <div className="field">
                <div className="control">

                    <label className="label">Joindre un fichier</label>

                    <div className="file has-name is-fullwidth">

                        <label className="file-label">
                            <input
                            className="file-input"
                            type="file"
                            name="fichier"
                            onChange={recuperer_fichier}
                            required
                            />
                            <span className="file-cta">
                            <span className="file-icon">
                                <i className="fas fa-upload"></i>
                            </span>
                            <span className="file-label">Choisir un fichier…</span>
                            </span>
                            <span className="file-name">
                            {fichier['name'] || "Aucun fichier sélectionné"}
                            </span>
                            
                        </label>

                    </div>
                </div>
            </div>

            {
                result ?
                    result['succes'] ?
                        <Alert message={result['succes']} bgColor={'has-background-success'} icon={'fas fa-check'} setResult={setResult}/>
                    : <Alert message={result['error']} bgColor={'has-background-danger'} icon={'fas fa-times'} setResult={setResult}/>
                : null
            }

            <div className="container-btn">
                <button className="button is-link" disabled={email == "" || sujet == "" || fichier == "" || isSubmitting}>
                    <span className="icone mx-1">
                        <i className="fas fa-paper-plane"></i>
                    </span>
                    {
                        isSubmitting ?
                            "Envoie de l'email ..."
                        : "Envoyer"
                    }
                </button>
            </div>

        </form>

      </div>
    </div>
  )
}
