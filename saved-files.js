$(document).ready(function(){
	var list = JSON.parse(localStorage.getItem('documentsDownloaded'));
	//document.write("Venky is awesome");
	var title = JSON.parse(localStorage.getItem("ReadItLater"));
	for(var i=0;i<list.length;i++)
	{
		var msg = "";
		var pageTitle = list[i].pageURL;
		for(a in title){
			if(title[a].url == list[i].pageURL){
				pageTitle = title[a].title;
			}
		}
		msg += "<h2><a href='"+list[i].pageURL+"'>"+pageTitle+"</a></h2><br />";
		msg += "<br />";
		
		var efg = JSON.parse(list[i].data);
			for(var j=0;j<efg.length;j++)
				{
					msg += "<a href='"+ efg[j].url + "'>" + efg[j].text + "</a><br />";
				}
				
		msg += "<br /><br />";
		$("#savedFiles").append(msg);
	}
});