import React, { useEffect, useRef, useState } from "react";
import { fetchData, paginateData } from "../../Fonction/Function";
import { API_URL } from "../../Config/Config";
import Pagination from "../Pagination/Pagination";
import { useUserStore } from "../../store/useUserStore";

export default function Log(){
  const user = useUserStore((state) => state.user);

  const [logs, setLogs] = useState(null);
  const [logs_user, setLogsUser] = useState(null);

  const [data_paginate, setDataPaginate] = useState(null);
  const [reload_data, setReloaData] = useState(false);

  const currentPage = useRef(1);
  const itemsPerPage = useRef(8);

  const recuperer_journaux = () => {
    fetchData(`${API_URL}/log/get`, {}, 'get', setLogs);
  }


  const filtrer_logs = () => {
    const filter = logs.filter(item => {
      if(item['utilisateur'] != user[0]['utilisateur__nom'] + " " + user[0]["utilisateur__prenom"]){
        return false
      }
      return true
    })
    setLogsUser(filter)
  }


  const LogItem = ({item}) => {
    return (
      <tr>
        <td>{item['utilisateur']}</td>
        <td>{item['action']}</td>
        <td>{item['modele']}</td>
        <td>{item['date_action']}</td>
        <td>{item['adresse_ip']}</td>
      </tr>
    )
  }


  useEffect(() => {
    recuperer_journaux()
  }, [])


  useEffect(() => {
    if(logs){
      filtrer_logs()
    }
  }, [logs])

  useEffect(() =>{
    if(logs_user){
      paginateData(currentPage.current, itemsPerPage.current, logs_user, setDataPaginate)
    }
  }, [logs_user, reload_data])



  return (
    <div className="container-log is-fullheight" >

      <p className="my-4 mx-6 text-xl font-semibold">Liste des actions effectuées sur le système</p>

      <div className="px-6">
      
        <table className="table border border-b-4 border-pink-300 is-relative is-hoverable is-fullwidth">

          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Modèle</th>
              <th>Date de l'action</th>
              <th>Adresse Ip</th>
            </tr>
          </thead>

          <tbody>
            {
              data_paginate ?

                data_paginate.length > 0 ?

                  data_paginate.map((item, index) => (
                    <LogItem key={index} item={item}/>
                  ))

                : 
                  <tr>
                    <td colSpan="5" className="has-text-centered">
                      Aucun donnée disponible
                    </td>
                  </tr>

              : 
                <tr>
                  <td colSpan="5" className="has-text-centered">
                    En attente des données ...
                  </td>
                </tr>
            }
          </tbody>


        </table>
        
        <Pagination currentPage={currentPage} itemsPerPage={itemsPerPage} liste={logs_user} reload={reload_data} setReload={setReloaData} description="page" /> 

      </div>


    </div>


    
    
  );
}



