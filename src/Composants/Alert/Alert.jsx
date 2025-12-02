import React from 'react'
import './Alert.css';

export default function Alert({message, bgColor, icon, setResult}) {

  const close_alert = () => {
    setResult(null);
  }

  return (
    <div className={`box ${bgColor} alert`}>
      <span className='icon mx-'>
        <i className={icon}></i>
      </span>
      {message}
      <span className='icon is-pulled-right' onClick={close_alert}>
        <i className='fas fa-times'></i>
      </span>
    </div>
  )
}
