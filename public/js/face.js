(function($) {

  var now = new Date();
  var colortolerance = 1000;
  var diff = 0;
  var oldstamp = Date.now();
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var month = months[now.getMonth()];

  $(".time-label .bg-green").text(now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear())

  var socketurl = "ws://" + window.location.href.replace(/.*?:\/\//g, "");
  var ws;

  connectSocket();
  $("button").prop("disabled", true)

  //annotateImage()

  function annotateImage(img, locations, ratios) {
    var eachLoc;
    var locs = locations.images[0].faces
    if (locs) {
      locs.forEach(function(each) {
        eachLoc = each.face_location;
        var popupDiv = img[0],
          width = window.getComputedStyle(popupDiv).width;

        console.log(img, img.prop("naturalWidth"), width)

        img.append(
          $('<div/>').css({
            position: 'absolute',
            top: eachLoc.top * ratios.y + 'px',
            left: eachLoc.left * ratios.x + 'px',
            width: eachLoc.width * ratios.x + 'px',
            height: eachLoc.height * ratios.y + 'px',
            border: "solid 3px yellow"
          })
        );
        var scoreabs = Math.ceil(each.gender.score * 10) % 5;
        var score = Math.ceil(each.gender.score * 10)
        var bgcolor = each.gender.score > 0.5 ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";
        console.log(bgcolor, scoreabs, score, each.gender.score)

        img.append(
          $('<div/>').css({
            position: 'absolute',
            top: ((eachLoc.top + eachLoc.height) * ratios.y) + 'px',
            left: eachLoc.left * ratios.x + 'px',
            width: eachLoc.width * ratios.x * each.gender.score + 'px',
            padding: '2px 2px 2px 4px',
            background: each.gender.score > 0.5 ? "green" : "red",
          }).html("&nbsp")
        );
        img.append(
          $('<div/>').css({
            position: 'absolute',
            top: ((eachLoc.top + eachLoc.height) * ratios.y) + 'px',
            left: eachLoc.left * ratios.x + 'px',
            width: eachLoc.width * ratios.x + 'px',
            padding: '2px 2px 2px 4px',
            color: 'white',
            "font-weight": 'bold',
            background: bgcolor,
          }).text(each.gender.gender)
        );

        //ctx.fillRect(eachLoc.left, eachLoc.top, eachLoc.width, eachLoc.height);
      })
    }

    var canvas = document.createElement('canvas');
    //console.log(url, locations)

    if (canvas.getContext) {
      // var ctx = canvas.getContext('2d');
      // var img = new Image();
      // img.src = url;
      // var eachLoc;
      // img.onload = function() {
      //   var hRatio = canvas.width / img.width;
      //   var vRatio = canvas.height / img.height;
      //   var ratio = Math.max(hRatio, vRatio);
      //   console.log(img.width, img.height)
      //   ctx.drawImage(img, 0, 0) //, 0, 0, img.width * ratio, img.height * ratio);
      //   ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
      //   var locs = locations.images[0].faces
      //   if (locs) {
      //     locs.forEach(function(each) {
      //       eachLoc = each.face_location;
      //       console.log(eachLoc)
      //       ctx.fillRect(eachLoc.left, eachLoc.top, eachLoc.width, eachLoc.height);
      //     })
      //   }
      //   //ctx.fillRect(0, 0, 1500, 500);
      // };
      //
      // $(canvas).insertAfter(".firstitem").hide().show("slow");

    }
  }

  function connectSocket() {
    ws = new WebSocket(socketurl);
    ws.onopen = function() {
      $(".disableoverlay").hide();
      $("button").prop("disabled", false)
      $(".firstitem").hide();
      console.log("Connection opened");
    };

    ws.onmessage = function(evt) {
      //console.log("event data:", evt.data);
      var data = JSON.parse(evt.data);

      var bgcolor = data.confidence >= 0.5 ? "bg-green" : "bg-red";
      var title = "";
      var timestamp = new Date(data.timestamp);
      timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + " " + months[timestamp.getMonth()] + " " +
        +timestamp.getDate() + " " + timestamp.getFullYear();
      var sender = data.sender;
      var image = "";
      var transcript = "";
      var visiontags = "";
      var html = "";
      var tags = "";
      var intent = "";
      var randid = String(Math.floor(Math.random() * 9e15))
      var faceurl = "/img/you.jpg"
      console.log("face url ...", data.faceurl)
      if (data.faceurl != null) faceurl = data.faceurl
      data.tags.forEach(function(tag) {
        tags = tags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
      })

      if (data.intent) {
        intent = "<div class='bg-yellow intent'> Matched Intent : " + data.intent + "</div>"
      }

      if (data.type == "vision") {
        image = "<div class='' style='position:relative' id='div" + randid + "'><img id='" + randid + "' class='img-responsive selectimage' src='" + data.imageurl + "' > </div>"
        liclass = "fa fa-camera fa-3x " + bgcolor;
        transcript = "";
        data.visiontags.forEach(function(tag) {
          visiontags = visiontags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
        });
        html = "<div class='col-md-12'> " +
          "<span class='bg-green updatetype'> <i class='fa  fa-camera'></i>  " + "Picture Taken. " + data.transcript + " </span> " +
          image +
          "<div class=''>" + tags + "</div>" +
          "<hr />" +
          "</div>";
        //if (data.facelocations) annotateImage(data.imageurl, data.facelocations)

      } else if (data.type == "speech") {
        transcript = "<div class='direct-chat-text chattext'> " + data.transcript + "</div>";
        var imgcol = "<div class='col-md-2 pad0'>   <img class='chatimg' src='/img/tj.jpg' alt='message user image'> <span class='sendertitle bg-green'> " + data.sender + " </span> </div>";
        var valcol = "<div class='col-md-10'> " +
          "<div class='row'>" +
          "<span class='bg-green updatetype'> <i class='fa  fa-wechat'></i>  " + data.type + " </span> " +
          "<span class='bg-green updatetype'> " + data.title + "</span> " +
          "<span class='direct-chat-timestamp pull-right'> " + timestamp + "</span> " +
          transcript +
          intent +
          "<div class='tagbox' >" + tags + "</div>";
        if (data.sender.toLowerCase() === "tjbot") {
          html = "<div class='margin10 row  '>" +
            imgcol +
            valcol +
            "</div>" +
            "</div>  " +
            "</div>  " + "<hr />";
        } else {
          html = "<div class='margin10 row  '>" +
            "<div class='col-md-10 right'> " +
            "<div class='row'>" +
            "<span class='bg-green updatetype'> <i class='fa  fa-wechat'></i>  " + data.type + " </span> " +
            "<span class='bg-green updatetype'> " + data.title + "</span> " +
            "<span class='direct-chat-timestamp pull-right'> " + timestamp + " &nbsp</span> " +
            transcript +
            intent +
            "<div class='tagbox' >" + tags + "</div>" +
            "</div>" + "</div>" +
            "<div class='col-md-2 pad0'>   <img class='chatimg' src='" + faceurl + "' alt='message user image'>  <span class='sendertitle bg-green'> " + data.sender + " </span>  </div>" +
            "</div>  " + "<hr />";
        }
      } else if (data.type == "tone") {
        transcript = "<div class='direct-chat-text chattext'> " + data.transcript + "</div>";
        console.log(data.tones);
        var tonebars = "";

        data.tones.forEach(function(tone) {
          var score = tone.score.toFixed(0) * 100;
          tonebars = tonebars + "<div class='mybar row'> " +
            "<div class='col-md-2 barlabel '> " + tone.tone_id + " ( " + score + " %) </div> " +
            "<div class='progress progress-xs active bartop'> " +
            "    <div class='progress-bar " + getColor(tone.tone_id) + " progress-bar-striped' role='progressbar' aria-valuenow=' " + score.toFixed(0) + " ' aria-valuemin='0' aria-valuemax='100' style='width: " + score.toFixed(0) + "%'></div>" +
            "</div>" +
            "</div>";
        })


        var imgcol = "<div class='col-md-2 pad0'>   <img class='chatimg' src='/img/tj.jpg' alt='message user image'> <span class='sendertitle bg-green'> " + data.sender + " </span> </div>";
        var valcol = "<div class='col-md-10'> " +
          "<div class='row'>" +
          "<span class='bg-green updatetype'> <i class='fa  fa-smile-o'></i>  " + data.type + " </span> " +
          "<span class='" + getColor(data.maxtone.tone_id) + " updatetype'> " + data.title + "</span> " +
          "<span class='direct-chat-timestamp pull-right'> " + timestamp + "</span> " +
          transcript +
          tonebars + "<div class='tagbox' >" + tags + "</div>";

        html = "<div class='margin10 row  '>" +
          imgcol +
          valcol +
          "</div>" +
          "</div>  " +
          "</div>  " + "<hr />";
      }
      $(html).insertAfter(".firstitem").hide().show("slow", function() {
        if (data.facelocations) {
          var img = document.getElementById(randid);
          var ratios = {
            x: img.clientHeight / img.naturalHeight,
            y: img.clientWidth / img.naturalWidth
          }
          annotateImage($("div#div" + randid), data.facelocations, ratios)
        }
      });

    };

    ws.onclose = function() {
      console.log("Connection is closed...");
      $(".disableoverlay").show();
      $(".firstitem").show();
      $("button").prop("disabled", true)

      setTimeout(function() {
        connectSocket();
      }, 3000)
    };
  }




  $("#listening").switchButton({
    width: 110,
    height: 40,
    button_width: 70,
    labels_placement: "right"
  })

  $("#listening").change(function() {

  })


  $("#lightbutton").click(function() {
    $('#lightbutton').colorpicker('show');
    //$('#cp8').focus();
    //console.log($('#cp8').data('colorpicker').color)
  })


  $('#lightbutton').colorpicker({
    customClass: 'colorpicker-2x',
    color: "green",
    sliders: {
      saturation: {
        maxLeft: 200,
        maxTop: 200
      },
      hue: {
        maxTop: 200
      },
      alpha: {
        maxTop: 200
      }
    }
  }).on('changeColor', function(e) {
    diff = (Date.now() - oldstamp);
    //console.log(diff, "diff..")
    if (diff > colortolerance) {
      $("#lightbutton").css("background-color", e.color.toString('hex'));
      $("#lightbutton").css("border-color", e.color.toString('hex'));

      console.log(e.color.toString('rgba'), e.color.toString('hex'))

      var message = {}
      message.event = "led"
      message.color = e.color.toString('hex');
      oldstamp = Date.now();
      ws.send(JSON.stringify(message));
    }
    //
  });

  $("#wavebutton").click(function() {
    var message = {}
    message.event = "wave"
    ws.send(JSON.stringify(message));
  })



  $("#seetextbutton").click(function() {
    var message = {}
    message.event = "seetext"
    ws.send(JSON.stringify(message));
  })

  var listeningstatus = false;
  $("#listeningbutton").click(function() {

    if (listeningstatus) {
      $("#listeningicon").attr("class", "fa  fa-toggle-off fa-2x");
      listeningstatus = false;
      $("#listeningtext").text("OFF")
    } else {
      $("#listeningicon").attr("class", "fa  fa-toggle-on fa-2x")
      listeningstatus = true;
      $("#listeningtext").text("ON")
    }

    var message = {}
    message.event = "listening"
    message.value = listeningstatus;

    ws.send(JSON.stringify(message));
    console.log(listeningstatus)
  })

  var facedetectstatus = false;
  $("#facedetectbutton").click(function() {
    if (facedetectstatus) {
      $("#facedetecticon").attr("class", "fa  fa-toggle-off fa-2x");
      facedetectstatus = false;
      $("#facedetecttext").text("OFF")
    } else {
      $("#facedetecticon").attr("class", "fa  fa-toggle-on fa-2x")
      facedetectstatus = true;
      $("#facedetecttext").text("ON")
    }
    var message = {}
    message.event = "detectface"
    message.value = facedetectstatus;

    ws.send(JSON.stringify(message));
    console.log(facedetectstatus)
  })

  var tonestatus = false;
  $("#tonebutton").click(function() {
    if (tonestatus) {
      $("#toneicon").attr("class", "fa  fa-toggle-off fa-2x");
      tonestatus = false;
      $("#tonetext").text("OFF")
    } else {
      $("#toneicon").attr("class", "fa  fa-toggle-on fa-2x")
      tonestatus = true;
      $("#tonetext").text("ON")
    }
    var message = {}
    message.event = "tone"
    message.value = tonestatus;

    ws.send(JSON.stringify(message));
    console.log(tonestatus)
  })
  $("#speaksendbutton").click(function() {
    sendSpeakMessage();
  })

  $("#speakinputmessage").keypress(function(e) {
    if (e.which == 13) {
      //sendSpeakMessage();
      $("#speaksendbutton").click();
    }
  })


  function sendSpeakMessage() {
    var message = {}
    message.event = "speak"
    message.value = $("#speakinputmessage").val()
    if (message.value != "") {
      ws.send(JSON.stringify(message));
    }
    $("#speakinputmessage").val("");
  }



  $("#seebutton").click(function() {
    var message = {}
    message.event = "see"
    ws.send(JSON.stringify(message));
  })

  $("#dancebutton").click(function() {
    var message = {}
    message.event = "dance"
    ws.send(JSON.stringify(message));
  })

  $(document).keypress(function(e) {

  });



  function showUpdateMessage(title, message, buttontitle) {
    processing = true;
    $("#updatetitle").text(title);
    $("#updatemessage").html(message);
    $("#updatebutton").text(buttontitle);

    $('#updatemodal').modal({
      show: true
    })
  }

  function getColor(tone) {
    var bgcolor = ""
    switch (tone) {
      case 'anger':
        bgcolor = "bg-red"
        break;
      case 'disgust':
        bgcolor = "bg-purple"
        break;
      case 'fear':
        bgcolor = "bg-green"
        break;
      case 'joy':
        bgcolor = "bg-yellow"
        break;
      case 'sadness':
        bgcolor = "bg-blue"
        break;
    }

    return bgcolor;
  }



})(jQuery);
