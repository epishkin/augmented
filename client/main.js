var width = 800,
    height = 600;

var amplitude = 400
var realWidth = amplitude * 2;

var uiData = [
    {name:"One WTC", offset:100},
    {name:"Empire State Bldg", offset:300},
    {name:"Central Park", offset:500}];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

var x = 0;
var selectedNode = 1;

function swipe() {
    var size = uiData.length
    var translated = Math.floor((x + amplitude) / realWidth * size);
    selectedNode = translated;

    update();
    console.log("x: " + x + ", selected: " + selectedNode);
}

function moveFinger(dx) {
    return function(event) {
        x += dx;
        if (x >= amplitude) {
            x = amplitude-1;
        } else if (x < -amplitude) {
            x = -(amplitude-1);
        }
        swipe();
    }
}

var socket = io.connect('http://localhost:8880');

//todo replace with socket handler
d3.select('body').call(d3.keybinding()
    .on('←', moveFinger(-10))
    .on('→', moveFinger(10))
);

update();

function update() {
    var nodes = d3.select("svg").selectAll(".node")
        .data(uiData);

    nodes.attr("transform", function(d, i) {
        var x = d.offset;
        var y = 200;

        return "translate("+x+","+y+")";
    });
    nodes.transition().duration(200).style("stroke-opacity", function(d,i) {return i == selectedNode ? 1 : 0});


    //Add new nodes
    var node = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) {
            var x = d.offset;
            var y = 200;

            return "translate("+x+","+y+")";
        })
        .style("stroke-opacity", function(d,i) {return i == selectedNode ? 1 : 0});

    node.append("polygon")
        .attr("points", "0,0, 150,0, 150,100, 0,100");

    node.append("text")
        .attr("dx", "10px")
        .attr("dy", "25px")
        .attr("text-anchor", "left")
        //.style("stroke-opacity", 0)
        .text(function(d) {return d.name;});
}