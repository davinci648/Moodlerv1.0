function save_options() {
  var user = document.getElementById("mailid");
  var pass = document.getElementById("passd");
  
  //SECURITY ISSUE: This sort of a local storage has to be insecure. Even the browser's password manager is insecure.
  localStorage["username"] = user.value;
  localStorage["password"] = pass.value;
	var courses=new Array();
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
	window.close();
  }, 750);
}
//courses.push(prompt("Enter a course URL:"));

//var temp = prompt("a");
// Restores select box state to saved value from localStorage.
function restore_options() {
  var user = localStorage["username"];
  var pass = localStorage["password"];
  if (!user || !pass) {
    return;
  }
  document.getElementById("username").value = user;
  document.getElementById("password").value = pass;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);