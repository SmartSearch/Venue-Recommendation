window.fbAsyncInit = function() {
  //alert("---AsyncInit---");
  FB.init({
    appId : '200829093435999',
    status : true,
    cookie : true,
    xfbml : true
  });

  FB.Event.subscribe('auth.login', function() {
      /*
    if (window.chrome == undefined) {
      location.reload();
    }else{
      //alert("Refresh the page if you logged in for the first time.");
    }
    */
      location.reload();
  });


  FB.getLoginStatus(getUserCredentials);

  function getUserCredentials(response) {
    //alert(response.status);
    if (response.status === 'connected') {
      //alert("In Connected");
      // the user is logged in and connected to your
      // app, and response.authResponse supplies
      // the user's ID, a valid access token, a signed
      // request, and the time the access token 
      // and signed request each expire
      var uid = response.authResponse.userID;
      var accessToken = response.authResponse.accessToken;

      //fillFacebookCategories(uid,accessToken);
      getRecommendations(uid,accessToken);
    }
  }
  
};
