function SongBlock({name, artists, id, image_url}){
	return  (
	<div>
		<img 
	        src={image_url} 
	      />
		<p>
			{name + " by: "}&emsp;
			{artists}
		</p>
	</div>);
}
export default SongBlock