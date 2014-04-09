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

      $("#user_id").val(uid);
      $("#access_token").val(accessToken);
      //fillFacebookCategories(uid,accessToken);
      //getRecommendations(uid,accessToken);
    }
  }
  
};

$(document).ready(function()
{
  var start = new Date();

  $("#mturk_form").submit( function(e) {
    e.preventDefault();
    e.returnValue = false;

    var valid = true;
    var test = $("#mturk_form option:selected").each ( function() {
      if($(this).val() == "Rate me") { 
        valid = false;
        $("#form_not_valid").show();
      }
    });
//    alert($("#mturk_form option:selected").val() == "");
//
    if(valid) {
      var uid = $("#user_id").val();
      var access_token = $("#access_token").val();

      if(uid == "" || access_token == "") {
        valid = false;
        $("#not_connected").show();
      }
      else {
        var $form = $(this);
        $("#time_spent").val(new Date() - start);

        $.ajax({
            type:'GET',
            url:"http://demos.terrier.org/geohash.json?user_id="+uid+"&access_token="+access_token,
            context:$form,
            success: function() { // your success handler
            },
            error: function() { // your error handler
            },
            complete: function() {
              this.off('submit');
              this.submit();
            }
        });
        /*
        $.ajax({
          type: "GET",
          dataType: "jsonp",
          contentType: "application/json",
          url: "http://demos.terrier.org/geohash.json?user_id="+uid+"&access_token="+access_token,
          jsonpCallback:'test',
          done: function (data) {
              console.log("success");
              console.log(data);
          },
          fail: function (error) {
              console.log("error");
              console.log(error);
          },
        });

        test = function(response) {
          alert("bouh");
        }
        */
      }
    }
  });
});
