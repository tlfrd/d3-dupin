var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var unemployment = d3.map();

var percentage = 0.5;

var numberOfColours = 9;

var domainMin = 2;
var domainMax = 10;

var counties;
var neighbors;

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 1 + numberOfColours])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[numberOfColours]);

function updateColor() {
  var scheme = getColourScheme();

  color = d3.scaleThreshold()
      .domain(d3.range(domainMin, domainMax,
        (domainMax - domainMin) / (numberOfColours - 1)))
      .range(scheme[numberOfColours]);

  d3.selectAll(".counties")
    .selectAll("path")
    .attr("fill", function(d) {
      return color(d.rate = unemployment.get(d.id));
    });

    var result = Math.round(averagePercentageDiscrim());
    if (result) {
      document.getElementById("overallResult").innerHTML = result + "%";
    }
}

d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.tsv, "data/unemployment.tsv", function(d) { unemployment.set(d.id, +d.rate); })
    .await(ready);


function ready(error, us) {
  if (error) throw error;

  counties = topojson.feature(us, us.objects.counties).features;
  neighbors = topojson.neighbors(us.objects.counties.geometries);

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(counties)
    .enter().append("path")
      .attr("fill", function(d) {
        return color(d.rate = unemployment.get(d.id));
      })
      .attr("d", path)
      .attr("id", function(d, i) {
        return "c" + i;
      })
      .on("click", function(d, i) {
        displayAreaValue(d, i);
      })
      .on("mouseout", function(d) {
        clearArea("coloursDisplay");
      })
    .append("title")
      .text(function(d) { return d.rate + "%"; });

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}
