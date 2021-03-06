//adpated from Jess Peter's gantt chart https://gist.github.com/mbostock/4062045

const w = 1000;
const h = 400;


const svg = d3.selectAll('.svg')
  // .selectAll("svg")
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .attr('class', 'svg');


const tracking = [{
  subject: 'staff 2',
  location: 'staff room',
  avgdistance: '10',
  tickstart: '0',
  tickend: '10',
  duration: '10',
}, {
  subject: 'staff 1',
  location: 'staff room',
  avgdistance: '20',
  tickstart: '0',
  tickend: '15',
  duration: '15',
}, {
  subject: 'staff 3',
  location: 'staff room',
  avgdistance: '20',
  tickstart: '0',
  tickend: '4',
  duration: '4',
}, {
  subject: 'staff 2',
  location: 'hallway',
  avgdistance: '10',
  tickstart: '15',
  tickend: '39',
  duration: '24',
}, {
  subject: 'staff 3',
  location: 'hallway',
  avgdistance: '11',
  tickstart: '4',
  tickend: '30',
  duration: '26',
}, {
  subject: 'visitor 1',
  location: 'hallway',
  avgdistance: '11',
  tickstart: '4',
  tickend: '50',
  duration: '46',
},
{
  subject: 'staff 1',
  location: 'hallway',
  avgdistance: '19',
  tickstart: '25',
  tickend: '50',
  duration: '25',
}, {
  subject: 'patient 1',
  location: 'patient room',
  avgdistance: '0',
  tickstart: '0',
  tickend: '50',
  duration: '50',
},
  {
    subject: 'patient 2',
    location: 'patient room',
    avgdistance: '0',
    tickstart: '0',
    tickend: '50',
    duration: '50',
  },
  {
    subject: 'patient 3',
    location: 'patient room',
    avgdistance: '0',
    tickstart: '0',
    tickend: '50',
    duration: '50',
  },
  {
    subject: 'patient 4',
    location: 'patient room',
    avgdistance: '0',
    tickstart: '0',
    tickend: '50',
    duration: '50',
  },
];


const dateFormat = d3.time.format('%S');

const timeScale = d3.time.scale()
  .domain([d3.min(tracking, function (d) { return dateFormat.parse(d.tickstart); }),
    d3.max(tracking, function (d) { return dateFormat.parse(d.tickend); })])
  .range([0, w - 150]);

let locationlist = new Array();

for (let i = 0; i < tracking.length; i++) {
  locationlist.push(tracking[i].location);
}

const locsUnfiltered = locationlist; // for vert labels


locationlist = checkUnique(locationlist);


const agentlist = new Array();


makeGant(tracking, w, h);

const title = svg.append('text')
  .text('Node Activity')
  .attr('x', w / 2)
  .attr('y', 25)
  .attr('text-anchor', 'middle')
  .attr('font-size', 24)
  .attr('fill', '#00d9d9');


function makeGant(subjects, pageWidth, pageHeight) {
  const barHeight = 20;
  const gap = barHeight + 4;
  const topPadding = 75;
  const sidePadding = 75;

  const colorScale = d3.scale.linear()
    .domain([0, locationlist.length])
    .range(['#00d8d8', '#f6f900'])
    .interpolate(d3.interpolateHcl);

  makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
  drawRects(subjects, gap, topPadding, sidePadding, barHeight, colorScale, pageWidth, pageHeight);
  vertLabels(gap, topPadding, sidePadding, barHeight, colorScale);
}


function drawRects(theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w, h) {
  const bigRects = svg.append('g')
    .selectAll('rect')
    .data(theArray)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', function (d, i) {
      return i * theGap + theTopPad - 2;
    })
    .attr('width', function (d) {
      return w - theSidePad / 2;
    })
    .attr('height', theGap)
    .attr('stroke', 'none')
    .attr('fill', function (d) {
      for (let i = 0; i < locationlist.length; i++) {
        if (d.location == locationlist[i]) {
          return d3.rgb(theColorScale(i));
        }
      }
    })
    .attr('opacity', 0.2);


  const rectangles = svg.append('g')
    .selectAll('rect')
    .data(theArray)
    .enter();


  const innerRects = rectangles.append('rect')
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('x', function (d) {
      return timeScale(dateFormat.parse(d.tickstart)) + theSidePad;
    })
    .attr('y', function (d, i) {
      return i * theGap + theTopPad;
    })
    .attr('width', function (d) {
      return (timeScale(dateFormat.parse(d.tickend)) - timeScale(dateFormat.parse(d.tickstart)));
    })
    .attr('height', theBarHeight)
    .attr('stroke', 'none')
    .attr('fill', function (d) {
      for (let i = 0; i < locationlist.length; i++) {
        if (d.location == locationlist[i]) {
          return d3.rgb(theColorScale(i));
        }
      }
    });


  const rectText = rectangles.append('text')
    .text(function (d) {
      return d.subject;
    })
    .attr('x', function (d) {
      return (timeScale(dateFormat.parse(d.tickend)) - timeScale(dateFormat.parse(d.tickstart))) / 2 + timeScale(dateFormat.parse(d.tickstart)) + theSidePad;
    })
    .attr('y', function (d, i) {
      return i * theGap + 14 + theTopPad;
    })
    .attr('font-size', 11)
    .attr('text-anchor', 'middle')
    .attr('text-height', theBarHeight)
    .attr('fill', '#fff');


  rectText.on('mouseover', function (e) {
    // console.log(this.x.animVal.getItem(this));
    let tag = '';

    if (d3.select(this).data()[0].avgdistance != undefined) {
      tag = `Subject: ${d3.select(this).data()[0].subject}<br/>` +
                `Location: ${d3.select(this).data()[0].location}<br/>` +
                `Starts: ${d3.select(this).data()[0].tickstart}<br/>` +
                `Ends: ${d3.select(this).data()[0].tickend}<br/>` +
                `Average Distance: ${d3.select(this).data()[0].avgdistance}`;
    } else {
      tag = `Subject: ${d3.select(this).data()[0].subject}<br/>` +
                `Location: ${d3.select(this).data()[0].location}<br/>` +
                `Starts: ${d3.select(this).data()[0].tickstart}<br/>` +
                `Ends: ${d3.select(this).data()[0].tickend}`;
    }
    const output = document.getElementById('tag');

    const x = `${this.x.animVal.getItem(this)}px`;
    const y = `${this.y.animVal.getItem(this) + 5}px`;

    output.innerHTML = tag;
    output.style.top = y;
    output.style.left = x;
    output.style.display = 'block';
  }).on('mouseout', function () {
    const output = document.getElementById('tag');
    output.style.display = 'none';
  });


  innerRects.on('mouseover', function (e) {
    // console.log(this);
    let tag = '';

    if (d3.select(this).data()[0].avgdistance != undefined) {
      tag = `Subject: ${d3.select(this).data()[0].subject}<br/>` +
                `Location: ${d3.select(this).data()[0].location}<br/>` +
                `Starts: ${d3.select(this).data()[0].tickstart}<br/>` +
                `Ends: ${d3.select(this).data()[0].tickend}<br/>` +
                `Average Distance: ${d3.select(this).data()[0].avgdistance}`;
    } else {
      tag = `Subject: ${d3.select(this).data()[0].subject}<br/>` +
                `Location: ${d3.select(this).data()[0].location}<br/>` +
                `Starts: ${d3.select(this).data()[0].tickstart}<br/>` +
                `Ends: ${d3.select(this).data()[0].tickend}`;
    }
    const output = document.getElementById('tag');

    const x = `${this.x.animVal.value + this.width.animVal.value / 2}px`;
    const y = `${this.y.animVal.value + 20}px`;

    output.innerHTML = tag;
    output.style.top = y;
    output.style.left = x;
    output.style.display = 'block';
  }).on('mouseout', function () {
    const output = document.getElementById('tag');
    output.style.display = 'none';
  });
}


function makeGrid(theSidePad, theTopPad, w, h) {
  const xAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom')
    .ticks(d3.seconds, 1)
    .tickSize(-h + theTopPad + 40, 0, 0)
    .tickFormat(d3.time.format('%S'));

  const grid = svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${theSidePad}, ${h - 50})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'middle')
    .attr('fill', '#000')
    .attr('stroke', 'none')
    .attr('font-size', 10)
    .attr('dy', '1em');
}

function vertLabels(theGap, theTopPad, theSidePad, theBarHeight, theColorScale) {
  const numOccurances = new Array();
  let prevGap = 0;

  for (let i = 0; i < locationlist.length; i++) {
    numOccurances[i] = [locationlist[i], getCount(locationlist[i], locsUnfiltered)];
  }

  const axisText = svg.append('g') // without doing this, impossible to put grid lines behind text
    .selectAll('text')
    .data(numOccurances)
    .enter()
    .append('text')
    .text(function (d) {
      return d[0];
    })
    .attr('x', 10)
    .attr('y', function (d, i) {
      if (i > 0) {
        for (let j = 0; j < i; j++) {
          prevGap += numOccurances[i - 1][1];
          // console.log(prevGap);
          return d[1] * theGap / 2 + prevGap * theGap + theTopPad;
        }
      } else {
        return d[1] * theGap / 2 + theTopPad;
      }
    })
    .attr('font-size', 11)
    .attr('text-anchor', 'start')
    .attr('text-height', 14)
    .attr('fill', function (d) {
      for (let i = 0; i < locationlist.length; i++) {
        if (d[0] == locationlist[i]) {
        //  console.log("true!");
          return d3.rgb(theColorScale(i)).darker();
        }
      }
    });
}

// from this stackexchange question: http://stackoverflow.com/questions/1890203/unique-for-arrays-in-javascript
function checkUnique(arr) {
  let hash = {},
    result = [];
  for (let i = 0, l = arr.length; i < l; ++i) {
    if (!hash.hasOwnProperty(arr[i])) { // it works with objects! in FF, at least
      hash[arr[i]] = true;
      result.push(arr[i]);
    }
  }
  return result;
}

// from this stackexchange question: http://stackoverflow.com/questions/14227981/count-how-many-strings-in-an-array-have-duplicates-in-the-same-array
function getCounts(arr) {
  let i = arr.length, // var to loop over
    obj = {}; // obj to store results
  while (i) obj[arr[--i]] = (obj[arr[i]] || 0) + 1; // count occurrences
  return obj;
}

// get specific from everything
function getCount(word, arr) {
  return getCounts(arr)[word] || 0;
}
