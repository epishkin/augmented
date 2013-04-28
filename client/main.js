var width = 800,
    height = 600;

var min = -80;
var max = 200;

var uiData = [
    {name:"Central Park", offset:100,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20"},

    {name:"Empire State Bldg", offset:300,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20"},

    {name:"One WTC", offset:500,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20"}
];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

var x = 0;
var selectedNode = 1;
var highlighted = false;

var socket = io.connect('http://localhost:8880');
socket.on('finger', function (data) {
    onHandMove(data[0]);
});

d3.select('body').call(d3.keybinding()
    .on('←', moveFinger(-10))
    .on('→', moveFinger(10))
    .on('c', showTooltip())
);

update();


function onHandMove(coordinate) {
    x = coordinate;
    onCoordinateChange();
}

function showTooltip()
{
    return function(event) {
        highlighted = true;

        update();
    }
}

function moveFinger(dx) {
    return function(event) {
        x += dx;
        onCoordinateChange();
    }
}

function onCoordinateChange() {
    if (x >= max) {
        x = max - 0.01;
    } else if (x < min) {
        x = -(min + 0.01);
    }

    var newNode = translateToNodeIndex();
    if(newNode != selectedNode) {
        highlighted = false;
    }
    selectedNode = newNode;

    console.log("x: " + x + ", selected: " + selectedNode + ", " +highlighted);

    update();
}
function translateToNodeIndex() {
    var size = uiData.length
    return Math.floor((x - min) / Math.abs(max - min) * size);
}

function update() {
    var nodes = d3.select("svg").selectAll(".node")
        .data(uiData);

    //display selected building
    var buildings = d3.select("svg").selectAll(".building");
    buildings.transition().duration(200).style("opacity", selectionOpacity);

    var tooltips = d3.select("svg").selectAll(".tooltip");
    tooltips.transition().duration(200).style("opacity", highlightOpacity);

    //Add new nodes
    var node = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) {
            var x = d.offset;
            var y = 200;

            return "translate("+x+","+y+")";
        });

    var tooltip = node.append("g")
        .attr("class", "tooltip")
        .style("opacity", highlightOpacity);

    tooltip.append("polygon")
        .attr("points", "0,0, 150,0, 150,100, 0,100");

    tooltip.append("text")
        .attr("dx", "10px")
        .attr("dy", "25px")
        .attr("text-anchor", "left")
        .text(function(d) {return d.name;});

    //create buildings
    node.append("polyline")
        .attr("class", "building")
        .attr("points", function(d) {return d.polyline})
        .attr("transform", "translate(0, 200)")
        .style("opacity", selectionOpacity);
}

function selectionOpacity(data, index) {
    return index == selectedNode ? 1 : 0
}

function highlightOpacity(data, index) {
    return highlighted && index == selectedNode ? 1 : 0
}