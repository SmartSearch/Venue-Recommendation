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

      $("#div_user_id").text(uid);
      $("#div_user_token").text(accessToken);
      //fillFacebookCategories(uid,accessToken);
      //getRecommendations(uid,accessToken);
    }
  }
  
};

//+ Jonas Raoni Soares Silva
////@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
 for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

$(document).ready(function()
{
  var locations = {
  "london2": [
  {"lat":"51.51356883871274" ,"lng":"-0.135880708694458", "desc":"Soho"},
  {"lat":"51.507711596310884","lng":"-0.07349252700805664", "desc":"Tower Hill"},
  {"lat":"51.52007706893293","lng":"-0.10181665420532227", "desc":"Farringdon"},
  {"lat":"51.50450617445198","lng":"-0.10404825210571289", "desc":"Southwark"}
  ],
  "amsterdam": [
  {"lat":"52.373163" ,"lng":"4.892085", "desc":"Dam Square"},
  {"lat":"52.37519841097699", "lng":"4.882253408432007", "desc":"Bloemgracht"},
  {"lat":"52.35847087653222", "lng":"4.8795658349990845", "desc":"Paulus Potterstraat"},
  {"lat":"52.36436899242944", "lng":"4.918076992034912", "desc":"Plantage Middenlaan"}
  ],
  "sanfrancisco": [
  {"lat":"37.796668331204714" ,"lng":"-122.40173935890198", "desc":"Financial District"},
  //{"lat":"37.76923588359386", "lng":"-122.46977090835571", "desc":"Golden Gate Park"},
  {"lat":"37.779676814476936", "lng":"-122.40424990653992", "desc":"South of Market"}
  ]
  }

  var times = [
  {"id":"12","name":"12pm"},
  {"id":"16","name":"4pm"},
  {"id":"20","name":"8pm"}
  ]

  var desc = {
  "london2": {"name": "London"} ,
  "amsterdam": {"name":"Amsterdam"},
  "sanfrancisco": {"name":"San Francisco"}
  }

  var user_id = null;
  var access_token = null;

  var user_loc = null;
  var user_time = null;
  var user_city = null;
  var user_hour = null;

  var shuffled_pool = null;



  $("#select_city").change( function() {
    user_id = $("#div_user_id").html();
    access_token = $("#div_user_token").html();
    if(user_id == "" && access_token == "") {
      $("#select_city").hide();
      $("#select_city").parent().append("<div class=\"alert alert-warning alert-dismissable\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button><strong>Warning:</strong> You need to log in with your Facebook account first.</div>");
    }
    else {
      var $form = $(this);
      $.ajax({
          type:'GET',
          url:"http://demos.terrier.org/geohash.json?user_id="+user_id+"&access_token="+access_token,
          context:$form,
          success: function() { // your success handler
          },
          error: function() { // your error handler
          },
          complete: function() {
  //          this.off('submit');
  //          this.submit();
            var city = $form.val();

            $form.parent().append("<p style='margin-top:10px;'>How much familiar are you with "+desc[city].name+"?</p><p class=\"radio_form\" style=\"margin:0 auto;width:600px;margin-bottom:20px;\"><input type=\"radio\" class=\"confidence\" name=\"confidence\" value=\"0\" />I have never been in this city.<br /><input type=\"radio\" class=\"confidence\" name=\"confidence\" value=\"1\" />I already visited this city.<br /><input type=\"radio\" class=\"confidence\" name=\"confidence\" value=\"2\" />I lived in this city.<br /></p>");

          }
      });
    }
  });

  $("#main").on('change','input[name=confidence]:radio', function() {
    var rel = $('input[type=radio]:checked').val();
    if(user_id != "" && access_token != "" && rel != null) {
      $("#begin").removeAttr("disabled");
      }
  });

  $("#begin").click( function(e) {
    $("#main").append("<center><p>Please wait, loading takes a few seconds...</p></center>");
    var d = new Date();
    var current_hour = d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':00:00';

    var rand = ($("#select_city").val() == "sanfrancisco") ? Math.floor((Math.random()*3)) : Math.floor((Math.random()*4));
    var loc = locations[$("#select_city").val()][rand];
    var time = times[Math.floor((Math.random()*3))];
    $(this).addClass('active'); 
    user_loc = loc;
    var rel = $('input[type=radio]:checked').val();
    var $form = $(this);
    $.ajax({
        type:'GET',
        url:"http://demos.terrier.org/assessment.json?user_id="+user_id+"&confidence="+rel+"&city="+$("#select_city").val(),
        context:$form,
        success: function() { // your success handler
        },
        error: function() { // your error handler
        },
        complete: function() {
          getPool(loc.lat,loc.lng,current_hour,('0'+d.getHours()).slice(-2),$("#select_city").val()); 
        }
    });
    //$("#main").empty();
  });

  function getPool(lat,lng,time,hour,city) {
    user_time = time;
    user_hour = hour;
    user_city = city;
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      contentType: "application/json",
      url: "http://demos.terrier.org/assessment.json?lng="+lng+"&lat="+lat+"&user_id="+user_id+"&city="+city+"&time="+time,
//      url: "http://demos.terrier.org/assessment.json?lng="+lng+"&lat="+lat+"&user_id="+user_id+"&city="+city,
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

    test = function(json_orig) {
      $("#begin").removeClass('active');
      startAssessments(json_orig);
    }
  }

  function startAssessments(pool) {
    $("#main").empty();
    
    shuffled_pool = shuffle(pool);
    assessVenue(0);
  }

  function assessVenue(index) {
    $("#main").append("<div style=\"margin:0 auto;margin-bottom:20px;width:600px;height:300px;\" class=\"gmap\" id=\"gmap\"></div>");

    var venue = [];
    venue.push(shuffled_pool[parseInt(index)]);
    venue.push({ title : 'current_user',
              lat   : user_loc.lat,
              lon   : user_loc.lng,
              icon  : 'http://maps.google.com/mapfiles/arrow.png',
              html  : '<strong>You current location</strong>',
              zoom  : 5 });

    var map = new Maplace();
    map.Load({
        locations: venue,
        generate_controls: false,
        });

    var hour = parseInt(user_hour) <= 12 ? user_hour+"am" : (parseInt(user_hour)-12)+"pm" ;

    $("#main").append("<p style=\"margin:0 auto;width:600px;margin-bottom:20px;\"><strong>Situation</strong>: you are in <span class='em'>"+user_loc.desc+", "+desc[user_city].name+"</span>, and the time is <span class='em'>"+hour+"</span>. Your current location is marked on the map above by a green arrow.</p>");
    $("#main").append("<p style=\"margin:0 auto;width:600px;margin-bottom:20px;\">Given this situation, <span class='em'>how likely would you visit the venue described below (marked by a red bubble on the map)</span> in the next hour?</p>")
//    alert(JSON.stringify(shuffled_pool[parseInt(index)]));
//
    $("#main").append("<p class=\"radio_form\" style=\"margin:0 auto;width:600px;margin-bottom:20px;\"><input type=\"radio\" name=\""+user_id+","+user_loc.desc+","+user_city+","+user_time+","+shuffled_pool[parseInt(index)].foursquare_id+"\" value=\"0\">Not likely<br/><input type=\"radio\" name=\""+user_id+","+user_loc.desc+","+user_city+","+user_time+","+shuffled_pool[parseInt(index)].foursquare_id+"\" value=\"1\">Likely<br/><input type=\"radio\" name=\""+user_id+","+user_loc.desc+","+user_city+","+user_time+","+shuffled_pool[parseInt(index)].foursquare_id+"\" value=\"2\">Highly likely<br/></p>");
    
    $("#main").append("<div class=\"venue_display\">"+shuffled_pool[parseInt(index)].html+"</div>");

    $("#main").append("<center><a style=\"margin-top:20px;\" disabled=\"disabled\" class=\"next btn btn-success btn-lg\" role=\"button\" id=\""+(parseInt(index)+1)+"\">Next suggestion</a></center>");  

    $("#main").append("<div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\""+parseInt(index)+"\" aria-valuemin=\"1\" aria-valuemax=\""+shuffled_pool.length+"\" style=\"width: "+parseInt(index)*100/shuffled_pool.length+"%;\"></div></div>");
  }

  $("#main").on('click', '.next', function (e) {
    var assessment_id = $('input[type=radio]:checked').attr('name');
    var rel = $('input[type=radio]:checked').val();
    
    var $form = $(this);
    $.ajax({
        type:'GET',
        url:"http://demos.terrier.org/assessment.json?assessment_id="+assessment_id+"&rel="+rel,
        context:$form,
        success: function() { // your success handler
        },
        error: function() { // your error handler
        },
        complete: function() {
//          this.off('submit');
//          this.submit();
          $("#main").empty();
          
          if(parseInt($(this).attr('id')) == shuffled_pool.length)
            finishAssessments();
          else
            assessVenue($(this).attr('id'));
        }
    });


  });

  $("#main").on('change', 'input:radio', function (e) {
    $(".next").removeAttr("disabled");
  });


  $("#main").on('click', '#finish', function (e) {
    var comm = $("#comm").val();

    var $form = $(this);
    $.ajax({
        type:'GET',
        url:"http://demos.terrier.org/assessment.json?user_id="+user_id+"&comment="+comm+"&city="+(user_city+","+user_loc.desc),
        context:$form,
        success: function() { // your success handler
        },
        error: function() { // your error handler
        },
        complete: function() {
//          this.off('submit');
//          this.submit();
          window.location.href = "http://demos.terrier.org/SMART/venuesuggestion/assessments.html";
        }
    });

  });

  function finishAssessments() {
    $("#main").append("<p class=\"lead\">Thank you for having taken the time to complete this survey.</p>");
    $("#main").append("<p>If you have any comment for us, feel free to complete the form below:</p>");
    $("#main").append("<textarea id=\"comm\"></textarea>");
    $("#main").append("<p>Initial locations are randomly chosen from a predefined set: you can assess other venue in the same city if you want or try another city.</p>");
    $("#main").append("<center><a style=\"margin-top:20px;\" class=\"btn btn-success btn-lg\" role=\"button\" id=\"finish\">Complete</a></center>");  
  }

});
