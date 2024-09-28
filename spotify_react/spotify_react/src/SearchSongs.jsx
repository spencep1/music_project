import { useState } from 'react'
import axios from 'axios';
import './App.css'
import SongBlock from './SongBlock.jsx';
import SongButton from './SongButton.jsx';
import Cookies from 'js-cookie';


const client_id = import.meta.env.VITE_CLIENT_ID;
const client_secret = import.meta.env.VITE_CLIENT_SECRET;
const url = import.meta.env.VITE_SERVER_URL + "/post";
const limit = 5;

async function search_terms(search_term, limit, offset){
    try {
      const response = await axios.get(url, {
        params: {
          search_term: search_term,
          limit: limit, 
          offset: offset,
          username: Cookies.get("username"),
          token: Cookies.get("token")
        }
      });
      console.log(response);
      return response;
    } catch (error) {
      alert(error);
      return -1;
  }
}

function SearchSongs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [trackList, setTrackList] = useState([]);
  const [offset, setOffset] = useState(0);

  return (
    <div>
      {
        import.meta.env.VITE_DEBUG == "true" && <>
        <p> current offset {offset} </p>
        <p>client id {client_id}</p>
        <p>client secret {client_secret}</p></>
      }
      <input value={searchTerm} onChange={ e => {
        setSearchTerm(e.target.value);
        setTrackList([]);
        setOffset(0);
      }}/>
      <p>{searchTerm}</p>

      <ul>
        {trackList.map(track => (
            <li><SongBlock track={track}/></li>
        ))}
      </ul>
      <button onClick = {()=>{
          search_terms(searchTerm, limit, offset).then((response)=>{
          setOffset(Number(response.data.offset) + limit)
          setTrackList(trackList.concat(response.data.array))
        });
      }}>{offset == 0 && <p>Search</p>}{offset != 0 && <p>Load More Posts</p>}</button>

    </div>
  )
}

export default SearchSongs
