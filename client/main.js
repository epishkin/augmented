var width = 800,
    height = 600;

var amplitude = 1.5;
var realWidth = amplitude * 2;

var uiData = [
    {name:"Central Park", offset:100,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180"},

    {name:"Empire State Bldg", offset:300,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180"},

    {name:"One WTC", offset:500,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180"}
];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

var x = 0;
var selectedNode = 1;

var socket = io.connect('http://localhost:8880');
socket.on('finger', function (data) {
    onHandMove(data[0]);
});

d3.select('body').call(d3.keybinding()
    .on('←', moveFinger(-0.1))
    .on('→', moveFinger(0.1))
);

update();


function onHandMove(coordinate) {
    x = coordinate;
    onCoordinateChange();
}

function moveFinger(dx) {
    return function(event) {
        x += dx;
        onCoordinateChange();
    }
}

function onCoordinateChange() {
    if (x >= amplitude) {
        x = amplitude-1;
    } else if (x < -amplitude) {
        x = -(amplitude-1);
    }

    selectedNode = translateToNodeIndex();
    console.log("x: " + x + ", selected: " + selectedNode);

    update();
}
function translateToNodeIndex() {
    var size = uiData.length
    return Math.floor((x + amplitude) / realWidth * size);
}

function update() {
    var nodes = d3.select("svg").selectAll(".node")
        .data(uiData);

    //display selected building
    var buildings = d3.select("svg").selectAll(".building");
    buildings.transition().duration(200).style("stroke-opacity", selectionOpacity);

    //Add new nodes
    var node = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) {
            var x = d.offset;
            var y = 200;

            return "translate("+x+","+y+")";
        });

    node.append("polygon")
        .attr("points", "0,0, 150,0, 150,100, 0,100");

    node.append("text")
        .attr("dx", "10px")
        .attr("dy", "25px")
        .attr("text-anchor", "left")
        .text(function(d) {return d.name;});

    //create buildings
    node.append("polyline")
        .attr("class", "building")
        .attr("points", function(d) {return d.polyline})
        .attr("transform", "translate(0, 200)")
        .style("stroke-opacity", selectionOpacity);
}

function selectionOpacity(data, index) {
    return index == selectedNode ? 1 : 0
}