import React from 'react';

import '../assets/css/Modal.css';

const Modal = (props) => {
  const { open, close, data } = props;

  return (
    <div className={open? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <button className='close' onClick={close}>
            &times;
          </button>
          <main>{props.children}</main>
          <button className='startBtn' >
            시작하기
          </button>
        </section>
      ) : null}
    </div>
  );
};

export default Modal;