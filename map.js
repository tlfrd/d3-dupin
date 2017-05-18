var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var unemployment = d3.map();

var counties;
var neighbors;

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Unemployment rate");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.tsv, "data/unemployment.tsv", function(d) { unemployment.set(d.id, +d.rate); })
    .await(ready);


function displayAreaValue(d, i) {
  if (d.geometry.type === "Polygon") {
    var coordinates = d.geometry.coordinates[0];
    console.log(getPolygonArea(coordinates));
    console.log(neighbors[i]);
  } else {
    var total = 0;
    for (var i = 0; i < d.geometry.coordinates.length; i++) {
      total += getPolygonArea(d.geometry.coordinates[i][0]);
    }
    console.log(total);
  }
}

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
        return i;
      })
      .on("click", function(d, i) {
        displayAreaValue(d, i);
      })
    .append("title")
      .text(function(d) { return d.rate + "%"; });

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}
