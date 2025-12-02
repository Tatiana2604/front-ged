import { getCSRFToken } from "../utils/csrf";

export const fetchData = (url, body = {}, method, setResult) => {

    if(method.toUpperCase() !='GET'){
        const csrftoken = getCSRFToken()
        fetch(url, {
            method: method,
            headers:{
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            credentials: "include",
            body: JSON.stringify(body)        
        })
        .then(res => {
            if(!res.ok){
                throw new Error("Erreur HTTP : " + res.status);
            }
            return res.json();
        })
        .then(data => {
            setResult(data);
        })
        .catch(error => {
            setResult({'error': error.toString()})
            
        })
    }
    else{
        fetch(url, {
            method: method,
            credentials:'include'
        })
        .then(res => {
            if(!res.ok){
                throw new Error('Erreur HTTP: ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            setResult(data);
        })
        .catch((e) =>{
            setResult({'error': e.toString()})
        })
    }
}


export const send_data = (url, body, method, setResult) => {
    const csrftoken = getCSRFToken();
    fetch(url, {
        method: method,
        body: body,
        headers: {
            "X-CSRFToken": csrftoken,
        },
        credentials: "include",
    })
    .then(response => {
        if(!response.ok){
            throw new Error('Erreur HTTP ' + response.status)
        }
        return response.json();
    })
    .then(data => {
        setResult(data);
    })
    .catch(error => {
        setResult({'error': error.toString()})
    })
}


export const month_int_to_string = (month) => {
    let month_string = '';

    switch(month){
        case '01': month_string+='Janvier'; break;
        case '02': month_string+='Février'; break;
        case '03': month_string+='Mars'; break;
        case '04': month_string+='Avril'; break;
        case '05': month_string+='Mai'; break;
        case '06': month_string+='Juin'; break;
        case '07': month_string+='Juillet'; break;
        case '08': month_string+='Août'; break;
        case '09': month_string+='Septembre'; break;
        case '10': month_string+='Octobre'; break;
        case '11': month_string+='Novembre'; break;
        case '12': month_string+='Décembre';   
    }

    return month_string;

}


export const paginateData = (currentage, itemsPerPage, data , setItem) => {
    const startIndex = (currentage -1)*itemsPerPage
    const endIndex = startIndex + itemsPerPage

    const currentItems = data.slice(startIndex, endIndex)

    setItem(currentItems);
}


export const prevPagination = (currentPage) =>{
    if(currentPage > 1){
        currentPage = currentPage - 1;
        return currentPage
    }
    return currentPage;
        
}


export const nextPagination = (currentPage, itemsPerPage, data) =>{
    if(currentPage < Math.ceil(data.length / itemsPerPage)){
        currentPage = currentPage + 1;
        return currentPage;
    }
    return currentPage;
}

