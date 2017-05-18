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
