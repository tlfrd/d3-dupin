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

var results = [];

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 1 + numberOfColours])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[numberOfColours]);

function updateColor(scheme) {
  if (!scheme) {
    scheme = getColourScheme();
  }

  color = d3.scaleThreshold()
      .domain(d3.range(domainMin, domainMax,
        (domainMax - domainMin) / (numberOfColours - 1)))
      .range(scheme[numberOfColours]);

  var transitions = 0;

  d3.selectAll(".counties")
    .selectAll("path")
    .transition()
    .attr("fill", function(d) {
      return color(d.rate = unemployment.get(d.id));
    })

    updatePercentages();
}

function updateColorIter(scheme, initColourCount, currentColourCount, allBool) {
  if (!scheme) {
    scheme = getColourScheme();
  }

  color = d3.scaleThreshold()
      .domain(d3.range(domainMin, domainMax,
        (domainMax - domainMin) / (numberOfColours - 1)))
      .range(scheme[currentColourCount]);

  var transitions = 0;

  d3.selectAll(".counties")
    .selectAll("path")
    .transition()
    .attr("fill", function(d) {
      return color(d.rate = unemployment.get(d.id));
    })
    .on("start", function() {
      transitions++;
    })
    .on("end", function() {
        if(--transitions === 0) {
          var newScore;
          if (allBool) {
            newScore = averagePercentageAllDiscrim();
          } else {
            newScore = averagePercentageNeighbourDiscrim();
          }

          var colourResult = {
            "scheme": colourArray[count],
            "numberOfColours": currentColourCount,
            "score": newScore
          }

          results.push(colourResult);
          console.log(colourResult);

          if (newScore > bestScore) {
            bestScore = newScore;
            bestScheme = colourArray[count]
            bestNumber = currentColourCount;
          }

          currentColourCount++;
          if (currentColourCount > 9) {
            currentColourCount = initColourCount;
            count++;
          }
          numberOfColours = currentColourCount;

          iterateThroughAllSchemes(initColourCount, currentColourCount, allBool);
        }
    });
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

  // updatePercentages();
}
