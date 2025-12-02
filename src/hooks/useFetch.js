import { useEffect, useState } from "react";



export function useFetch(url, methode, body ={}, reset){

    const[loading,setLoading] = useState(true)
    const[data,setData] = useState(null)
    const[errors,setErrors] = useState(null)

    useEffect(() =>{

        if(methode.toUpperCase() == "POST"){
            // const csrftoken = getCSRFToken();
            fetch(url, {
                method: methode,
                headers: {
                    "content-type":"application/json",
                    // "X-CSRFToken": csrftoken,
                },
                // credentials: "include",
                body: JSON.stringify(body)

            })
            .then(res =>{
                if(!res.ok){
                    throw new Error('Erreur HTTP: '+res.status);
                }
                return res.json();
            })
            .then(data =>{
                setData(data)
                //console.log(data)
            })
            .catch((e) =>{
                setLoading(false)
            })
        }
        else{
              fetch(url,{
                method: methode,
                headers: {
                    "content-type":"application/json",
                    // "X-CSRFToken": csrftoken,
                },
                // credentials: "include",
               

            })
            .then(res =>{
                if(!res.ok){
                    throw new Error('Erreur HTTP: '+res.status);
                }
                return res.json();
            })
            .then(data =>{
                setData(data)
                //console.log(data)
            })
            .catch((e) =>{
                setLoading(false)
            })

        }

            
            
    }, [reset])

    return{
        loading:loading,
        data: data,
        errors:errors
    }

}






