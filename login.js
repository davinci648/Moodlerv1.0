$(document).ready(function(){
	//check whether we have already attempted a login to avoid logging in multiple times with the wrong username and/or password
	chrome.runtime.sendMessage({requestType: "attemptLogin"}, function(response) {
		console.log("Response to 'attemptLogin' request received from Background.js: " + JSON.stringify(response));
		if(!response.attempted){
			if(response.username != null && document.getElementById("username").value == "")
				document.getElementById("username").value = response.username;
			if(response.password != null && document.getElementById("password").value == "")
				document.getElementById("password").value = response.password;
			$("#login").submit(); //go ahead and login. Next time, background.js will send a false value
		}
	});
});