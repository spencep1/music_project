import { useState } from 'react'
import axios from 'axios';
import { terminal } from 'virtual:terminal'
import Cookies from 'js-cookie';

const url = import.meta.env.VITE_SERVER_URL + "/post";

async function push_rating(spotify_id, rating_score){
    try {
        const response = await axios.post(url, {
            spotify_id: spotify_id,
            rating_score: rating_score,
            username: Cookies.get("username"),
			token: Cookies.get("token")
         });
      	return response;
    } catch (error) {
      alert(error);
      return -1;
  }
}


function SongButton({id, score, user_score}){
  const [trackScore, setTrackScore] = useState(score);
  const [rating, setRating] = useState(user_score);
  const [userRating, setUserRating] = useState(user_score)


	return  (
	<div style={{display: 'inline-block', width: '50%', height: '50%'}}>
		<button onClick={()=>{
			var newscore = push_rating(id, rating).then((response)=>{
				if(response.data.error && !response.data.log_in){
					alert("please log in")
				}else{
					setTrackScore(response.data.score);
				}
	         });
		}}>
		submit rating
		</button>
	</div>
	);
}
export default SongButton