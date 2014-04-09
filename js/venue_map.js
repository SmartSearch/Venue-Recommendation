/**
Copyright (C) 2014 Romain Deveaud <romain.deveaud@gmail.com> and the
SMART FP7 project <http://smartfp7.eu>.

This program is free software: you can redistribute it and/or modify
it under the terms of the Apache License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
*/

// Compatibility with older jQuery.
jQuery.fn.exists = function(){return jQuery(this).length>0;}

/** We condidere a predefined user location in the city center
 * of London. */
var user_location = "51.513657,-0.135594";
var user_lon      = "-0.135594";
var user_lat      = "51.513657";

/** Get the Facebook information from the user after he has been
 * identified. */
var user_id = $("#div_user_id").val();
var user_token = $("#div_user_token").val();

var json_global;

$(document).ready(function()
{
  /** When the user inputs some coordinates in the dedicated input
   * box, his location is changed and the recommendations are updated
   * accordingly. */
  $( "#location_form" ).submit( function(event) {
    // Spinner activation.
    $("button").addClass('active'); 

    // Get the coordinates values.
    user_location = $("input:first").val();
    user_lon = user_location.split(",")[1];
    user_lat = user_location.split(",")[0];

    // Reload the map.
    $("#gmap").empty();
    // Update the recommendations.
    getRecommendations(user_id,user_token);
    return false;
  });


  $("#sample_b").click( function(event) {
    $("#div_user_id").val("881725327");
    $("#div_user_token").val("");
    user_id = $("#div_user_id").val();
    user_token = $("#div_user_token").val();
    $("#location_form input").val(user_location); 
    $("#sample_user_alert_text").html($(this).text());
    $(".alert").show();
    $( "#location_form" ).submit();
  });

  $("#sample_a").click( function(event) {
    $("#div_user_id").val("594863415");
    $("#div_user_token").val("");
    user_id = $("#div_user_id").val();
    user_token = $("#div_user_token").val();
    $("#location_form input").val(user_location); 
    $("#sample_user_alert_text").html($(this).text());
    $(".alert").show();
    $( "#location_form" ).submit();
  });

  $("#east_london").click( function(event) {
    $("#location_form input").val("51.519265,-0.06163"); 
    $( "#location_form" ).submit();
  });

  $("#dam_square").click( function(event) {
    $("#location_form input").val("52.373163,4.892085"); 
    $( "#location_form" ).submit();
  });

  $("#zuis_dam").click( function(event) {
    $("#location_form input").val("52.353757,4.872219"); 
    $( "#location_form" ).submit();
  });

  $("#picca_london").click( function(event) {
    $("#location_form input").val("51.510065,-0.134672"); 
    $( "#location_form" ).submit();
  });

  $("#center_sf").click( function(event) {
    $("#location_form input").val("37.793982,-122.40843"); 
    $( "#location_form" ).submit();
  });

  $("#tp_sf").click( function(event) {
    $("#location_form input").val("37.7959969903121,-122.40651369094849"); 
    $( "#location_form" ).submit();
  });
  
  $("#byres_glasgow").click( function(event) {
    $("#location_form input").val("55.874914,-4.294134"); 
    $( "#location_form" ).submit();
  });

});

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function getObjectsSup(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjectsSup(obj[i], key, val));
        } else if (i == key && obj[key] > val) {
            objects.push(obj);
        }
    }
    return objects;
}

function getObjectsEqual(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjectsEqual(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function computeScores(json,current_hour) {
  for(i=0;i<json.length;++i) {
    json[i].score =  (json[i].facebook_score) * 
      (getObjectsEqual(json[i].forecast.neural_nets, 'dateString', current_hour)[0].prob);
  }
  return json;
}

function drawChart(ts,name,hour) {
  var d=new Date();
  var dd=new Date(d.getFullYear(),d.getMonth(), d.getDate(),d.getHours(), 0, 0, 0);
//  alert(dd.getTime()+" "+new Date(hour).getTime());
    
  $('#slider').highcharts('StockChart', {
      chart: {
        height:250
      },
      
      navigator: {
        handles: {
          backgroundColor: 'yellow',
          borderColor: 'red'
        }
      },

      scrollbar: {
            liveRedraw: false
      },

      yAxis: {
        min: 0,
        labels : {
          enabled:true
        }
      },
        
      xAxis: {
        min: new Date(hour).getTime(),
        max: ts[ts.length-1][0],
        events : {
          afterSetExtremes : function(e) {
            var thismax = this.max,
                thismin = this.min;
            if(thismin < dd.getTime() || thismax < ts[ts.length-1][0]) {
              var min = thismin < dd.getTime() ? dd.getTime() : thismin;
              var max = thismax < ts[ts.length-1][0] ? ts[ts.length-1][0] : thismax;
              var x = this;
              setTimeout(function(){ 
              x.setExtremes(min,max); //chart xAxis
              }, 1);
            }

            // Reload all recommendations based on a new hour.
            var new_date = new Date(this.min); 
            var new_hour = new_date.getFullYear()+'-'+
                          ('0'+(new_date.getMonth()+1)).slice(-2)+'-'+
                           ('0'+new_date.getDate()).slice(-2)+' '+
                           ('0'+new_date.getHours()).slice(-2)+':00:00';

            setTimeout(function(){ 
            drawMap(new_hour)
            },10);
          }
        }
      },
      
      rangeSelector: {
        enabled: false
      },
      
      title: {
        text : name
      },
      
      series: [{
        name: 'Predicted attendance ',
        data: ts
      }],
      
      exporting: {
        enabled: false
      }
  });
}

function timeSeries(venue) {
  ts = [];
  for(var i = 0 ; i < venue.forecast.neural_nets.length && i < 48 ; ++i) 
    ts.push([venue.forecast.neural_nets[i].timeInMilis,venue.forecast.neural_nets[i].value]);

  return ts;
}

function timeSeriesAll(json) {
  ts = [];
  for(var j = 0 ; j < json.length ; ++j) {
    var venue = json[j];
    if(venue.title == "current_user")
      continue;
    for(var i = 0 ; i < venue.forecast.neural_nets.length && i < 48 ; ++i) {
      if(ts[i] == null)
        ts.push([venue.forecast.neural_nets[i].timeInMilis,venue.forecast.neural_nets[i].value]);
      else
        ts[i][1] += venue.forecast.neural_nets[i].value;
    }
  }

  return ts;
}

function drawMap(current_hour) {
//  json = getObjectsSup(json, 'facebook_score', '0');
  json = computeScores(json_global, current_hour);
  var prop = "score";
  json = json.sort(function(a, b) {
    return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
  });
  json = sortByKey(json,'score').slice(0,20);

  drawChart(timeSeriesAll(json),"Suggested places",current_hour);

  var menu_score = {
  html_a: function (i, hash, ttl) {
  var self = this,
    index = hash || (i + 1),
    title = ttl || this.o.locations[i].title,
    score = ttl || this.o.locations[i].score,
    el_a = $('<a data-load="' + index + '" id="ullist_a_' + index + '" href="#' + index + '" title="' + title + '"><span> '+ (ttl != null ? '' : ((i+1) +". ")) + (title || ('#' + (i + 1))) + '</span></a>');

  if(title == 'current_user' || i >= 20)
    return;

  el_a.css(this.o.controls_applycss ? {
    color: '#666',
    display: 'block',
    padding: '5px',
    fontSize: this.o.controls_on_map ? '12px' : 'inherit',
    textDecoration: 'none'
  } : {});

  el_a.on('click', function (e) {
    e.preventDefault();
    var i = $(this).attr('data-load');
    self.ViewOnMap(i);
    if(i == "all")
      drawChart(timeSeriesAll(json),"Suggested places",current_hour);
    else
      drawChart(timeSeries(json[i-1]),json[i-1].title,current_hour);
  });

  return el_a;
},

activateCurrent: function (index) {
  this.html_element.find('li').removeClass('active');
  this.html_element.find('#ullist_a_' + index).parent().addClass('active');
},

getHtml: function () {
  var html = $("<ul class='ullist controls " + this.o.controls_cssclass + "'></ul>").css(this.o.controls_applycss ? {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  } : {}),
    title, a;

  if (this.ShowOnMenu(this.view_all_key)) {
    html.append($('<li></li>').append(menu_score.html_a.call(this, false, this.view_all_key, this.o.view_all_text)));
  }

  for (a = 0; a < this.ln; a++) {
    if (this.ShowOnMenu(a)) {
      html.append($('<li></li>').append(menu_score.html_a.call(this, a)));
    }
  }

  title = this.o.controls_title;
  if (this.o.controls_title) {
    title = $('<div class="controls_title"></div>').css(this.o.controls_applycss ? {
      fontWeight: 'bold',
      padding: '3px 10px 5px 0',
      fontSize: this.o.controls_on_map ? '12px' : 'inherit'
    } : {}).append(this.o.controls_title);
  }

  this.html_element = $('<div class="wrap_controls"></div>').append(title).append(html);

  return this.html_element;
  }};

  json.push({ title : 'current_user',
              lat   : user_lat,
              lon   : user_lon,
              icon  : 'http://maps.google.com/mapfiles/arrow.png',
              html  : '<strong>You current location</strong>'});

  $("#gmap").html('');

  var map = new Maplace();
  map.AddControl('custom',menu_score);
  map.Load({
        locations: json,
        controls_type: 'custom',
        controls_on_map: false,
        view_all_text: 'Suggested places'
    });

  google.maps.event.addListener(map.oMap, 'dblclick', function(event) {
    $("#location_form input").val(event.latLng.lat()+","+event.latLng.lng()); 
    $( "#location_form" ).submit();
  });

  $("button").removeClass('active'); 
}

function getRecommendations(uid,access_token) {
//  alert("&user_id="+uid+"&access_token="+access_token);
  user_id = uid;
  user_token = access_token;
//  alert(user_id);
//  alert(user_token);
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    contentType: "application/json",
    url: "http://demos.terrier.org/geohash.json?lng="+user_lon+"&lat="+user_lat+"&user_id="+uid+"&access_token="+access_token,
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
    json_global = json_orig;
    var d = new Date();
    var current_hour = d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':00:00';
//    $('#results').html(JSON.stringify(json));
    drawMap(current_hour);
  }
}
