import React, { useState } from 'react';
import Modal from './components/Modal.js';

const TestPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  }
  const closeModal = () => {
    setModalOpen(false);
  }

  return (
    <>
      <button onClick={openModal}>모달 팝업 버튼</button>

      <Modal open={modalOpen} close={closeModal} data="">
        sdfdf
      </Modal>
    </>
  )
}

export default TestPage;