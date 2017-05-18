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

function averagePercentageDiscrim() {
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

function getColourScheme() {
  var e = document.getElementById("schemes");
  var scheme = e.options[e.selectedIndex].value;
  console.log(scheme);

  if (scheme === "blue") {
    return d3.schemeBlues;
  } else if (scheme === "green") {
    return d3.schemeBlues;
  } else if (scheme === "grey") {
    return d3.schemeGreys;
  } else if (scheme === "purple") {
    return d3.schemePurples;
  } else if (scheme === "orange") {
    return d3.schemeOranges;
  } else if (scheme === "red") {
    return d3.schemeReds;
  }
  // return scheme;
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

  var result = Math.round(averagePercentageDiscrim());
  if (result) {
    document.getElementById("overallResult").innerHTML = result + "%";
  }
}

function showRangeValue() {
  var value = document.getElementById("colourRange").value;
  numberOfColours = value;
  updateColor();
  document.getElementById("rangeValue2").innerHTML = value;

  var result = Math.round(averagePercentageDiscrim());
  if (result) {
    document.getElementById("overallResult").innerHTML = result + "%";
  }
}

function clearArea(elementID) {
  var displayArea = document.getElementById(elementID);
  displayArea.innerHTML = "";
}

function generateColourHTML(colour, text) {
  return '<span style="padding: 5px; background-color:' + colour + ';">' + text + '</span>';
}
