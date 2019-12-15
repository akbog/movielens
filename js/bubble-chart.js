


function bubbleChart() {

  var width = document.getElementsByClassName("industry-bubbles")[0].offsetWidth,
      height = document.getElementsByClassName("industry-bubbles")[0].offsetHeight

  var tooltip = floatingTooltip('gates_tooltip', 240);

  var forceStrength = 0.03

  var center = {x : width/2, y : height/2};

  var svg = null;
  var bubbles = null;
  var nodes = [];
  var n = 10

  function charge(d) {
    return -forceStrength * Math.pow(d.radius, 2.0)
  }

  var simulation = d3.forceSimulation()
                      .velocityDecay(0.2)
                      .force('x', d3.forceX().strength(forceStrength).x(center.x))
                      .force('y', d3.forceY().strength(forceStrength).y(center.y))
                      .force('charge', d3.forceManyBody().strength(charge))
                      .on('tick', ticked);

  simulation.stop()

  var fillColor = d3.scaleOrdinal(d3.schemeCategory20c);

  function createNodes(rawData) {
    var maxAmount = d3.max(rawData, function(d) {return d.gross; })

    var radiusScale = d3.scalePow()
                        .exponent(0.5)
                        .domain([0, maxAmount])
                        .range([2,width/n]);

    var myNodes = rawData.map(function(d, i) {
      return {
        id : i,
        season : d.season,
        time : d.time,
        studio : d.studio,
        gross : parseFloat(d.gross),
        //Will make sure spawn outside domain
        x : width * (Math.floor(Math.random()*2) == 1 ? 1 : -1) + Math.random() * width/2,
        y : height * (Math.floor(Math.random()*2) == 1 ? 1 : -1) + Math.random() * height/2,
        radius : radiusScale(parseFloat(d.gross))
      }
    });

    myNodes.sort(function(a,b) {return b.gross - a.gross} )

    return myNodes
  }

  var chart = function(selector, rawData) {

    nodes = createNodes(rawData);

    // console.log(nodes)

    svg = d3.select(selector)
                .append("svg")
                .attr("id", "bubble-container")
                .attr("width", width)
                .attr("height", height);

    bubbles = svg.selectAll("circle")
                  .data(nodes, function(d) {return d.studio});

    var bubblesE = bubbles.enter()
                          .append("circle")
                          .classed('bubble', true)
                          .attr('r', function(d) {return d.radius})
                          .attr('fill', function (d) { return fillColor(d.studio); })
                          // .attr('stroke', function (d) { return d3.rgb(fillColor(d.studio)).darker(); })
                          // .attr('stroke-width', 2)
                          .on('mouseover', showDetail)
                          .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE)

    bubbles.transition()
            .duration(2000)

    simulation.nodes(nodes);

    // console.log("pre-call", nodes)

    createTitles();

    groupBubbles();

  }

  chart.updateBubbles = function (data) {

    new_nodes = createNodes(data)
    updateNodes(nodes, new_nodes)

    bubbles = svg.selectAll("circle")
                  .data(new_nodes, function(d) {return d.studio})
    bubbles.exit().remove()
    var bubblesE = bubbles.enter()
                          .append("circle")
                          .classed("bubble", true)
                          .attr('r', function(d) {return d.radius})
                          .attr('fill', function (d) { return fillColor(d.studio); })
                          .attr('stroke', function (d) { return d3.rgb(fillColor(d.studio)).darker(); })
                          .attr('stroke-width', 2)
                          .on('mouseover', showDetail)
                          .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE)

    bubbles.transition()
            .duration(2000)
            .attr("r", function(d) {return d.radius})

    simulation.nodes(new_nodes);

    nodes = new_nodes

    updateTitles();

    groupBubbles();
  }

  function updateNodes(old, new_arr) {
    new_arr.forEach(item1 => {
      var itemFromArr2 = old.find(item2 => item2.studio == item1.studio);

      if (itemFromArr2) {
         item1.x = itemFromArr2.x;
         item1.y = itemFromArr2.y;
      }
   });
  }

  function comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return other.studio == current.studio
      }).length == 0;
    }
  }

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  function updateTitles() {

      var min_quarter = nodes.reduce(function(res, obj) {
        return(obj.time < res.time) ? obj : res;
      });

      var max_quarter = nodes.reduce(function(res, obj) {
        return (obj.time > res.time) ? obj : res;
      });

      d3.selectAll(".title-industry")
        .transition()
        .duration(200)
        .text("Industry Snapshot: " + min_quarter.season + "-" + max_quarter.season)
        .attr("font-family", "Trebuchet MS")

  }

  function createTitles() {

    var min_quarter = nodes.reduce(function(res, obj) {
      return(obj.time < res.time) ? obj : res;
    });

    var max_quarter = nodes.reduce(function(res, obj) {
      return (obj.time > res.time) ? obj : res;
    });

  }

  function groupBubbles() {

    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

    simulation.alpha(1).restart();
  }

  function showDetail(d) {
    d3.select(this).attr("stroke", "black");

    var content = '<span class="name">Studio: </span><span class="value">' +
                  d.studio +
                  '</span><br/>' +
                  '<span class="name">Gross: </span><span class="value">$' +
                  addCommas(d.gross) +
                  '</span><br/>';

    tooltip.showTooltip(content, d3.event);
  }

  function hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.studio)).darker());

    tooltip.hideTooltip();
  }

  return chart;

}

function topstudios(rawData, n) {
  var temp = []
  var minimum = rawData.reduce(function(res, value) {
      if (!res[value.studio]) {
        res[value.studio] = { season: value.season, studio : value.studio, gross: 0, time: value.time }
        temp.push(res[value.studio])
      }
      if (res[value.studio].time < value.time) {
        res[value.studio].time = value.time
        res[value.studio].season = value.season
      }
      if (!res["minimum"]) {
        res["minimum"] = {season:value.season, time:value.time}
      }
      if(res["minimum"].time > value.time){
        res["minimum"].season = value.season
        res["minimum"].time = value.time
      }
      res[value.studio].gross += parseFloat(value.gross);
      return res
    })

  temp.sort(function (a, b) {
      var key1 = a.gross;
      var key2 = b.gross;

      if (key1 < key2) {
          return -1;
      } else if (key1 == key2) {
          return 0;
      } else {
          return 1;
      }
  });


  // console.log(d3.min(rawData, function(d) { return d.time }))

  var top = temp.slice(-n,temp.length)
  var other = temp.slice(0, -n)
  var res = other.reduce(function(res, value) {
                    if (!res["other"]) {
                      res["other"] = {season: minimum["minimum"].season, studio : "other", gross : 0, time: minimum["minimum"].time}
                    }
                    res["other"].gross += parseFloat(value.gross);
                    return res;
                  }, {});
  top.push(res["other"])
  return top

}

function getInit(start, end, rawData) {
  return rawData.reduce((a,o) => (o.time >= start && o.time <= end && a.push(o), a), [])
}

function groupData(rawData) {
  var result = []
  rawData.reduce(function(res, value) {
    var key = value.season + " " + value.studio
    if (!res[key]) {
      res[key] = { season: value.season, studio : value.studio, gross: 0, time: new Date(value.time) };
      result.push(res[key])
    }
    res[key].gross += parseFloat(value.gross);
    return res;
  }, {});
  return result
}

function getTimeline(rawData) {
  var result = []
  rawData.reduce(function(res, value) {
      if (!res[value.time]) {
        res[value.time] = { season : value.season, time: value.time, gross: 0 };
        result.push(res[value.time])
      }
      res[value.time].gross += parseFloat(value.gross);
      return res;
  }, {});
  // result.push({time: new Date("01 01 2019"), gross : 0})
  return result
}

function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}



function timeLine() {

  var margin = { top: 10, right: 50, bottom: 20, left: 50 },
      width = document.getElementsByClassName("industry-timeline")[0].offsetWidth,
      height = document.getElementsByClassName("industry-timeline")[0].offsetHeight

  var svg = null;

  var timeline = null;

  var fcopy = d3.format;

  function myFormat(){
           function_ret = fcopy.apply(d3, arguments)
           return (function(args){return function (){
                  return args.apply(d3, arguments).replace(/G/, " B");
           }})(function_ret)
  }
  d3.format = myFormat;

  var makeTimeLine = function(selector, rawData, studio_data) {
    sortRaw(rawData)

    // studioData = studio_data

    svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.left + margin.right)

    timeline = svg.append("g")
                  .attr("class", "timeline")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleTime()
              .domain(d3.extent(rawData.map(function(d) { return d.time })))
              .range([0, width])

    var y = d3.scaleLinear()
              .domain([0, d3.max(rawData, function(d) { return parseFloat(d.gross) })])
              .range([height, 0]);

    // var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y)
        .ticks(1)
        .tickFormat(d3.format(".1s"));

    var area = d3.area()
                  .x(function(d) { return x(d.time) })
                  .y0(function(d) {return height } )
                  .y1(function(d) { return y(parseFloat(d.gross)); })


    timeline.append("g")
            .attr("class", "axis axis--grid")
            .style("font-family", "Trebuchet MS")
            .style("stroke", "white")
            // .style("fill", "white")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                    .ticks(d3.timeYear.every(1))
                    .tickSize(-height)
                    .tickFormat(function() { return null; }))
            .selectAll(".tick")
            .classed("tick--minor", function(d) { return d.getHours(); })

    timeline.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(2))
            .tickPadding(0))

    timeline.append("path")
        .data([rawData])
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", "#3b2c85")
        .attr("fill-opacity", .5)


    timeline.append("g")
        .attr("class", "y axis")
        .style("font-family", "Trebuchet MS")
        .attr("fill", "white")
        // attr("stroke", "white")
        .call(yAxis);

    timeline.append("path")
        .datum(rawData)
        .attr("class", "line")
        .attr("d", d3.line()
                    .x(function(d) { return x(d.time); })
                    .y(function(d) { return y(parseFloat(d.gross)); }))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1)

    timeline.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1em")
        .style("font-size", "9px")
        // .style("font", "Verdana")
        .style("text-anchor", "end")
        .style("fill", "white")
        .text("Box Office");

    var brush = d3.brushX()
                .extent([[0,0], [width,height]])
                // .style("fill", "white")
                .on("start brush end", function() {return brushended(studio_data, x)} )

    var gbrush = timeline.append("g")
            .attr("class", "brush")
            // .style("stroke", "white")
            .call(brush);

    gbrush.call(brush.move, [new Date("01-01-2002"), new Date("01-01-2006")].map(x))

  }

  function brushended(studio_data, x) {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return; // Ignore empty selections.
    var d0 = d3.event.selection.map(x.invert),
        d1 = d0.map(d3.timeDay.round);

    var filteredData = filterData(d1, studio_data, x)

    var top_studios = topstudios(filteredData, 10)

    myBubbleChart.updateBubbles(top_studios)

    myBarChart.updateBars(d1[0], d1[1])
  }

  function filterData(newDateRange, studio_data, x) {
    var filtered = []
    // console.log("studio", studio_data)
    // console.log("date", x.invert(newDateRange[0]))
    studio_data.forEach(function(d) {
                  if (d.time >= new Date(newDateRange[0]) && d.time <= new Date(newDateRange[1])) {
                      filtered.push(d);
                  }
              });
    return filtered
  }

  function sortRaw(rawData) {

    rawData.sort(function (a, b) {
      var key1 = a.time;
      var key2 = b.time;

      if (key1 < key2) {
          return -1;
      } else if (key1 == key2) {
          return 0;
      } else {
          return 1;
      }

    })
  }

  return makeTimeLine

}
var myBubbleChart = bubbleChart();

var myBarChart = barChart()

var myTimeLine = timeLine();

function display1(error, data) {
  if (error) {
    console.log(error);
  }

  var studio_data = groupData(data)

  console.log("raw", data)

  var start_date = new Date("01-01-2002")
  var end_date = new Date("01-01-2006")

  myBarChart(start_date, end_date, data)

  var init_data = topstudios(getInit(start_date, end_date, studio_data), 10)

  myBubbleChart(".industry-bubbles", init_data)

  var timelineData = getTimeline(studio_data)

  myTimeLine(".industry-timeline", timelineData, studio_data)

}

d3.csv("./csvData/box_office_data_cleaned.csv", display1);
