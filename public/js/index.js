(function($) {
    var now = new Date();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = months[now.getMonth()];

    $(".time-label .bg-green").text(now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear())

    var socketurl = "ws://" + window.location.href.replace(/.*?:\/\//g, "");
    var ws = new WebSocket(socketurl);

    ws.onopen = function() {
        $(".disableoverlay").remove();
        $(".firstitem").remove();
        console.log("Connection opened");
    };

    ws.onmessage = function(evt) {
        console.log("event data:", evt.data);
        var data = JSON.parse(evt.data);

        var bgcolor = data.confidence >= 0.5 ? "bg-green" : "bg-red";
        var liclass = "fa fa-bullhorn fa-3x" + bgcolor;
        var timestamp = new Date(data.timestamp);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + " " + months[timestamp.getMonth()] + " " +
            +timestamp.getDate() + " " + timestamp.getFullYear();
        var sender = data.sender;
        var image = "";
        var transcript = data.transcript;
        var visiontags = ""
        if (data.type == "vision") {
            image = "<img class='img-responsive padbottom10' src='" + data.imageurl + "' >"
            liclass = "fa fa-camera fa-3x " + bgcolor;
            transcript = "";
            data.visiontags.forEach(function(tag) {
                visiontags = visiontags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
            })
        }


        var tags = ""
        data.tags.forEach(function(tag) {
            tags = tags + "<a class='tagframe bg-green btn' href= '" + tag.url + "'> " + tag.title + "</a>";
        })

        var html = "<li>" +
            "<i class = '" + liclass + "'></i> " +
            "<div class='timeline-item'>" +
            "<span class='time'><i class='fa fa-clock-o  '></i> &nbsp" + timestamp + "</span>" +
            "<h3 class='timeline-header'><a href='#'>" + data.type + "</a> " + data.title + "</h3>" +
            "<div class='timeline-body'>" + image +
            "<span class='transcript'>" + transcript + "</span>" +
            "</div>" +
            "<div class=''>" + tags + "</div>" +
            "</div>" +
            "</div> </li>";

        $(html).insertAfter(".time-label").hide().show("slow");

    };

    ws.onclose = function() {
        console.log("Connection is closed...");
    };

    $("#wavebutton").click(function() {
        var message = {}
        message.event = "wave"
        ws.send(JSON.stringify(message));
        console.log("sent: ", JSON.stringify(message));
        //console.log($('#cp8').data('colorpicker').color)
    })



    // <li>
    //   <i class="fa fa-user bg-aqua"></i>
    //   <div class="timeline-item">
    //     <span class="time"><i class="fa fa-clock-o"></i> 5 mins ago</span>
    //     <h3 class="timeline-header no-border"><a href="#">Sarah Young</a> accepted your friend request</h3>
    //   </div>
    // </li>


})(jQuery);
