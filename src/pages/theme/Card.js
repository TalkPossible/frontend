import React from "react";

import "./Card.css";

const Card = ({Data, setModalOpen, setSelected, index}) => {
  const onCardClick = () => {
    setModalOpen(true);
    setSelected(index);
  }

  return(
    <div className="card" onClick={onCardClick}>
      <img src={getImageUrl(Data.imgUrl)}  alt={Data.title} className="card-img" />
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