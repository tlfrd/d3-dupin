var colourSchemes = {
  "blue": d3.schemeBlues,
  "green": d3.schemeGreens,
  "purple": d3.schemePurples,
  "orange": d3.schemeOranges,
  "red": d3.schemeReds,
  "grey": d3.schemeGreys,
  "bugn": d3.schemeBuGn,
  "bupu": d3.schemeBuPu,
  "gnbu": d3.schemeGnBu,
  "orrd": d3.schemeOrRd,
  "pubugn": d3.schemePuBuGn,
  "pubu": d3.schemePuBu,
  "purd": d3.schemePuRd,
  "rdpu": d3.schemeRdPu,
  "ylgnbu": d3.schemeYlGnBu,
  "ylgn": d3.schemeYlGn,
  "ylorbr": d3.schemeYlOrBr,
  "ylorrd": d3.schemeYlOrRd
}

var bestScore = 0;
var bestScheme = 0;
var bestNumber = 0;

var count = 0;

var colourArray = [];
for (var j in colourSchemes) {
  colourArray.push(j);
}

function iterateThroughAllSchemes(initColourCount, currentColourCount, allBool) {
  if (count < colourArray.length) {
    updateColorIter(colourSchemes[colourArray[count]], initColourCount, currentColourCount, allBool);
  } else {
    count = 0;
    var best = {
      "bestScheme": bestScheme,
      "bestNumberOfColours": bestNumber,
      "bestScore": bestScore
    }
    results.push(best);
    console.log(best);
    console.log(results);

    // go to best colour
    numberOfColours = bestNumber;
    updateColor(colourSchemes[bestScheme]);

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "results.json");
    dlAnchorElem.click();
  }
}

function updatePercentages() {
  var resultNeighbours = Math.round(averagePercentageNeighbourDiscrim());
  // var resultAll = Math.round(averagePercentageAllDiscrim());

  if (resultNeighbours) {
    document.getElementById("overallResult").innerHTML = resultNeighbours + "%";
  }
  //
  // if (resultAll) {
  //   document.getElementById("overallResultAll").innerHTML = resultAll + "%";
  // }
}

function getPolygonArea(points) {
  var sum = 0.0;
  var length = points.length;
  if (length < 3) {
    return sum;
  }
  points.forEach(function(d1, i1) {
    i2 = (i1 + 1) % length;
    d2 = points[i2];
    sum += (d2[1] * d1[0]) - (d1[1] * d2[0]);
  });
  return sum / 2;
}

function averagePercentageNeighbourDiscrim() {
  var total = 0;
  var count = 0;
  for (var i in counties) {
    var result = compareWithNeighbours(i);
    if (result !== -1) {
      total += result;
      count++;
    }
  }
  return total/count * 100;
}

function averagePercentageAllDiscrim() {
  var total = 0;
  var count = 0;
  for (var i in counties) {
    var result = compareWithAll(i);
    if (result !== -1) {
      total += result;
      count++;
    }
  }
  return total/count * 100;
}

function getColourScheme() {
  var e = document.getElementById("schemes");
  var scheme = e.options[e.selectedIndex].value;

  return colourSchemes[scheme];
}

function compareWithAll(j) {
  var thisColour = d3.select("path#c" + j).attr('fill');
  var resultsArray = [counties.length - 1];

  var totalTrueFalse = 0;
  var totalTrue = 0;

  for (var i in counties) {
    if (i !== j) {
      var colour = d3.select("path#c" + i).attr('fill');
      var result = compareColours(thisColour, colour);
      if (result === true || result == false) {
        totalTrueFalse++;
        if (result === true) {
          totalTrue++;
        }
      }
      resultsArray[i] = result;
    }
  }

  if (totalTrue/totalTrueFalse) {
    return totalTrue/totalTrueFalse;
  } else {
    return -1;
  }
}

function compareWithNeighbours(i) {
  var thisColour = d3.select("path#c" + i).attr('fill');
  var neighborsArray = neighbors[i];
  var resultsArray = [neighborsArray.length];

  var totalTrueFalse = 0;
  var totalTrue = 0;

  for (var i in neighborsArray) {
    var colour = d3.select("path#c" + neighborsArray[i]).attr('fill');
    var result = compareColours(thisColour, colour);
    if (result === true || result == false) {
      totalTrueFalse++;
      if (result === true) {
        totalTrue++;
      }
    }
    resultsArray[i] = result;
  }
  if (totalTrue/totalTrueFalse) {
    return totalTrue/totalTrueFalse;
  } else {
    return -1;
  }
}

function displayAreaValue(d, i) {
  if (d.geometry.type === "Polygon") {
    var coordinates = d.geometry.coordinates[0];
    // console.log(getPolygonArea(coordinates));
    displayColours('coloursDisplay', i, neighbors[i]);
  } else {
    var total = 0;
    for (var i = 0; i < d.geometry.coordinates.length; i++) {
      total += getPolygonArea(d.geometry.coordinates[i][0]);
    }
    // console.log(total);
  }
}

function compareColours(colour1, colour2) {
  var percentageDiscrim = document.getElementById("myRange").value / 100;
  if (colour1 === colour2) {
    return "same";
  } else {
    return d3.noticeablyDifferent(d3.rgb(colour1), d3.rgb(colour2), percentageDiscrim, 0.1);
  }
}

function displayColours(elementID, areaID, neighbourIDs) {
  var displayArea = document.getElementById(elementID);

  var thisColour = d3.select("path#c" + areaID).attr('fill');

  var htmlToDisplay = "";

  htmlToDisplay += "ID:" + areaID + " Clicked<br/><br/>" + generateColourHTML(thisColour, thisColour) + "<br/><br/>";
  htmlToDisplay += "Neighbours<br/><br/>";

  for (n in neighbourIDs) {
    var nColour = d3.select("path#c" + neighbourIDs[n]).attr('fill');
    var bool = compareColours(thisColour, nColour);
    htmlToDisplay += generateColourHTML(nColour, bool);
  }

  htmlToDisplay += "<br/><br/> Percentage of neighbors discrim.: " + Math.round(compareWithNeighbours(areaID) * 100) + "%";

  displayArea.innerHTML = htmlToDisplay;
}

function showVal() {
  var value = document.getElementById("myRange").value;
  document.getElementById("rangeValue").innerHTML = value + "%";

  updatePercentages();
}

function showRangeValue() {
  var value = document.getElementById("colourRange").value;
  numberOfColours = value;
  updateColor(getColourScheme());
  document.getElementById("rangeValue2").innerHTML = value;

  updatePercentages();
}

function clearArea(elementID) {
  var displayArea = document.getElementById(elementID);
  displayArea.innerHTML = "";
}

function generateColourHTML(colour, text) {
  return '<span style="padding: 5px; background-color:' + colour + ';">' + text + '</span>';
}
