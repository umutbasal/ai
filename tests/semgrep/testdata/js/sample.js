// Test file for JavaScript patterns
function testFunction() {
  console.log("Debug message");
  console.log("Another debug");
  return true;
}

function dangerousFunction() {
  eval("some code");
  Function("return code")();
  return null;
}

function safeFunction() {
  safe_eval("some code");
  return null;
}

function apiFunction() {
  fetch("https://api.example.com");
  fetch("https://api2.example.com");
  return null;
}

function assignmentTest() {
  let x = 10;
  x = 20;
  return x;
}

function oldAPICall() {
  oldAPI.call(arg1, arg2);
  oldAPI.call(arg3);
  return null;
}
