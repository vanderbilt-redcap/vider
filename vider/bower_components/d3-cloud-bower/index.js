
console.log("canvas1");
var Canvas = require("canvas"),
    globals = {};
console.log("canvas2");

// stash globals
if ("Canvas" in global) globals.Canvas = global.Canvas;
global.Canvas = Canvas;

module.exports = require("./d3.layout.cloud");

// restore globals
if ("Canvas" in globals) global.Canvas = globals.Canvas;
else delete global.Canvas;
