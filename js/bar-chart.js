
// set the dimensions and margins of the graph
var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = document.getElementsByClassName("bar-chart")[0].offsetWidth - margin.left - margin.right,
    height = document.getElementsByClassName("bar-chart")[0].offsetHeight - margin.bottom - margin.top

// append the svg object to the body of the page

function barChart() {

  console.log("here")

  var svg = d3.select(".bar-chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var basic_data

    function drawBarChart(start, end, rawData) {

      basic_data = rawData

      var data = clean(start, end, rawData, 11)

      console.log("barChartData", data)

      var maxAmount = d3.max(data, function(d) {return parseFloat(d.gross); })

      var x = d3.scaleLinear()
                .domain([0, maxAmount])
                .range([0,width]);

      var y = d3.scaleBand()
                .range([height, 0])
                .domain(data.map(function(d) {return (d.movie) }))
                .padding(0.5);

      svg.append("g")
          .classed("axis yaxis", true)
          .call(d3.axisLeft(y)
                  .tickValues([]));

      svg.append("g")
          .classed("axis xaxis", true)
          .call(d3.axisTop(x)
                  .ticks(5)
                  .tickFormat(d3.format(".0s")))

      d3.selectAll(".bar-chart-label")
          .append("text")
          .attr("x", width/2)
          .attr("y", 0 - margin.top)
          .style("text-anchor", "middle")
          .text("Top Grossing Movies in Range");

      svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
          .attr("x", function(d) { return 0; })
          .attr("height", y.bandwidth())
          .attr("fill", "#69b3a2")
          // no bar at the beginning thus:
          .attr("width", function(d) { return x(0); }) // always equal to 0
          .attr("y", function(d) { return y(d.movie); })

      svg.selectAll("mybar")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x", function(d) { return 0 + 5; })
          .attr("y", function(d) { return y(d.movie); })
          .style("stroke", "white")
          .style("fill", "white")
          .text(function(d) {return d.movie})


      // // Animation
      svg.selectAll("rect")
        .transition()
        .duration(800)
        // .attr("x", function(d) { return 0; })
        .attr("width", function(d) { return x(d.gross); })
        .delay(function(d,i){ return(i*100)})

    }

    function title_form(string, max_char){
      console.log(string.slice(0, max_char) + "...")
      return string.slice(0, max_char) + "..."
    }

    function clean(start, end, rawData, n) {
      // console.log(rawData)
      var reduced = rawData.reduce((a,o) => (new Date(o.time) >= start && new Date(o.time) <= end && a.push(o), a), [])
      reduced.sort(function(a,b) {return parseFloat(a.gross) - parseFloat(b.gross)} )
      console.log("reduced", reduced)
      return reduced.slice(Math.max(reduced.length - n, 1))
    }

    drawBarChart.updateBars = function (start_time, end_time) {
      var data = clean(start_time, end_time, basic_data, 11)

      var maxAmount = d3.max(data, function(d) {return parseFloat(d.gross); })

      var new_x = d3.scaleLinear()
                .domain([0, maxAmount])
                .range([0,width]);

      var new_y = d3.scaleBand()
                .range([height, 0])
                .domain(data.map(function(d) {return (d.movie) }))
                .padding(0.5);

      svg.selectAll("*").remove()
      // (".bar-chart").remove("*")

      svg.append("g")
          .classed("axis yaxis", true)
          .call(d3.axisLeft(new_y)
                  .tickValues([]));

      svg.append("g")
          .classed("axis xaxis", true)
          .call(d3.axisTop(new_x)
                  .ticks(5)
                  .tickFormat(d3.format(".0s")))
      // svg.selectAll("rect").remove("*")
      // svg.selectAll("")

      svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
          .attr("x", function(d) { return 0; })
          .attr("height", new_y.bandwidth())
          .attr("fill", "#69b3a2")
          // no bar at the beginning thus:
          .attr("width", function(d) { return new_x(0); }) // always equal to 0
          .attr("y", function(d) { return new_y(d.movie); })

      svg.selectAll("mybar")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x", function(d) { return 0 + 5; })
          .attr("y", function(d) { return new_y(d.movie); })
          .style("stroke", "white")
          .style("fill", "white")
          .text(function(d) {return d.movie})


      // // Animation
      svg.selectAll("rect")
        .transition()
        .duration(800)
        // .attr("x", function(d) { return 0; })
        .attr("width", function(d) { return new_x(d.gross); })
        .delay(function(d,i){ return(i*100)})
    }


    return drawBarChart

}

// // X axis
// var x = d3.scaleBand()
//   .range([ 0, width ])
//   .domain(data.map(function(d) { return d.Country; }))
//   .padding(0.2);
// svg.append("g")
//   .attr("transform", "translate(0," + height + ")")
//   .call(d3.axisBottom(x))
//   .selectAll("text")
//     .attr("transform", "translate(-10,0)rotate(-45)")
//     .style("text-anchor", "end");
//
// // Add Y axis
// var y = d3.scaleLinear()
//   .domain([0, 13000])
//   .range([ height, 0]);
// svg.append("g")
//   .call(d3.axisLeft(y));

// Bars



// var myBarChart = barChart()
//
// function display(error, data) {
//   console.log("barchart_data", data)
//
//   var chart = myBarChart()
//
// }
//
// d3.csv("./csvData/box_office_data_cleaned.csv", display);
