var width = 800,
    height = 600;

var uiData = [];
var allData = [{name:"About"},{name:"Price"},{name:"Nutrition"}];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

var origin = 3*Math.PI/2;
var nodeGap = Math.PI / 3; //TODO: Count dynamically depends on amount of nodes
var speed = 0;
var slowDown = 0;
var lastTimerValue = 0;

var selectedNode = 0;

var NODES_TRANSITION_TIME = 1000;

//TODO: Calculate depends on sensor data
var orbitCenter = [width/2, height/2];
var orbitRadiuses = [100, 50]

function swipe(direction) {
    return function(event) {
        //Recalculate speed & slowdown
        speed = direction*nodeGap/NODES_TRANSITION_TIME;
        slowDown = direction*(nodeGap/NODES_TRANSITION_TIME - nodeGap/10);

        selectedNode += direction;
    };
}

var socket = io.connect('http://localhost:8880');
socket.on('object-added', function (data) {
    var ellipse = svg.append("ellipse")
        .attr("class", "orbit")
        .attr("cx", orbitCenter[0])
        .attr("cy", orbitCenter[1])
        .attr("rx", orbitRadiuses[0])
        .attr("ry", orbitRadiuses[1])
        .style("stroke-opacity", 0).transition().style("stroke-opacity", 1);

    uiData = allData;
});

d3.select('body').call(d3.keybinding()
    .on('←', swipe(-1))
    .on('→', swipe(1))
);

d3.timer(function(elapsed) {
    var timeSpan = elapsed - lastTimerValue;
    lastTimerValue = elapsed;

    origin += timeSpan*speed;
    speed += timeSpan*slowDown;

    //Update positions
    var nodes = d3.select("svg").selectAll(".node")
        .data(uiData)
        .attr("transform", function(d, i) {
            var x = orbitRadiuses[0]*Math.cos(origin + i*nodeGap) + orbitCenter[0];
            var y = orbitRadiuses[1]*Math.sin(origin + i*nodeGap) + orbitCenter[1];

            return "translate("+x+","+y+")";
        });

    //Add new nodes
    var node = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) {
            var x = orbitRadiuses[0]*Math.cos(origin + i*nodeGap) + orbitCenter[0];
            var y = orbitRadiuses[1]*Math.sin(origin + i*nodeGap) + orbitCenter[1];

            return "translate("+x+","+y+")";
        });

    node.append("circle")
        .attr("r", 0).transition().duration(500).delay(function(d,i) {return 300*i;}).attr("r",10);

    node.append("text")
        .attr("dy", "25px")
        .attr("text-anchor", "middle")
        .style("stroke-opacity", 0).transition().duration(2000).delay(function(d,i) {return 300*i;}).style("stroke-opacity", 1)
        .text(function(d) {return d.name;});
});