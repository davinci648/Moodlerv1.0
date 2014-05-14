$(document).ready(function(){

	//ensure we are on the right page
	//don't want to download any pdf in sight
	var curURL = window.location.href;
	
	var flag = false; //see if page is to be processed
	chrome.runtime.sendMessage({requestType: "getDownloadPageURLs"}, function(response) {
		for(a in response){
			if(response[a].url == curURL){
				flag = true;
				break;
			}
		}
		if(flag == false)return;
	
		var hrefs = new Array();
		$('a[href*="pdf"]').each(function(){
			var newEntry = new Object();
			newEntry.href = $(this).attr('href');
			newEntry.text = $(this).text();
			hrefs.push(newEntry);		
		});
		$('a[href*="doc"]').each(function(){
			var newEntry = new Object();
			newEntry.href = $(this).attr('href');
			newEntry.text = $(this).text();
			hrefs.push(newEntry);		
		});
		$('a[href*="ppt"]').each(function(){
			var newEntry = new Object();
			newEntry.href = $(this).attr('href');
			newEntry.text = $(this).text();
			hrefs.push(newEntry);		
		});		
		//Attempt to read local storage
		var docsDownloaded = []
		try{		
			//request background.js to send the list of documents downloaded as response
			//this needs to be done, as localStorage accessible from this page goes into the page's localStorage and not the extension's
			chrome.runtime.sendMessage({requestType: "getDocsDownloaded"}, function(response) {
				docsDownloaded = JSON.parse(JSON.parse(response.data));
				console.log("Response received from Background.js (in getDocsDownloaded): " + JSON.stringify(docsDownloaded));
				if(docsDownloaded == null)docsDownloaded = [] //if the entry is not present
				
				toDownload = [] //put those hrefs in here which are not duplicates
				//See if format of docsDownloaded is correct. Then check for duplicates and download
				try{
					for(href in hrefs){		
						var duplicate = false;  //check for duplicates
						for(a in docsDownloaded){
							if(docsDownloaded[a].url === hrefs[href].href){
								duplicate = true;
								break;
							}
						}
						if(duplicate == false){
							toDownload.push(hrefs[href]);
						}
					}
				}catch(e){
						console.log("Wrong format of docsDownloaded read from localStorage. Will start it afresh and also download all available files.");
						docsDownloaded = []
				}
				for(file in toDownload){
					try{
						var a = document.createElement('a'); //download the file
						a.href = toDownload[file].href;
						a.download = ''; // Filename
						a.click();
						//document.write(toDownload[file].href+"</br>");
					}catch(e){
						console.log("Error in downloading file " + toDownload[file]);
					}
					
					var newEntry = new Object();
					newEntry.url = toDownload[file].href;
					newEntry.text = toDownload[file].text;
					docsDownloaded.push(newEntry); //push into array. Will store it to localStorage later
				}
				//request background.js to store the minutes of the proceedings (ie. docsDownloaded)
				//this needs to be done, as localStorage accessible from this page goes into the page's localStorage and not the extension's
				console.log("Saving minutes of the proceedings");
				chrome.runtime.sendMessage({requestType: "setDocsDownloaded", data: JSON.stringify(docsDownloaded)}, function(response) {
					console.log("Response received from background.js (in setDocsDownloaded)" + JSON.stringify(response));
				});
			});
		}catch(e){
			console.log("Failed to load documentsDownloaded from localStorage. Will start with a fresh list");
			docsDownloaded = [];
		}
	});
});