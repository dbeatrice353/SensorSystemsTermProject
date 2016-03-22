/*
David Beatrice

This js simuates the network behavior of a sensor node, enabling us to
test the respective server-side code.

The code does 2 things:

1) send periodic "hello" messages back to the server, indicated that this
   node is still alive.

2) send "alert" messages to the server whenever the sensor has been triggered.
   In this case, a button on the html page is used to initiate the "alert"
   message.

*/

// send an alert back to the server
function send_alert(){
  console.log(Date() + " *alert sent*");
  // send the post
  $.post("/alert",  // destination
          {node_id:1},  // data
          function(data,status){  //callback
              alert("Data: " + data + "\nStatus: " + status);
          });
}

// bind the alert dispacher "send_alert" to the button
function bind_alert_to_button(){
  document.getElementById("alert").onclick = send_alert;
}

// send periodic "hello" messages back to the server
function say_hello(){
  var hello_period = 3; // seconds between each "hello"
  setInterval(function(){
      console.log(Date() + " *hello sent*");
    }, hello_period*1000);
}

bind_alert_to_button();
say_hello();
