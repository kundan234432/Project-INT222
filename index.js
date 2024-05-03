var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "text/x-c++src",
  theme: "dracula",
  lineNumbers: true,
  autoCloseBrackets: true,
});
var width = window.innerWidth;
editor.setSize(0.6 * width, "600");

//****************************************SOCKET IO **************************************
const socket = io();
var programmaticChange = false; // Flag to track programmatic changes
console.log(socket);
// Listen for changes in the editor
editor.on("change", () => {
  // Only emit 'message' event if the change was made by the user
  if (!programmaticChange) {
    socket.emit("message", editor.getValue());
    console.log(editor.getValue());
  }
});

var flag = false;
var input = document.getElementById("input");
var output = document.getElementById("output");
var run = document.getElementById("run");
var option = document.getElementById("autoSizingSelect");
socket.on("recieved", (message) => {
  console.log(message);
  // Set flag to true before setting the value programmatically
  programmaticChange = true;
  editor.setValue(message);
  // Reset flag to false after setting the value
  programmaticChange = false;
});
socket.on("newOutput", (message) => {
  flag = true;
  console.log("NewOuput:" + message);
  output.value = message;
  flag = false;
});
//**************************************************************************************************

option.addEventListener("change", () => {
  if (option.value == "Java") {
    editor.setOption("mode", "text/x-java");
  } else if (option.value == "Python") {
    editor.setOption("mode", "text/x-python");
  } else {
    editor.setOption("mode", "text/x-c++src");
  }
});
run.addEventListener("click", async () => {
  code = {
    code: editor.getValue(),
    input: input.value,
    lang: option.value,
  };
  var oData = await fetch("http://localhost:3002/compile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(code),
  });
  var d = await oData.json();
  output.value = d.output;
  var val = await d.output;
  socket.emit("output", val);
  console.log("Hello: " + val);
});
