import React from "react";

import "./Card.css";

const Card = ({Data}) => {

  return(
    <div className="card" >
      <img src={Data.img}  alt={Data.title} className="card-img" />
      <div className="card-info" >
        <div className="inner" >
          <p className="info-title" >{Data.title}</p>
          <p className="info-desc" >{Data.description}</p>
        </div>
      </div>
    </div>
  )
}

export default Card;