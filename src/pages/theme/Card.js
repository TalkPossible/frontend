import React from "react";

import "./Card.css";

const Card = ({Data, setModalOpen, setSelected, index}) => {
  const onCardClick = () => {
    setModalOpen(true);
    setSelected(index);
  }

  const getImageUrl = (url) => {
    const isValidUrl = (url) => {
      return url && url.startsWith('http');
    };

    return isValidUrl(url) ? url : "https://picsum.photos/400"; // 랜덤 이미지로 사용할 기본 URL
  };

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