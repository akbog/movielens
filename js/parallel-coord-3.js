
function pCoord() {

  var margin = {top: 30, right: 10, bottom: 10, left: 10},
      width =document.getElementsByClassName("parallel-coord")[0].offsetWidth - margin.right - margin.left,
      height = document.getElementsByClassName("parallel-coord")[0].offsetHeight - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg = d3.select(".parallel-coord")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  function full_process(rawData) {

    d3.selectAll('.title-movie').style("text-anchor", "middle").text("Movie: ")
    d3.selectAll('.title-gross').style("text-anchor", "middle").text("Gross: ")
    d3.selectAll('.title-season').style("text-anchor", "middle").text("Quarter:")
    d3.selectAll('.title-rank').style("text-anchor", "middle").text("Rank: ")
    d3.selectAll('.title-release').style("text-anchor", "middle").text("Release: ")

    console.log(rawData)

    var parseTime = d3.timeFormat("%Y-%m-%d");

    var data = prepare(rawData)

    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    // dimensions = d3.keys(data[0]).filter(function(d) { return d != "movie" })
    dimensions = d3.keys(data[0]);
    console.log(dimensions)


    // For each dimension, I build a linear scale. I store all in a y object
    var y = {}
    for (i in dimensions) {
      name = dimensions[i]
      if (name === "release") {
        y[name] = d3.scaleTime()
                  .domain(d3.extent(data, function(d) {
                    console.log(parseTime(d.release))
                    return d[name]; }))
                  .range([height, 0])
      }
      else if (name == "movie") {
        continue
      }
      else {
      y[name] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return d[name]; }) )
        .range([height, 0])
      }
    }
    console.log(data)
    console.log("y", y)
    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(dimensions.filter(function(d) { return d != "movie" }));

    console.log("x",x)

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.filter(function(d) { return d != "movie" }).map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg
      .selectAll("myPath")
      .data(data)
      .enter()
      .append("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)
      .style("stroke-width","1")
      .on("mouseover", mouseInFunc)
      .on("mouseout", mouseOutFunc)

    // Draw the axis:
    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions.filter(function(d) { return d != "movie" }))
        .enter()
      .append("g")
      .classed("axis", true)
      // I translate this element to its right position on the x axis
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      // And I build the axis with the call function
      .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
      // Add axis title
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "white")

  }

  function mouseInFunc() {
    var parseTime = d3.timeFormat("%B %d, %Y");
    this.parentNode.parentNode.appendChild(this.parentNode);//the path group is on the top with in its parent group
    this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);//the parent group is on the top with in its parent group
    d3.select(this).style('stroke', 'red');
    d3.select(this).style("stroke-width", "8")
    // console.log(d3.select(this).data())
    d3.selectAll('.title-movie').style("text-anchor", "middle").text("Movie: " + d3.select(this).data()[0].movie)
    d3.selectAll('.title-gross').style("text-anchor", "middle").text("Gross: " + d3.select(this).data()[0].gross)
    d3.selectAll('.title-season').style("text-anchor", "middle").text("Quarter: Q" + d3.select(this).data()[0].season)
    d3.selectAll('.title-rank').style("text-anchor", "middle").text("Rank: " + d3.select(this).data()[0].rank)
    d3.selectAll('.title-release').style("text-anchor", "middle").text("Release: " +  parseTime(d3.select(this).data()[0].release))

  }

  function mouseOutFunc() {
    this.parentNode.parentNode.appendChild(this.parentNode);//the path group is on the top with in its parent group
    this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);//the parent group is on the top with in its parent group
    // d3.select(this).style('fill', "none");
    d3.select(this).style('stroke', "#69b3a2");
    d3.select(this).style("stroke-width", "2")
    d3.selectAll('.title-movie').style("text-anchor", "middle").text("Movie: ")
    d3.selectAll('.title-gross').style("text-anchor", "middle").text("Gross: ")
    d3.selectAll('.title-season').style("text-anchor", "middle").text("Quarter:")
    d3.selectAll('.title-rank').style("text-anchor", "middle").text("Rank: ")
    d3.selectAll('.title-release').style("text-anchor", "middle").text("Release: ")
  }

  function prepare(rawData) {

    var parseTime = d3.timeParse("%Y%m%d");

    var result = []
    rawData.reduce(function(res, value) {
        result.push({ season: parseInt(value.season), rank: parseInt(value.rank), release: new Date(value.release), gross: parseFloat(value.gross), movie: value.movie })
      return res;
    }, {});
    return result

  }

  return full_process
}

var myPCoord = pCoord()

function prepare(error, data) {

  myPCoord(data)

}

d3.csv("./csvData/box_office_data_cleaned_4.csv", prepare)
