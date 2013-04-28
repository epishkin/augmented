var width = 1024,
    height = 768;

var clickId = 0;

var min = -300;
var max = 300;

var tooltipHeight = 35;

var completed = 0;

var uiData = [
    {name:"Central Park", x:100, y:200,
        polyline: "0,0 40,25 60,40 80,120 120,140 200,180 20,180 0,0", selected: true, tooltipWidth:145,tooltip: false},

    {name:"Empire State Bldg", x:300, y:200,
        polyline: "0,0 40,25 60,40 80,120 120,140 200,180 20,180 0,0", selected: false, tooltipWidth:200, tooltip: false},

    {name:"One WTC", x:500, y:200,
        polyline: "0,0 40,25 60,40 80,120 120,140 200,180 20,180 0,0", selected: false, tooltipWidth:125, tooltip: false}
];

var cursor = [];

var svg = d3.select("body")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g");

d3.select("body").on('click', function(data, i) {
    console.log(d3.mouse(this));
    uiData[clickId%3].x = d3.mouse(this)[0];
    uiData[clickId%3].y = d3.mouse(this)[1]-200;
    clickId++;
    updateBuildings();
});

var x = 0;
var selectedNode = 0;

var socket = io.connect('http://localhost:8880');
socket.on('finger', function (data) {
    cursor = [data];
    updateCursor();
    onHandMove(data[0]);
});

socket.on('circle', function (data) {
    showTooltip()();
});


d3.select('body').call(d3.keybinding()
    .on('←', moveFinger(-10))
    .on('→', moveFinger(10))
    .on('c', showTooltip())
);

updateBuildings();

function onHandMove(coordinate) {
    x = coordinate;
    onCoordinateChange();
}

function showTooltip()
{
    return function(event) {
        for (var i = 0; i < uiData.length; i++) {
            uiData[i].tooltip = false;
        }
        uiData[selectedNode].tooltip = true;
        updateTooltips();
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
//        uiData[selectedNode].tooltip = false;
        updated = true;
    }

    selectedNode = newNode;
    uiData[selectedNode].selected = true;

    if (updated) {
        updateBuildings();
        updateTooltips();
    }
}
function translateToNodeIndex() {
    var size = uiData.length
    var sizeOfCell = width / uiData.length;
    return Math.floor(((x - min) / Math.abs(max - min) * width)/sizeOfCell);
}

function updateCursor()
{
    //display selected building
    var cursors = d3.select("svg").selectAll(".cursor").data(cursor)
        .attr("cx", cursorX)
        .attr("cy", cursorY);

    cursors.enter().append("circle")
        .attr("cx", cursorX)
        .attr("cy", cursorY)
        .attr("class", "cursor")
        .attr("r", 20);
}

function updateBuildings() {
     //Update
    var nodes = d3.select("svg").selectAll(".node")
        .data(uiData);

    nodes.attr("transform", function(d, i) {
        var x = d.x;
        var y = d.y;

        return "translate("+x+","+y+")";
    });

    var buildings = d3.select("svg").selectAll(".building");
    buildings
        .style("opacity", function (data) {
            return data.selected ? 1 : 0; });


    addBuildings(nodes);
}

function addBuildings(nodes)
{
    var node = nodes.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d, i) {
                var x = d.x;
                var y = d.y;

                return "translate("+x+","+y+")";
            })
        ;

    //create buildings
    var building = node.append("polyline")
        .attr("class", "building")
        .attr("points", function(d) {return d.polyline})
        .attr("transform", "translate(0, 200)");

    building.style("opacity", 0)
        .transition()
        .duration(function(data, i) {return 500*(1+i);})
        .style("opacity", 1).each("end", function(data, i) {
            d3.select(this)
                .transition()
                .duration(function(data, i) {return 300*(1+i);})
                .style("opacity", 0).each("end", function(data, i) {
//                    d3.select(this)
//                     .style("opacity", function(data) { return data.selected ? 1 : 0;});
                });
        });

    addTooltip(node);
}

function updateTooltips()
{
    if (completed<2) return;

    var tooltips = d3.select("svg").selectAll(".tooltip")
        .data(uiData);

    tooltips
        .attr("class", function(data) {
        return data.tooltip ? "tooltip selected" : "tooltip not-selected";
    })
        .transition()
        .attr("transform",function(data) {
            var transform = "translate(0, 0) scale(1,1)";
            if (data.tooltip) {
                transform = "translate("+(-data.tooltipWidth/2)+","+(-tooltipHeight/2)+") scale(2,2)";
            } else if (data.selected) {
                transform = "translate("+(-data.tooltipWidth/2)+","+(-tooltipHeight/2)+") scale(1.5,1.5)"
            }

            return transform;
        });
}

function addTooltip(node)
{
    var tooltip = node.append("g")
        .attr("class", "tooltip");

    tooltip.append("polygon")
        .attr("points", function(d) {return "0,0, "+ d.tooltipWidth+",0, "+ d.tooltipWidth+","+tooltipHeight+", 0,"+tooltipHeight;});

    tooltip.append("text")
        .attr("dx", function(d) {return d.tooltipWidth/2 })
        .attr("dy", "25px")
        .attr("text-anchor", "middle")
        .text(function(d) {return d.name;});

    tooltip.style("opacity", 0)
        .transition()
        .duration(function(data, i) {return 500*(1+i);})
        .style("opacity", 1).each("end", function(data, i) {
            d3.select(this)
                .transition()
                .duration(function(data, i) {return 300*(1+i);})
                .style("opacity", 0).each("end", function(data, i) {
                    d3.select(this)
                     .style("opacity", 1)
                     .attr("class", function(data) {
                            completed++;
                            return data.tooltip ? "tooltip selected" : "tooltip not-selected";
                      })
                });
        });
}

function cursorX(data)
{
    var curX = Math.floor((data[0] - min) / Math.abs(max - min) * width);
    return curX;
}

function cursorY(data)
{
    return 400-data[1];
}