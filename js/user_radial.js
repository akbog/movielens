
function radarVis() {

  function draw (id, d, options) {
    var cfg = {
  	 radius: 5,
  	 w: document.getElementsByClassName("user-radar")[0].offsetWidth,
  	 h: document.getElementsByClassName("user-radar")[0].offsetHeight,
  	 factor: 1,
  	 factorLegend: .85,
  	 levels: 5,
  	 maxValue: 0,
  	 radians: 2 * Math.PI,
  	 opacityArea: 0.5,
  	 ToRight: 0,
  	 TranslateX: 0,
  	 TranslateY: 0,
  	 ExtraWidthX: 0,
  	 ExtraWidthY: 0,
  	 color: d3.scaleOrdinal(d3.schemeCategory10),
     padding : 150,
  	};

    if('undefined' !== typeof options){
      for(var i in options){
      if('undefined' !== typeof options[i]){
        cfg[i] = options[i];
      }
      }
    }

    if('undefined' == typeof d){
      var radius = cfg.factor*Math.min((cfg.w - cfg.padding)/2, (cfg.h - cfg.padding)/2);
      d3.select(id).select("svg").remove();
      var allAxis = (Array(5).fill(""));
      var total = allAxis.length;
      var g = d3.select(id)
    			.append("svg")
    			.attr("width", cfg.w)
    			.attr("height", cfg.h)
    			.append("g")
    			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
    			;
      for(var j=0; j<cfg.levels-1; j++){
    	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
        console.log("levelFactor", levelFactor)
    	  g.selectAll(".levels")
    	   .data(allAxis)
    	   .enter()
    	   .append("svg:line")
    	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
    	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
    	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
    	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
    	   .attr("class", "line")
    	   .style("stroke", "white")
    	   .style("stroke-opacity", "0.9")
    	   .style("stroke-width", "0.3px")
    	   .attr("transform", "translate(" + (cfg.padding/2 + (cfg.w  - cfg.padding)/2 -levelFactor) + ", " + (cfg.padding/2 + (cfg.h - cfg.padding)/2 - levelFactor) + ")");

         var axis = g.selectAll(".axis")
             .data(allAxis)
             .enter()
             .append("g")
             .attr("class", "axis");

         //Lines
         axis.append("line")
           .attr("x1", cfg.padding/2 + (cfg.w - cfg.padding)/2)
           .attr("y1", cfg.padding/2 + (cfg.h - cfg.padding)/2)
           .attr("x2", function(d, i){return cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
           .attr("y2", function(d, i){return cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
           .attr("class", "line")
           .style("stroke", "grey")
           .style("stroke-width", "1px");
    	}
  	} else {
      console.log(d)

      //Gets max value from plott-able data
    	cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
      //Gets unique axis values from chart (in our case there will be a hard cut-off (average watch of genre, and then individuals))
    	var allAxis = (d[0].map(function(i, j){return i.axis}));
      console.log("allAxis", allAxis)
      //Number of axis
    	var total = allAxis.length;
      //Calculates the size of the chart via radius
    	var radius = cfg.factor*Math.min((cfg.w - cfg.padding)/2, (cfg.h - cfg.padding)/2);
    	var Format = d3.format(',.1%');
    	d3.select(id).select("svg").remove();

      //creating SVG, scaling to width, height
    	var g = d3.select(id)
    			.append("svg")
    			.attr("width", cfg.w)
    			.attr("height", cfg.h)
    			.append("g")
    			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
    			;

    	var tooltip;

    	//Circular segments
      //sensitive to radius and levels
    	for(var j=0; j<cfg.levels-1; j++){
    	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
        console.log("levelFactor", levelFactor)
    	  g.selectAll(".levels")
    	   .data(allAxis)
    	   .enter()
    	   .append("svg:line")
    	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
    	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
    	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
    	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
    	   .attr("class", "line")
    	   .style("stroke", "white")
    	   .style("stroke-opacity", "0.9")
    	   .style("stroke-width", "0.3px")
    	   .attr("transform", "translate(" + (cfg.padding/2 + (cfg.w  - cfg.padding)/2 -levelFactor) + ", " + (cfg.padding/2 + (cfg.h - cfg.padding)/2 - levelFactor) + ")");
    	}

    	//Text indicating at what % each level is
      //Labels
    	for(var j=0; j<cfg.levels; j++){
    	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
    	  g.selectAll(".levels")
    	   .data([1]) //dummy data
    	   .enter()
    	   .append("svg:text")
    	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
    	   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
    	   .attr("class", "legend")
    	   .style("font-family", "sans-serif")
    	   .style("font-size", "10px")
    	   .attr("transform", "translate(" + (cfg.padding/2 + (cfg.w - cfg.padding)/2 - levelFactor + cfg.ToRight) + ", " + (cfg.padding/2 + (cfg.h- cfg.padding)/2-levelFactor) + ")")
    	   .attr("fill", "white")
    	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
    	}

    	series = 0;

    	var axis = g.selectAll(".axis")
    			.data(allAxis)
    			.enter()
    			.append("g")
    			.attr("class", "axis");

      //Lines
    	axis.append("line")
    		.attr("x1", cfg.padding/2 + (cfg.w - cfg.padding)/2)
    		.attr("y1", cfg.padding/2 + (cfg.h - cfg.padding)/2)
    		.attr("x2", function(d, i){return cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
    		.attr("y2", function(d, i){return cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
    		.attr("class", "line")
    		.style("stroke", "grey")
    		.style("stroke-width", "1px");

    	axis.append("text")
    		.attr("class", "legend")
    		.text(function(d){return d})
    		.style("font-family", "sans-serif")
    		.style("font-size", "11px")
    		.attr("text-anchor", "middle")
    		.attr("dy", "1.5em")
        .style("stroke", "white")
    		.attr("transform", function(d, i){return "translate(0, -20)"})
    		.attr("x", function(d, i){return cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
    		.attr("y", function(d, i){return cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});


    	d.forEach(function(y, x){
    	  dataValues = [];
    	  g.selectAll(".nodes")
    		.data(y, function(j, i){
    		  dataValues.push([
    			cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
    			cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
    		  ]);
    		});
    	  dataValues.push(dataValues[0]);
    	  g.selectAll(".area")
    					 .data([dataValues])
    					 .enter()
    					 .append("polygon")
    					 .attr("class", "radar-chart-serie"+series)
    					 .style("stroke-width", "2px")
    					 .style("stroke", cfg.color(series))
    					 .attr("points",function(d) {
    						 var str="";
    						 for(var pti=0;pti<d.length;pti++){
    							 str=str+d[pti][0]+","+d[pti][1]+" ";
    						 }
    						 return str;
    					  })
    					 .style("fill", function(j, i){return cfg.color(series)})
    					 .style("fill-opacity", cfg.opacityArea)
    					 .on('mouseover', function (d){
    										z = "polygon."+d3.select(this).attr("class");
    										g.selectAll("polygon")
    										 .transition(200)
    										 .style("fill-opacity", 0.1);
    										g.selectAll(z)
    										 .transition(200)
    										 .style("fill-opacity", .7);
    									  })
    					 .on('mouseout', function(){
    										g.selectAll("polygon")
    										 .transition(200)
    										 .style("fill-opacity", cfg.opacityArea);
    					 });
    	  series++;
    	});
    	series=0;


    	d.forEach(function(y, x){
    	  g.selectAll(".nodes")
    		.data(y).enter()
    		.append("svg:circle")
    		.attr("class", "radar-chart-serie"+series)
    		.attr('r', cfg.radius)
    		.attr("alt", function(j){return Math.max(j.value, 0)})
    		.attr("cx", function(j, i){
    		  dataValues.push([
    			cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
    			cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
    		]);
    		return cfg.padding/2 + (cfg.w - cfg.padding)/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
    		})
    		.attr("cy", function(j, i){
    		  return cfg.padding/2 + (cfg.h - cfg.padding)/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
    		})
    		.attr("data-id", function(j){return j.axis})
    		.style("fill", cfg.color(series)).style("fill-opacity", .9)
    		.on('mouseover', function (d){
    					newX =  parseFloat(d3.select(this).attr('cx')) - 10;
    					newY =  parseFloat(d3.select(this).attr('cy')) - 5;

    					tooltip
    						.attr('x', newX)
    						.attr('y', newY)
    						.text(Format(d.value))
    						.transition(200)
    						.style('opacity', 1);

    					z = "polygon."+d3.select(this).attr("class");
    					g.selectAll("polygon")
    						.transition(200)
    						.style("fill-opacity", 0.1);
    					g.selectAll(z)
    						.transition(200)
    						.style("fill-opacity", .7);
    				  })
    		.on('mouseout', function(){
    					tooltip
    						.transition(200)
    						.style('opacity', 0);
    					g.selectAll("polygon")
    						.transition(200)
    						.style("fill-opacity", cfg.opacityArea);
    				  })
    		.append("svg:title")
    		.text(function(j){return Math.max(j.value, 0)});

    	  series++;
    	});
    	//Tooltip
    	tooltip = g.append('text')
    			   .style('opacity', 0)
    			   .style('font-family', 'sans-serif')
    			   .style('font-size', '13px');
    }
}

  function radarChart(rawData){

  var w = document.getElementsByClassName("user-radar")[0].offsetWidth,
  	h = document.getElementsByClassName("user-radar")[0].offsetHeight;

  var colorscale = d3.scaleOrdinal(d3.schemeCategory10)

  //Legend titles
  var LegendOptions = ['Cluster', 'User'];

  //Options for the Radar chart, other than default
  var mycfg = {
    w: Math.min(w, h),
    h: Math.min(w, h)
  }

  var paddingx = 240;
  var paddingy = 200;

  var d = getSampleData(rawData)
  console.log(d)

  //Call function to draw the Radar chart
  //Will expect that data is in %'s

  draw(".user-radar", d, mycfg);

  var svg = d3.select('.user-radar')
              .selectAll("svg")
            	.append('svg')
            	.attr("width", mycfg.w )
            	.attr("height", mycfg.h )
              .append("g")


  //Create the title for the legend
  var text = svg.append("text")
  	.attr("class", "title")
  	// .attr('transform', 'translate(90,0)')
  	.attr("x", mycfg.w - paddingx + 20 + 20)
  	.attr("y", mycfg.w-paddingy)
  	.attr("font-size", "12px")
  	.attr("fill", "white")
  	.text("% Top 5 Genres in Cluster");

  //Initiate Legend
  var legend = svg.append("g")
  	.attr("class", "legend")
  	.attr("height", 50)
  	.attr("width", 50)
  	.attr('transform', 'translate(90,20)')
  	;
  	//Create colour squares
  	legend.selectAll('rect')
  	  .data(LegendOptions)
  	  .enter()
  	  .append("rect")
  	  .attr("x", mycfg.w - paddingx - 20)
  	  .attr("y", function(d, i){ return mycfg.h - paddingy + i * 20;})
  	  .attr("width", 10)
  	  .attr("height", 10)
  	  .style("fill", function(d, i){ return colorscale(i);})
  	  ;
  	//Create text next to squares
  	legend.selectAll('text')
  	  .data(LegendOptions)
  	  .enter()
  	  .append("text")
  	  .attr("x", mycfg.w - paddingx)
  	  .attr("y", function(d, i){ return mycfg.h - paddingy + i * 20 + 9;})
  	  .attr("font-size", "11px")
  	  .attr("fill", "white")
  	  .text(function(d) { return d; })
  	  ;
  }

  function getSampleData(rawData) {
    var user_id = 1
    if('undefined' == typeof rawData){
      return rawData
      // return [Array(5).fill({axis : "", value : 1}), Array(5).fill({axis : "", value : 0})]
    }
    // var result = rawData.reduce(function(res, value) {
    //   var key = value.genres
    //   if (!res[key]) {
    //     res[key] = {axis : value.genres, value : 0}
    //   }
    //   res[key].value += 1
    //   return res
    // }, {});
    // var result2 = Object.keys(result).map(i => result[i])
    // return [result2.slice(20,25), result2.slice(10,20)]
    return rawData
  }

return radarChart

  }
//
// var myRadarChart = radarVis()
//
// function bubbles(error, data) {
//   // console.log(data)
//
//   cluster_chart = myRadarChart(data)
//   //Now Let's get it to the right dimensions and scale :)
//
//
// }
//
//
// d3.csv('/getdata?_=' + new Date().getTime())
// d3.csv("./csvData/exported_kmeans.csv", bubbles)
