import React, { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';

const url = import.meta.env.VITE_SERVER_URL + "/login";

function LoginForm(){
	const  [username, setUsername] =  useState('');
	const  [password, setPassword] =  useState('');

    function usernameChange() {
        setUsername(event.target.value);
    }
    function passwordChange() {
        setPassword(event.target.value);
    };
    async function sendLogin(){
    	if (Cookies.get('token') && Cookies.get('username')) {
    		alert("already logged in");
		} else {
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
		}
	};
    function submitLogin(){
    	sendLogin().then((response) => {
       		if(response == -1){
       			alert("unkown error");
       		}else if(response.data.error == true){
       			alert("error with login process, try again");
       		}else if(response.data.log_in_sucess == true){
       			Cookies.remove('username')
       			Cookies.remove('token')
       			Cookies.set('username', username, { expires: 999999});
       			Cookies.set('token', response.data.token, { expires: 999999});
       			alert("sucessfully log in" + username + " " + response.data.token);
       		}else if(response.data.invalid_name == true){
       			alert("invalid username");
       		}else if(response.data.invalid_password == true){
       			alert("invalid password");
       		}else{
       			alert("unkown error");
       		}
    	});
    }

	return  (
	<span>
		<form>
		    <label>Login:
		    	<input  type="text"  value={username} onChange={usernameChange} />
		    	<input  type="text"  value={password} onChange={passwordChange} />
		    </label>
		    <button onClick = {e => {e.preventDefault(); submitLogin();}}>
	     		submit
	    	</button>
		</form>	
	</span>);
}
export default LoginForm