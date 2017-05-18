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
    console.log(total);
  }
}

function compareColours(colour1, colour2) {
  var percentageDiscrim = document.getElementById("myRange").value / 100;
  console.log(percentageDiscrim);
  return d3.noticeablyDifferent(d3.rgb(colour1), d3.rgb(colour2), percentageDiscrim, 0.1);
}

function displayColours(elementID, areaID, neighbourIDs) {
  var displayArea = document.getElementById(elementID);

  var thisColour = d3.select("path#c" + areaID).attr('fill');

  var htmlToDisplay = "";

  htmlToDisplay += "Clicked<br/><br/>" + generateColourHTML(thisColour, thisColour) + "<br/><br/>";
  htmlToDisplay += "Neighbours<br/><br/>";

  for (n in neighbourIDs) {
    var nColour = d3.select("path#c" + neighbourIDs[n]).attr('fill');
    var bool = compareColours(thisColour, nColour);
    htmlToDisplay += generateColourHTML(nColour, bool);
  }

  displayArea.innerHTML = htmlToDisplay;
}

function showVal(value) {
  document.getElementById("rangeValue").innerHTML = value;
}

function clearArea(elementID) {
  var displayArea = document.getElementById(elementID);
  displayArea.innerHTML = "";
}

function generateColourHTML(colour, text) {
  return '<span style="padding: 5px; background-color:' + colour + ';">' + text + '</span>';
}
