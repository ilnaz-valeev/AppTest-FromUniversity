// Home.js
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Выберите предмет</h1>
      <Link to="/test/microbiology">
        <button>Микробиология</button>
      </Link>
      <Link to="/test/biochemistry">
        <button>Биохимия</button>
      </Link>
    </div>
  );
};

export default Home;
