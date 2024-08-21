import React, { useState, useEffect } from 'react';
import { call } from '../../service/ApiService.js';

import Header from "../../components/Header.js";
import Card from "./Card.js"
import Datas from "./DummyData.js";
import Modal from "../../components/Modal.js";

import "./ThemePage.css";

const ThemePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [datas, setDatas] = useState([]);

  const openModal = () => {
    setModalOpen(true);
  }
  const closeModal = () => {
    setModalOpen(false);
  }

  useEffect(() => {
if(datas.length > 0) {
    localStorage.setItem("situationId", selected);
  }, [selected]);

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
        {Datas.map((Data, index) => (
          <Card setSelected={setSelected} setModalOpen={setModalOpen} key={index} Data={Data} index={index} />
        ))}
      </div>
      
      <Modal open={modalOpen} close={closeModal} >
        <img className="modal-img" src={Datas[selected].img} alt="{Datas[selected].title}" />
        <div className="modal-title">{Datas[selected].title}</div>
        <div className="modal-sinario">시나리오</div>
        <div className="modal-desc">{Datas[selected].description}</div>
      </Modal>
    </div>
  )
}

export default ThemePage;