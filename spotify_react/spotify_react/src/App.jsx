import { useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import './App.css'
import SongBlock from './SongBlock.jsx';
import SongButton from './SongButton.jsx';
import SearchSongs from './SearchSongs.jsx';
import RegisterForm from './RegisterForm.jsx';
import LoginForm from './LoginForm.jsx';


const client_id = import.meta.env.VITE_CLIENT_ID;
const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const url = import.meta.env.VITE_SERVER_URL + "/message";
const limit = 5;

async function ping_server(){
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      alert(error);
      return -1;
  }
}

function App() {
  const [data, setData] = useState("waiting");

  const [showItem, setShowItem] = useState(0);

  return (
    <>
  
    {
      import.meta.env.VITE_DEBUG == "true" && 
        <div>
        <button onClick={(e)=>{
          ping_server().then((response)=>{
            setData(response.data.message)
          });
        }}>
        test server
        </button>
        {data}
        <p>{import.meta.env.VITE_SERVER_URL}</p>
      </div>
    }

      <span>
        <span>
          <button onClick = {e => {
              e.preventDefault(); 
              setShowItem(0)
            }}>
            home
          </button>
          <button onClick = {e => {
            e.preventDefault(); 
              setShowItem(1)
          }}>
            register
          </button>
          <button onClick = {e => {
            e.preventDefault(); 
              setShowItem(2)
          }}>
            login
          </button>
          <button onClick = {e => {
            e.preventDefault(); 
              setShowItem(3)
          }}>
            search
          </button>
          <button onClick = {e => {
            Cookies.remove('username');
            Cookies.remove('token');
            alert("logged out");
          }}>
          log out
          </button>
        </span>
        <div>
        {showItem == 0 && <p>home</p>}
        {showItem == 1 && <RegisterForm/>}
        {showItem == 2 && <LoginForm/>}
        {showItem == 3 && <SearchSongs/>}
        </div>
      </span>
    
    </>
  )
}

export default App
