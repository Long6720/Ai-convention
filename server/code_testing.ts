import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
var title = "bad example";
const APP_component = (Props: any) => {
  const [DATA, setDATA] = useState();
  const [counter, setCounter] = useState(0);
  const handleclick = () => {
    setCounter(counter + 1);
    console.log("counter:", counter);
  };
  useEffect(() => {
    axios.get("http://example.com/data").then((res) => {
      setDATA(res.data);
    });
  }, []);
  function renderlist() {
    return DATA.map((item: any, index: number) => {
      return <div>{item.name}</div>; // missing key
    });
  }
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => handleclick()}>Click</button>
      {renderlist()}
    </div>
  );
};

export default APP_component;
