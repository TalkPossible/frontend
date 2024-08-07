import React from 'react';

import Header from "../../components/Header.js";
import Card from "./Card.js"
import Datas from "./DummyData.js";

import "./ThemePage.css";

const ThemePage = () => {

  return(
    <div>
      <Header/>

      <div className="card-container" >
        {Datas.map((Data, index) => (
          <Card key={index} Data={Data}/>
        ))}
      </div>
    </div>
  )
}

export default ThemePage;