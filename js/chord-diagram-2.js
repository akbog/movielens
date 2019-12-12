
       d3.csv("./csvData/Chord_Diagram_Genre_Mat_2.csv", function(error, data) {
           var mpr = chordMpr(data);
           mpr
               .addValuesToMap('Genre_1')
               .addValuesToMap('Genre_2')
               .setFilter(function(row, a, b) {
                    // console.log(row.Genre_1 === a.name && row.Genre_2 === b.name)
                   return (row.Genre_1 === a.name && row.Genre_2 === b.name)
               })
               .setAccessor(function(recs, a, b) {
                   if (!recs[0]) return 0;
                   return +recs[0].Count;
               });
           drawChords(mpr.getMatrix(), mpr.getMap());
       });

       function drawChords(matrix, mmap) {

           var w = document.getElementsByClassName("chord-chart")[0].offsetWidth,
                h = document.getElementsByClassName("chord-chart")[0].offsetHeight,
               r1 = h / 2,
               r0 = r1 - 110;

           var chord = d3.chord()
               .padAngle(0.05)
               .sortSubgroups(d3.descending)
               .sortChords(d3.descending);

           var arc = d3.arc()
               .innerRadius(r0)
               .outerRadius(r0 + 20);

           var ribbon = d3.ribbon()
               .radius(r0);

           var svg = d3.select(".chord-chart")
              .append("svg:svg")
               .attr("width", w)
               .attr("height", h)
               .append("svg:g")
               .attr("id", "circle")
               .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
               .datum(chord(matrix))
               // .on("mouseover", mousefunc);

           svg.append("circle")
               .attr("r", r0 + 20)
               .style("fill", "white")
               .style("opacity", "10%");

           var mapReader = chordRdr(matrix, mmap);


           var g = svg.selectAll("g.group")
               .data(function(chords) {
                   return chords.groups;
               })
               .enter().append("svg:g")
               .attr("class", "group")

           g.append("svg:path")
               .style("stroke", "none")
               .style("fill", "grey")
               // .style("fill", function(d) {
               //     return mapReader(d).gdata;
               // })
               .attr("d", arc)
               // .on("mouseover", mousefunc);

           g.append("svg:text")
               .each(function(d) {
                   d.angle = (d.startAngle + d.endAngle) / 2;
               })
               .attr("dy", ".35em")
               .style("font-family", "helvetica, arial, sans-serif")
               .style("font-size", "12px")
               .style("fill", "white")
               .style("stroke", "white")
               .attr("text-anchor", function(d) {
                   return d.angle > Math.PI ? "end" : null;
               })
               .attr("transform", function(d) {
                   return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                       "translate(" + (r0 + 26) + ")" +
                       (d.angle > Math.PI ? "rotate(180)" : "");
               })
               .text(function(d) {
                   return mapReader(d).gname;
               });

           var colors = d3.scaleOrdinal(d3.schemeCategory20c);

           var chordPaths = svg.selectAll("path.chord")
               .data(function(chords) {
                   return chords;
               })
               .enter().append("svg:path")
               .attr("class", "chord")
               .style("stroke", "none")
               .style("fill", function(d, i) {
                   return colors(i)
               })
               .style("opacity", "35%")
               .attr("d", ribbon.radius(r0))
               .on("mouseover", mouseInFunc)
               .on("mouseout", mouseOutFunc)


          function mouseInFunc() {
            this.parentNode.parentNode.appendChild(this.parentNode);//the path group is on the top with in its parent group
            this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);//the parent group is on the top with in its parent group
            d3.select(this).style('opacity', '100%');
          }

          function mouseOutFunc() {
            this.parentNode.parentNode.appendChild(this.parentNode);//the path group is on the top with in its parent group
            this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);//the parent group is on the top with in its parent group
            d3.select(this).style('opacity', '50%');
          }

       }
