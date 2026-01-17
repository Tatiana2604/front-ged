import React from 'react'
import { nextPagination, prevPagination } from '../../Fonction/Function';
import './Pagination.css';

export default function Pagination({description='', currentPage, itemsPerPage, liste, reload, setReload}) {
    let current = 0;

    const prev = () => {
        current = prevPagination(currentPage.current)
        currentPage.current = current;
        setReload(!reload);
    }

    const next = () =>  {
        current = nextPagination(currentPage.current, itemsPerPage.current, liste);
        currentPage.current = current
        setReload(!reload);
    }

  return (
    <div id='pagination'>
        <div className='container-pagination' style={{width: '400px'}}>
            
            <button className={currentPage.current == 1 ? 'container-item button is-link is-hidden is-small' : 'container-item button is-link is-small'} onClick={prev}>
                Précedent
            </button>

            <p className='container-item is-size-4 font-semibold italic'>{description + " " + currentPage.current}</p>

            <button className={  (Math.ceil(liste?.length / itemsPerPage.current) || 0) <= currentPage.current ? 'container-item button is-link is-hidden is-small' : 'container-item button is-link is-small'} onClick={next}>
                Suivant
            </button>
        </div>
      
    </div>
  )
}
