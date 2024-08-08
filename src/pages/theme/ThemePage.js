import React, { useState } from 'react';

import Header from "../../components/Header.js";
import Card from "./Card.js"
import Datas from "./DummyData.js";
import Modal from "../../components/Modal.js";

import "./ThemePage.css";

const ThemePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  const openModal = () => {
    setModalOpen(true);
  }
  const closeModal = () => {
    setModalOpen(false);
  }


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