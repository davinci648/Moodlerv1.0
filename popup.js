function listCtrl($scope) {

  $scope.truncate = function(text) {
    var length = 45;
    var end = '...';

    if (text.length <= length) {
        return text;
    }

    else {
        return String(text).substring(0, length-end.length) + end;
    }
    return 'fuck';
  };

  $scope.appName = "Moodle";
  $scope.version = "1.0";

  $scope.listOptions = 
    [{
      'name':'ADD'
    },
    {
      'name':'CLEAR ALL'
    },
	{
		'name':'List of Downloaded files'
	}];

  // get toRead from storage
  ($scope.getList = function() {
    console.log('getting list...');

    try {
      var newToRead = JSON.parse(localStorage.getItem('ReadItLater'));
      console.log('got list');
      $scope.toRead = newToRead;

      for(var i = 0; i < $scope.toRead.length; i++) {
        console.log('[' + i + '] ' + $scope.toRead[i].title);
      }
    }
    catch (e) {
      console.log('Error: ' + e);
      console.log('Emptying list');
      $scope.toRead = [];
    }
  })();

  // when an item on the toRead list is clicked
  $scope.itemClicked = function(page) {
    chrome.tabs.create({ url: page.url });
  };

  $scope.removeItem = function(index) {
    $scope.toRead.splice(index, 1);
    localStorage.setItem('ReadItLater', JSON.stringify($scope.toRead));
  };

  $scope.moveUp = function(index) {
    if(index > 0) {
      var tempItem = $scope.toRead[index];
      $scope.toRead[index] = $scope.toRead[index - 1];
      $scope.toRead[index - 1] = tempItem;
    }
  };

  $scope.moveDown = function(index) {
    if(index < $scope.toRead.length - 1) {
      var tempItem = $scope.toRead[index];
      $scope.toRead[index] = $scope.toRead[index + 1];
      $scope.toRead[index + 1] = tempItem;
    }
  };

  $scope.addCurrentPage = function() {
      chrome.tabs.query({
        'active': true,
        'windowId': chrome.windows.WINDOW_ID_CURRENT
      },
      function(tabs) {
        var newTitle = tabs[0].title;
        var newURL = tabs[0].url;

        // check for dupes
        var i = 0;
        var dupe = false;

        while((i < $scope.toRead.length) && (dupe != true)) {
          if($scope.toRead[i].url == newURL) {
            alert("Duplicate entry -- not added");
            dupe = true;
          }
          i++;
        }

        if(dupe == false) {
          console.log('Adding ' + newTitle + ' -- ' + newURL);

          $scope.toRead.push({
            'title': newTitle,
            'url': newURL
          });

          localStorage.setItem('ReadItLater', JSON.stringify($scope.toRead));
          console.log(localStorage['ReadItLater']);
          $scope.$apply();
        }
      });
  };

  // when a list option is clicked
  $scope.listOptionClicked = function(option) {
    var newTitle;
    var newURL;

    switch(option.name.toLowerCase()) {
      case 'clear all':

        var confirmation = window.confirm('Are you sure you want to clear everything?');
        if(confirmation) {
          $scope.toRead = [];
          localStorage['ReadItLater'] = $scope.toRead;
        }
        break;

      case 'add':
        $scope.addCurrentPage();
        break;
		case 'list of downloaded files':
			window.open('saved_files.html');
			break;
      default:
        console.log('Something went wrong.');
    }
  };
}