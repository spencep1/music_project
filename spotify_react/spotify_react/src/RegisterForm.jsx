import React, { useEffect, useState } from "react";
import axios from 'axios';

const url = import.meta.env.VITE_SERVER_URL + "/register";

function RegisterForm(){
	const  [username, setUsername] =  useState('');
	const  [password, setPassword] =  useState('');

    function usernameChange() {
        setUsername(event.target.value);
    }
    function passwordChange() {
        setPassword(event.target.value);
    };
    async function sendLogin(){
		try {
		    const response = await axios.post(url, {
		        username: username,
		        password: password
		     });
		    console.log(response);
			return response;
		} catch (error) {
			console.error(error);
			return -1;
		}
	};
    function submitRegister(){
    	sendLogin().then((response) => {
       		if(response == -1){
       			alert("unkown error");
       		}else if(response.data.error == true){
       			alert("error with registering process, try again");
       		}else if(response.data.duplicate_name == true){
       			alert("username with that name already exists");
       		}else if(response.data.registered == true){
       			alert("sucessfully registered");
       		}else{
       			alert("unkown error");
       		}
    	});
    }

	return  (
	<span>
		<form>
		    <label>Register User:
		    	<input  type="text"  value={username} onChange={usernameChange} />
		    	<input  type="text"  value={password} onChange={passwordChange} />
		    </label>
		    <button onClick = {e => {e.preventDefault(); submitRegister();}}>
	     		submit
	    	</button>
		</form>	
	</span>);
}
export default RegisterForm