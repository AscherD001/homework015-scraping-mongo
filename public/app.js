function init() {
  $("h1").css("left", window.innerWidth / 2 - 130);
}

window.addEventListener("resize", init);

$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<p data-id='" + 
    data[i]._id + "'><img style='float: left' height='96' width='96' src='" + 
    data[i].thumbnail + "'>" + 
    data[i].title + "<br />" + 
    data[i].link + "<br />" +
    data[i].summary + "</p>");
  }
});
  
$(document).on("click", "p", function() {
  $("#notes").empty();
  var thisId = $(this).attr("data-id");

  $.getJSON("/articles/" + thisId, function(data) {
    console.log(data);
    $("#notes").append("<h2>" + data.title + "</h2>");
    $("#notes").append("<input id='titleinput' name='title' >");
    $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
    $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
    if (data.note) {
      $("#titleinput").val(data.note.title);
      $("#bodyinput").val(data.note.body);
    }
  });
});
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");
  var note = {
    title: $("#titleinput").val(),
    body: $("#bodyinput").val()
  }
  $.post("/articles/" + thisId, note, function(data) {
    console.log(data);
    $("#notes").empty();
  });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});