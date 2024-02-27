class barChart1 {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, start) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 750,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || {top: 10, right: 10, bottom: 30, left: 50},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;

    this.start = start;
    // this.config = _config;

    /*this.us = _data;

    this.active = d3.select(null);*/

    this.initVis();
  }
  

  initVis() {
    let vis = this;

    let histogram = d3.histogram()
    .value(function(d) { return d.properties.bloodpressure; })
    .domain([0,100])    // Set the domain to cover the entire intervall [0,1]
    .thresholds(9);

    let bins = histogram(vis.data.objects.counties.geometries);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
      .attr('class', 'center-container')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.bottom})`);
    
    vis.x = d3.scaleLinear()
      .domain([0, d3.max(vis.data, d => d.properties.coronary)])
      .range([0, vis.width]);
    vis.xAxis = vis.svg.append("g")
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.height})`);

    vis.y = d3.scaleLinear()
      .range([vis.height, 0]);
    vis.yAxis = vis.svg.append("g")
      .attr('transform', `translate(${vis.config.margin.left}, 0)`);

    vis.colorScale = d3.scaleLinear()
      .domain([0,d3.max(vis.data, d => d.properties.coronary)])
      .range(['#cfe2f2', '#0d306b'])
      .interpolate(d3.interpolateHcl);
    
    vis.xtitle = vis.svg.append('text')
      .attr('x', 270)
      .attr('y', 290)
      .text('');

    vis.ytitle = vis.svg.append('text')
      .attr('x', -170)
      .attr('y', 12)
      .text('')
      .style('transform','rotate(270deg)');

    vis.updateVis(vis.start);
  }


  updateVis(filter){
    let vis = this;
    let data = filteredData(filter, vis.data);


    /*bins.forEach(element => {
      console.log(element);
      console.log('length '+element.length)
    });*/
    let histogram = d3.histogram()
    .value(function(d) { return d; })
    .domain([0, d3.max(data, d => d)])
    .thresholds(10);

    let bins = histogram(data)

    vis.x.domain([0, d3.max(data, function(d) { return d; })]);
    vis.xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(vis.x));

    vis.y.domain([0, d3.max(bins, function(d) { return d.length; })]);
    vis.yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(vis.y));

    vis.colorScale.domain([0, d3.max(bins, function(d) { return d.length; })]);

    vis.xtitle.text(axisTitle(filter));
    vis.ytitle.text('# of Counties');

    let rect = vis.svg.selectAll('rect').data(bins);

    rect
      .enter()
      .append('rect')
      .merge(rect)
      .transition()
      .duration(1000)
      .attr("x", 0)
      .attr("transform", function(d) { return "translate(" + (vis.x(d.x0) + vis.config.margin.left) + "," + vis.y(d.length) + ")"; })
      .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0); })
      .attr("height", function(d) { return vis.height - vis.y(d.length); })
      .attr("fill", function(d) { return vis.colorScale(vis.height - vis.y(d.length))});

    rect.exit().remove();

    rect = vis.svg.selectAll('rect').data(bins);
    rect
      .on('mouseover', (event,d) => {
      
        d3.select('#tooltiph1')
          .style('display', 'block')
          .style('left', (d3.event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (d3.event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
            <p><strong>${event.length}</strong> counties between <strong>${event.x0}</strong> and <strong>${event.x1}</strong></p>
        `);
        })
      .on('mouseleave', () => {
        d3.select('#tooltiph1').style('display', 'none');
      });
  }

}