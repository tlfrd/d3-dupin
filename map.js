var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var population = d3.map();

var percentage = 0.5;

var numberOfColours = 9;

var domainMin = 30000;
var domainMax = 150000;

var constituencies;
var neighbors;

var results = [];

var projection = d3.geoAlbers()
          .rotate([0, 0]);

var path = d3.geoPath().projection(projection);

var x = d3.scaleLinear()
    .domain([1, 1 + numberOfColours])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(domainMin, domainMax,
      (domainMax - domainMin) / (numberOfColours - 1)))
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
      return color(d.rate = population.get(d.id));
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
      return color(d.rate = population.get(d.id));
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
    .defer(d3.json, "https://raw.githubusercontent.com/tlfrd/viz-collection/master/uk-choro/json/uk.json")
    .defer(d3.json, "https://raw.githubusercontent.com/tlfrd/viz-collection/master/uk-choro/json/population_ons.json")
    .await(ready);


function ready(error, uk, pop) {
  if (error) throw error;

  console.log(uk);

  for (var i in pop) {
    population.set(i, pop[i].population);
  }

  console.log(population);

  constituencies = topojson.feature(uk, uk.objects.wpc).features;
  neighbors = topojson.neighbors(uk.objects.wpc.geometries);

  projection
    .scale(1)
    .translate([0,0]);

    // compute the correct bounds and scaling from the topoJSON
  var b = path.bounds(topojson.feature(uk, uk.objects["wpc"]));
  var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
  var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
      .scale(s)
      .translate(t);

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(constituencies)
    .enter().append("path")
      .attr("fill", function(d) {
        return color(d.rate = population.get(d.id));
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

  // updatePercentages();
}
