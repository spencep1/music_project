import { useState } from 'react'
import axios from 'axios';
import { terminal } from 'virtual:terminal'
import Cookies from 'js-cookie';
import SongButton from './SongButton.jsx';

function SongBlock({track}){
  	var id=track.id 
  	var score=track.score 
  	var user_score=track.user_score

	const [trackScore, setTrackScore] = useState(score);
  	const [rating, setRating] = useState(user_score);
  	const [userRating, setUserRating] = useState(user_score);

  	var innerhtml = '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/' + id +'" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
	return  (
	<div class="song_display">
	<div class = "card">
      <img 
            src={track.url}
          />
      <div>
      <p>
        {track.name + " by: "}&emsp;
       {track.artists.map(artist => <>{artist}{artist != track.artists[track.artists.length-1] && ", "}</>)}
      	</p>
      	<p>
      	{trackScore != "N/A" && <>{" "}score: {trackScore}/5</>}
		{trackScore == "N/A" && <>{" "}score: no score yet</>}
		</p>
		<p>
		{rating != "N/A" && <>{" "}your score: {rating}/5</>}
		{rating == "N/A" && <>{" "}your score: you have not scored yet</>}
		</p>
		<div>
		<label class="star-container">
		<input type="radio" id={"radio1"+id} checked={rating >= 1} onClick={e=>{
			document.getElementById("radio1"+id).checked = true;
			document.getElementById("radio2"+id).checked = false;
			document.getElementById("radio3"+id).checked = false;
			document.getElementById("radio4"+id).checked = false;
			document.getElementById("radio5"+id).checked = false;
			setRating(1);
		}}/>
		<div class="star"></div>
		</label>
		<label class="star-container">
		<input type="radio" id={"radio2"+id} checked={rating >= 2} onClick={e=>{
			document.getElementById("radio1"+id).checked = true;
			document.getElementById("radio2"+id).checked = true;
			document.getElementById("radio3"+id).checked = false;
			document.getElementById("radio4"+id).checked = false;
			document.getElementById("radio5"+id).checked = false;
			setRating(2);
		}}/>
		<div class="star"></div>
		</label>
		<label class="star-container">
		<input type="radio" id={"radio3"+id} checked={rating >= 3} onClick={e=>{
			document.getElementById("radio1"+id).checked = true;
			document.getElementById("radio2"+id).checked = true;
			document.getElementById("radio3"+id).checked = true;
			document.getElementById("radio4"+id).checked = false;
			document.getElementById("radio5"+id).checked = false;
			setRating(3);
		}}/>
		<div class="star"></div>
		</label>
		<label class="star-container">
		<input type="radio" id={"radio4"+id} checked={rating >= 4} onClick={e=>{
			document.getElementById("radio1"+id).checked = true;
			document.getElementById("radio2"+id).checked = true;
			document.getElementById("radio3"+id).checked = true;
			document.getElementById("radio4"+id).checked = true;
			document.getElementById("radio5"+id).checked = false;
			setRating(4);
		}}/>
		<div class="star"></div>
		</label>
		<label class="star-container">
		<input type="radio" id={"radio5"+id} checked={rating >= 5} onClick={e=>{
			document.getElementById("radio1"+id).checked = true;
			document.getElementById("radio2"+id).checked = true;
			document.getElementById("radio3"+id).checked = true;
			document.getElementById("radio4"+id).checked = true;
			document.getElementById("radio5"+id).checked = true;
			setRating(5);
		}}/>
		 <div class="star"></div>
		</label><SongButton id={track.id} score={track.score} user_score={track.user_score}/>
    	</div>

		</div>
		</div>

		<div class="song_embed" dangerouslySetInnerHTML={{__html: innerhtml}}></div>

      </div>);
}
export default SongBlock