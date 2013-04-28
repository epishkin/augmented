var width = 800,
    height = 600;

var min = -80;
var max = 200;

var uiData = [
    {name:"Central Park", offset:100,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20", selected: true, tooltip: false},

    {name:"Empire State Bldg", offset:300,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20", selected: false, tooltip: false},

    {name:"One WTC", offset:500,
        polyline: "20,20 40,25 60,40 80,120 120,140 200,180 20,180 20,20", selected: false, tooltip: false}
];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

var x = 0;
var selectedNode = 0;

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
        uiData[selectedNode].tooltip = true;

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

    var updated = false;
    var newNode = translateToNodeIndex();
    if(newNode != selectedNode) {
        uiData[selectedNode].selected = false;
        uiData[selectedNode].tooltip = false;
        updated = true;
    }

    selectedNode = newNode;
    uiData[selectedNode].selected = true;

    console.log("x: " + x + ", selected: " + selectedNode + ", " + uiData);

    if (updated) {
        update();
    }
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

    buildings
        .transition().duration(500)
        .style("opacity", function (data) {
            return data.selected ? 1 : 0; });

    var tooltips = d3.select("svg").selectAll(".tooltip");
    tooltips.transition().duration(500).style("opacity", function(d) { return d.tooltip ? 1 : 0; });

    //Add new nodes
    var node = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) {
            var x = d.offset;
            var y = 200;

            return "translate("+x+","+y+")";
        });

    //create buildings
    node.append("polyline")
        .attr("class", "building")
        .attr("points", function(d) {return d.polyline})
        .attr("transform", "translate(0, 200)")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", function(data) { return data.selected ? 1 : 0;});

    var tooltip = node.append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    tooltip.append("polygon")
        .attr("points", "0,0, 150,0, 150,100, 0,100");

    tooltip.append("text")
        .attr("dx", "10px")
        .attr("dy", "25px")
        .attr("text-anchor", "left")
        .text(function(d) {return d.name;});
}