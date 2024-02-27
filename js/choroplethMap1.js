class ChoroplethMap1 {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 750,
      containerHeight: _config.containerHeight || 350,
      margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;

    this.us = _data;

    this.active = d3.select(null);

    this.initVis();
  }
  
  

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
            .attr('width', vis.config.containerHeight) //width + margin.left + margin.right)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);
    vis.colorScale = d3.scaleLinear()
      .domain([0,100])
      .range(['#cfe2f2', '#0d306b'])
      .interpolate(d3.interpolateHcl);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)

    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                .attr('fill', d => {
                      if (d.properties.coronary != -1) {
                        return vis.colorScale(d.properties.coronary);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

      vis.counties
                .on('mouseover', (d,event) => {
                  let attr1value = document.getElementById("attr1").value;
                  let sel1 = document.getElementById("attr1");
                  let text1 = sel1.options[sel1.selectedIndex].text;
                  let attr2value = document.getElementById("attr2").value;
                  let sel2 = document.getElementById("attr2");
                  let text2 = sel2.options[sel2.selectedIndex].text;

                  const attr1wholestring = d.properties[attr1value] != -1 ? `<strong>${d.properties[attr1value]}</strong> ${text1}` : 'No data available';
                  const attr2wholestring = d.properties[attr2value] != -1 ? `<strong>${d.properties[attr2value]}</strong> ${text2}` : 'No data available';
                  const urbanwholestring = d.properties.urbanstatus != -1 ? `<strong>${d.properties.urbanstatus}</strong>` : 'No data available';
                  const name = d.properties.name  ? `<strong>${d.properties.name}</strong>` : 'No data available';
                  d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
                      <div class="tooltip-title">${name}</div>
                      <div>${attr1wholestring}</div>
                      <div>${attr2wholestring}</div>
                      <div>${urbanwholestring}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'block');
                  });



    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);

  }

  updateVis(filter) {
    let vis = this;
    let data1 = filteredData(filter, vis.data);

    vis.colorScale.domain([0,d3.max(data1, d => d)])

    vis.counties
      .data(topojson.feature(vis.us, vis.us.objects.counties).features)
      .each(
        function (d, i) {
          if (data1[i] != -1){
            d3.select(this).attr('fill',vis.colorScale(data1[i]));
          }
          else{
            d3.select(this).attr('fill','url(#lightstripe)');
          }
        }
      )
    

  }
}