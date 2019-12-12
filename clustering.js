var myRadarChart = radarVis()

function clusterVis() {

  var width = document.getElementsByClassName("bubble-chart")[0].offsetWidth,
      height = document.getElementsByClassName("bubble-chart")[0].offsetHeight,
      maxRadius = 12;

  var nodes = null;

  var svg = null;

  var circle = null;

  var clusters = null;

  var radiusScale = null;

  var cluster_chart = null;

  var forceCollide = d3.forceCollide()
      .radius(function(d) { return radiusScale(d.num_ratings) + 2; })
      .iterations(1);

  function tick() {
    circle
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function forceCluster(alpha) {
    for (var i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
      node = nodes[i];
      cluster = clusters[node.cluster];
      node.vx -= (node.x - cluster.x) * k;
      node.vy -= (node.y - cluster.y) * k;
    }
  }


  function chart(rawData) {

    cluster_chart = myRadarChart()

    clusters = new Array((d3.map(rawData, function(d) { return d.cluster }).keys().length))
    console.log(clusters.length)

    var color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(rawData.map( function(d) {return d.cluster }));

    nodes = getNodes(rawData)

    var num_clusters = (d3.map(nodes, function(d) { return d.cluster }).keys().length)

    d3.selectAll(".title-cluster")
                  .append("h4")
                  .text(nodes.length + " Users have been clustered into " + num_clusters + " clusters, using K-means clustering")

    var maxAmount = d3.max(rawData, function(d) {return parseFloat(d.num_ratings); })

    radiusScale = d3.scalePow()
                        .exponent(1)
                        .domain([0, maxAmount])
                        .range([2,width/50]);

    svg = d3.select(".bubble-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    circle = svg.selectAll("circle")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("r", function(d) { return radiusScale(d.num_ratings); })
                    .style("fill", function(d) { return color(d.cluster); })
                    .on('mouseover', callRadial)
                    .on('mouseout', hideRadial);

    var simulation = d3.forceSimulation()
                  .nodes(nodes)
                  .force("center", d3.forceCenter())
                  .force("collide", forceCollide)
                  .force("cluster", forceCluster)
                  .force("gravity", d3.forceManyBody(30))
                  .force("x", d3.forceX().strength(.8))
                  .force("y", d3.forceY().strength(.8))
                  .on("tick", tick);

    function callRadial() {
      d3.select(this).attr('stroke', function(d) { return color(d.cluster)})
                      .attr("stroke-opacity", 0.75)
                      .attr("stroke-width", 20);


      console.log('user_data', d3.select(this).data()[0]['cluster'])
      console.log(rawData)
      // var user = getTopGenres('userId', rawData, d3.select(this).data()[0])
      var clustering = getTopGenres('cluster', rawData, d3.select(this).data()[0])
      var clusters= clustering.slice(Math.max(clustering.length - 5, 1))
      var total_cluster = getTotal(clusters)
      console.log("total_cluster", total_cluster)
      clusters.map(function(entry) {
                  entry.value = entry.value / total_cluster;
                })
      var user = getTopGenres('userId', rawData, d3.select(this).data()[0])
      var bIds = {}
            clusters.forEach(function(obj){
                bIds[obj.axis] = obj;
            });

            // Return all elements in A, unless in B
      var user_2 = user.filter(function(obj){
                return (obj.axis in bIds);
            });
      var total_user = getTotal(user_2)
      user_2.map(function(entry) {
                entry.value = entry.value/total_user
      })
      console.log('user',user_2)
      console.log('clusters', clusters)
      cluster_chart = myRadarChart([clusters,user_2])
    }

    function hideRadial() {
      d3.select(this)
        .attr('stroke', function(d) { return color(d.cluster)})
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 0);
      cluster_chart = myRadarChart()
    }

    function getTotal(data) {
      var total = 0;
      data.reduce(function(res, value) {
        total += value.value
      })
      return total
    }

    function getTopGenres(attr, data, user) {
      var select = data.filter(function (indi) {
                          return indi[attr] === user[attr];
                        });
      var total = 0;
      var result = select.reduce(function(res, value) {
        var key = value.genres
        if (!res[key]) {
          res[key] = {axis : value.genres, value : 0}
        }
        total += 1
        res[key].value += 1
        return res
      }, {});
      var result2 = Object.keys(result).map(i => result[i])
      result2.sort(function(a,b) { return parseFloat(a.value) - parseFloat(b.value) } );
      return result2
    }
  }

  function getNodes(rawData) {
    //Grouping by userId
    var result = []
    var cluster_counts = []
    rawData.reduce(function(res, value) {
      var key = value.userId
      if(!res[key]) {
        res[key] = {userId : value.userId, num_ratings : value.num_ratings, cluster : value.cluster}
        result.push(res[key])
      }
      if (!clusters[value.cluster] || (value.num_ratings > clusters[value.cluster].num_ratings)) {
        clusters[value.cluster] = res[key];
      }
      return res
    }, {});

    var result2 = []
    var nodes_dict = result.reduce(function(res, value) {
                var key = value.cluster
                if(!res[key]){
                  res[key] = {total_nodes : 0}
                }
                  res[key].total_nodes += 1
                  return res
              });
    result.forEach(function(d) {
      if (nodes_dict[d.cluster].total_nodes > 5) {
        result2.push(d)
      }
    })
    return result2;
};

  return chart;

}
