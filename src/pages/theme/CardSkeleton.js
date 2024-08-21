import React from 'react';
import "./CardSkeleton.css"; 

const CardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-desc"></div>
    </div>
  );
}

export default CardSkeleton;
