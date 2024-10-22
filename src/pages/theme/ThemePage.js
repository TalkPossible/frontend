import React, { useState, useEffect } from 'react';
import { call } from '../../service/ApiService.js';

import Header from "../../components/Header.js";
import Card from "./Card.js"
import ThemeModal from "../../components/ThemeModal.js";
import CardSkeleton from "./CardSkeleton.js";

import "./ThemePage.css";
import { background } from '@chakra-ui/react';

const ThemePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState([]);

  const closeModal = () => {
    setModalOpen(false);
  }

  useEffect(() => {
    if(datas.length > 0) {
      localStorage.setItem("situationId", datas[selected].situationId);
    }
  }, [datas, selected]);

  useEffect(() => {
    


    const fetchData = async () => {
      try {
        const res = await call('/api/v1/situations', 'GET');
        setDatas(res.situations);
        setLoading(false); 
      } catch (error) {
        console.error("Error :", error);
        setLoading(false);  
      }
    };

    fetchData();
  }, []);

  const getImageUrl = (url) => {
    const isValidUrl = (url) => {
      return url && url.startsWith('http');
    };

    return isValidUrl(url) ? url : "https://picsum.photos/400"; // 랜덤 이미지로 사용할 기본 URL
  };

  return(
    <div>
      <Header/>

      <div className="card-container" >
        {loading ? (
          // 로딩 중일 때 스켈레톤 표시
          Array(4).fill().map((_, index) => <CardSkeleton key={index} />)
        ) : (
          // 데이터가 로딩된 후 카드 표시
          <>
            {datas.map((data, index) => (
              <Card setSelected={setSelected} setModalOpen={setModalOpen} key={index} Data={data} index={index} />
            ))}
            <div className="card-comingsoon" style={{backgroundImage: `url('/images/theme/coming_soon.png')`}}>Coming Soon</div>
          </>
        )}
      </div>

      {datas.length > 0 && (
        <ThemeModal open={modalOpen} close={closeModal} >
          <img className="modal-img" src={getImageUrl(datas[selected].imgUrl)} alt={datas[selected].title} />
          <div className="modal-title">{datas[selected].title}</div>
          <div className="modal-sinario">시나리오</div>
          <div className="modal-desc">{datas[selected].description}</div>
        </ThemeModal>
      )}

      
    </div>
  )
}

export default ThemePage;