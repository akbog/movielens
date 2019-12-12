

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

  var full_data = null;

  var makeTimeLine = function(selector, rawData, studio_data) {
    sortRaw(rawData)

    full_data = studio_data

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
                .on("start brush end", brushended)

    var gbrush = timeline.append("g")
            .attr("class", "brush")
            // .style("stroke", "white")
            .call(brush);

    gbrush.call(brush.move, [new Date("01-01-2002"), new Date("01-01-2006")].map(x))

  }

  function brushended() {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return; // Ignore empty selections.
    var d0 = d3.event.selection.map(x.invert),
        d1 = d0.map(d3.timeDay.round);

    var filteredData = filterData(d1, full_data, x)

    var top_studios = topstudios(filteredData, 10)

    myBubbleChart.updateBubbles(top_studios)

    // myBarChart.updateBars(d1) (will make rawData available globally?)
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

var myBubbleChart = bubbleChart();

var myBarChart = barChart()

var myTimeLine = timeLine();

function display(error, data) {
  if (error) {
    console.log(error);
  }

  var studio_data = groupData(data)

  var start_date = new Date("01-01-2002")
  var end_date = new Date("01-01-2006")

  var timelineData = getTimeline(studio_data)

  myTimeLine(".industry-timeline", timelineData, studio_data)

  myBarChart(start_date, end_date, data)

  var init_data = topstudios(getInit(start_date, end_date, studio_data), 10)

  myBubbleChart(".industry-bubbles", init_data)

}

d3.csv("./csvData/box_office_data_cleaned.csv", display);
