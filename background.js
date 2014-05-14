var globalLinks = null, flag=false;

chrome.alarms.create("abc", {periodInMinutes: 30});

chrome.alarms.onAlarm.addListener(function(alarm){
	console.log("inside alarm handler");
	
	if(localStorage.getItem("lastChecked") == null)
	{
		localStorage.setItem("lastChecked", JSON.stringify(new Date().getTime()));
		console.log("Moodler: testing for new content");
	}
	else{
		if(((new Date().getTime()) - JSON.parse(localStorage.getItem("lastChecked"))) >= (24*60*60*1000))
		{
			flag = true;
			console.log("truified");
			globalLinks = JSON.parse(localStorage.getItem("ReadItLater"));
			
			for(i=0;i<globalLinks.length;i++)
			{
				console.log(globalLinks[i].url);
				chrome.tabs.create({"url": globalLinks[i].url, "active": false},function(tab){
					setTimeout(function(){chrome.tabs.remove(tab.id, function(){console.log();})}, 30000);
				});
			}
			setTimeout(function(){flag = false;console.log("falsified");}, 30000);
		}
		else
		{
			localStorage.setItem("lastChecked", JSON.stringify(new Date().getTime()));
		}
	}	
});

var addToList = function(info, tab) {
  chrome.tabs.query({
    'active': true,
    'windowId': chrome.windows.WINDOW_ID_CURRENT
  },

  function(tabs, newToRead) {
    var newTitle = tabs[0].title;
    var newURL = tabs[0].url;
    var newToRead = [];

    console.log('Adding ' + newTitle + ' -- ' + newURL);

    try {
      console.log('Attempting to load list');
      newToRead = JSON.parse(localStorage.getItem('ReadItLater'));

      // check for dupes
      var i = 0;
      var dupe = false;

      while((i < newToRead.length) && (dupe != true)) {
        if(newToRead[i].url == newURL) {
          alert("Duplicate entry -- not added");
          dupe = true;
        }
        i++;
      }

      if(dupe == false) {
        newToRead.push({
          'title': newTitle,
          'url': newURL
        });

        localStorage.setItem('ReadItLater', JSON.stringify(newToRead));
      }
    }

    // Error -- clear list
    catch (e) {
      console.log('Error: ' + e);

      // Clear list and add link
      newToRead = [];

      newToRead.push({
        'title': newTitle,
        'url': newURL
      });

      localStorage.setItem('ReadItLater', JSON.stringify(newToRead));
    }
  });
};

chrome.contextMenus.create({
  "title": "Saved URL's",
  "contexts": ["page", "selection", "image", "link"],
  "onclick": addToList
});

//indicates whether a login has been attempted. If it is then it will be set to true
//this is to ensure that we don't block the user's moodle by logging in more than the allowed no. of times with the wrong password.
var loginAttempted = false; 


//Handle requests to get documents downloaded from content pages
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    /*console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");*/
	if(request.requestType == "getDocsDownloaded"){
		//confirm that the request is from a tab
		if(!sender.tab){
			console.log("Background.js :- Error: 'getDowcsDownloaded' request received from an entity other than a tab.");
			sendResponse({message: "Damn you intruder!"});
			return;
		}
		var flag = false
		var allPages = JSON.parse(localStorage.getItem('documentsDownloaded'));
		for(a in allPages){
			if(allPages[a].pageURL == sender.tab.url){
				sendResponse({data: JSON.stringify(allPages[a].data)});
				flag = true;
				break;
			}
		}
		if(flag == false){
			sendResponse({data: null});
		}
	}
	else if(request.requestType == "closeTabWorkDone")
	{
		console.log("flag: " + flag);
		if(flag)
		{
			chrome.tabs.remove(sender.tab.id);
		}
	}
	else if(request.requestType == "setDocsDownloaded"){
		//confirm that the request is from a tab
		if(!sender.tab){
			console.log("Background.js :- Error: 'getDowcsDownloaded' request received from an entity other than a tab.");
			sendResponse({message: "Damn you intruder!"});
			return;
		}
		var current = JSON.parse(localStorage.getItem('documentsDownloaded'));
		if(current == null)current = []
		//current = []
		var flag = false;
		for(a in current){
			if(current[a].pageURL == sender.tab.url){
				current[a].data = request.data;
				flag = true;
				break;
			}
		}
		if(flag == false){
			var newElem = new Object();
			newElem.pageURL = sender.tab.url;
			newElem.data = request.data;
			current.push(newElem);
		}
		localStorage.setItem('documentsDownloaded', JSON.stringify(current));
	}
	else if(request.requestType == "attemptLogin"){
		//confirm that the request is from a tab
		if(!sender.tab){
			console.log("Background.js :- Error: 'attemptLogin' request received from an entity other than a tab.");
			sendResponse({message: "Damn you intruder!"});
			return;
		}
		user = localStorage.getItem("username");
		pass = localStorage.getItem("password");
		sendResponse({attempted: loginAttempted, username: user, password: pass});
		loginAttempted = true;
	}
	else if(request.requestType == "getDownloadPageURLs"){
		//confirm that the request is from a tab
		if(!sender.tab){
			console.log("Background.js :- Error: 'attemptLogin' request received from an entity other than a tab.");
			sendResponse({message: "Damn you intruder!"});
			return;
		}
		URLs = JSON.parse(localStorage.getItem('ReadItLater'));
		sendResponse(URLs);
	}
	else{
		console.log("Did not understand message: " + JSON.stringify(request));
		sendResponse({message: "I did not understand you. Please send legitimate messages, dumbass!"});
	}
  });