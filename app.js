/* Create Map */
mapboxgl.accessToken = 'pk.eyJ1IjoieWFya2luZ3VsYWN0aSIsImEiOiJja2xxNjd2dGowc294Mm5udzNodmJya2FhIn0.LVZfVp8U9xd0sHlt5qNpBQ';
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [0, 0],
  zoom: 15,
  hash: true,
});

/* Add polygon tool  */
let draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  }
});
map.addControl(draw);
map.addControl(new mapboxgl.NavigationControl());

/* Add mapm events */
map.on('draw.create', updateArea);
map.on('draw.update', updateArea);

/* Event for polyon tool */
function updateArea(e) {
  let data = draw.getAll();
  if (data.features.length > 0) {
    let polygon = turf.polygon([data.features[0].geometry.coordinates[0]]);

    let lines = linesSelector.options;

    for (j = 0; j < lines.length; j++) {

      let lineStr = lines[j].value;

      let str = lineStr.split('_')[0] + '' + lineStr.split('_')[1];
      let i = parseInt(lineStr.split('_')[1]);

      let line = turf.lineString([linesStart[i], linesFinish[i]]);

      if (turf.booleanIntersects(line, polygon)) {
        console.log(map.getSource(str));
      }
    }
  }
}

/* Line arrays */
let linesStart = [];
let linesFinish = [];
let index = 1;

/* Constant for converting length to latitude */
const degKm = 110.574;

/* Slider and it's label element for controlling existing line lengths */
let rangeslider = document.getElementById("sliderRange");
let output = document.getElementById("output");

/* Slider and it's label element for controlling line lengths when creating line*/
let length = document.getElementById("length");
let kms = document.getElementById("kms");

/* Line selector dropdown */
let linesSelector = document.getElementById("lines");

/* Line add button */
let button = document.getElementById('add');

/* Latitude and Longtitude inputs */
let xInput = document.getElementById('xCoordinate');
let yInput = document.getElementById('yCoordinate');

/* Setting labels html for showing slider values */
output.innerHTML = rangeslider.value;
kms.innerHTML = length.value;


/* Existing line length control event */
rangeslider.oninput = function () {
  output.innerHTML = rangeslider.value;
  
  if(linesSelector.options.length == 0){
    return;
  }

  
  let line = linesSelector.options[linesSelector.selectedIndex].value;
  
  let str = line.split('_')[0] + '' + line.split('_')[1];
  let i = parseInt(line.split('_')[1]);

  let x = linesStart[i][0];
  let y = linesStart[i][1];
  let fx = linesFinish[i][0];

  let c = this.value / degKm;

  let geojson = {
    'type': 'FeatureCollection',
    'features': [{
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [x, y],
          [fx + c, y]
        ]
      }
    }]
  };
  map.getSource(str).setData(geojson);
}

length.oninput = function () {
  kms.innerHTML = this.value;
}

/* Add button event for adding lines */
button.onclick = function (e) {

  e.preventDefault();

  if (isNaN(parseInt(xInput.value)) || parseInt(xInput.value) > 90 || parseInt(xInput.value) < -90) {
    alert('Please enter a valid X coordinate');
    xInput.value = "";
    xInput.select();
    return;
  }
  if (isNaN(parseInt(yInput.value)) || parseInt(yInput.value) > 90 || parseInt(yInput.value) < -90) {
    alert('Please enter a valid Z coordinate');
    yInput.value = "";
    yInput.select();
    return;
  }

  let x = parseInt(xInput.value);
  let y = parseInt(yInput.value);

  let l = length.value;
  let c = (l / degKm);

  map.addSource('line' + index, {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [parseInt(xInput.value), parseInt(yInput.value)],
          [parseInt(xInput.value) + c, parseInt(yInput.value)],
        ]
      }
    }
  });
  map.addLayer({
    'id': 'line' + index,
    'type': 'line',
    'source': 'line' + index,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#f5493d',
      'line-width': 8
    }
  });

  let opt = document.createElement('option');
  opt.value = 'line_' + index;
  opt.innerHTML = 'Line ' + index;
  linesSelector.appendChild(opt);

  linesStart[index] = [parseInt(xInput.value), parseInt(yInput.value)];
  linesFinish[index] = [parseInt(xInput.value) + c, parseInt(yInput.value)];

  index++;
}