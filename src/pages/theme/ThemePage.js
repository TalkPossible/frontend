import React, { useState } from 'react';

import Header from "../../components/Header.js";
import Card from "./Card.js"
import Datas from "./DummyData.js";
import Modal from "../../components/Modal.js";

import "./ThemePage.css";

const ThemePage = () => {
  const [modalOpen, setModalOpen] = useState(false);

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
          <Card openModal={openModal} key={index} Data={Data}/>
        ))}
      </div>

      <Modal open={modalOpen} close={closeModal} data="">
        sdfdf
      </Modal>
    </div>
  )
}

export default ThemePage;