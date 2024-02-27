class scatterplot3 {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
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
      .attr('height', vis.config.containerHeight)
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.bottom})`);


    vis.x = d3.scaleLinear()
      .domain([0, d3.max(vis.data.objects.counties.geometries, d => d.properties.coronary)])
      .range([0, vis.width]);
    vis.xAxis = vis.svg.append("g")
      .attr('transform', `translate(${vis.config.margin.left}, ${vis.height})`);

    vis.y = d3.scaleLinear()
      .range([vis.height, 0]);
    vis.yAxis = vis.svg.append("g")
      .attr('transform', `translate(${vis.config.margin.left}, 0)`);

    vis.xtitle = vis.svg.append('text')
      .attr('x', 270)
      .attr('y', 290)
      .text('');

    vis.ytitle = vis.svg.append('text')
      .attr('x', -265)
      .attr('y', 12)
      .text('')
      .style('transform','rotate(270deg)');

    vis.updateVis("coronary", "bloodpressure");
  }

  updateVis(filter1, filter2){
    let vis = this;

    vis.x.domain([0, d3.max(vis.data.objects.counties.geometries, d => d.properties[filter1])]);
    vis.xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(vis.x));

    vis.y.domain([0, d3.max(vis.data.objects.counties.geometries, d => d.properties[filter2])]);
    vis.yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(vis.y));

    vis.xtitle.text(axisTitle(filter1));
    vis.ytitle.text(axisTitle(filter2));

    let circle = vis.svg.selectAll('circle').data(vis.data.objects.counties.geometries);

    circle
      .enter()
      .append('circle')
      .merge(circle)
      .transition()
      .duration(1000)
      .attr("cx", d => {
        if (d.properties[filter1] == -1 ){return(0)}
        else if (!d.properties.fips){return(0)}
        else {return(vis.x(d.properties[filter1])+vis.config.margin.left)}
      })
      .attr("cy",  d => {
        if (d.properties[filter2] == -1){return(0)}
        else if (!d.properties.fips){return(0)}
        else {return(vis.y(d.properties[filter2]))}
      })
      .attr("r", '3')
      .style("fill", "rgb(139, 166, 198)")
      .style("stroke", "white")
      .style("display", d => {
        if (d.properties[filter1] == -1 || d.properties[filter2] == -1){return("none")}
        else if (!d.properties.fips){return("none")}
        else {return("block")}
      });
    
    circle.exit().remove();

    circle = vis.svg.selectAll('circle').data(vis.data.objects.counties.geometries);
    circle
      .on('mouseover', (event,d) => {
        let attr1value = document.getElementById("attr1").value;
        let sel1 = document.getElementById("attr1");
        let text1 = sel1.options[sel1.selectedIndex].text;
        let attr2value = document.getElementById("attr2").value;
        let sel2 = document.getElementById("attr2");
        let text2 = sel2.options[sel2.selectedIndex].text;

        const attr1wholestring = event.properties[attr1value] != -1 ? `<strong>${event.properties[attr1value]}</strong> ${text1}` : 'No data available';
        const attr2wholestring = event.properties[attr2value] != -1 ? `<strong>${event.properties[attr2value]}</strong> ${text2}` : 'No data available';
        const urbanwholestring = event.properties.urbanstatus != -1 ? `<strong>${event.properties.urbanstatus}</strong>` : 'No data available';
        const name = event.properties.name  ? `<strong>${event.properties.name}</strong>` : 'No data available';
      
        d3.select('#tooltips1')
          .style('display', 'block')
          .style('left', (d3.event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (d3.event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
          <div>${name}</div>
          <div>${attr1wholestring}</div>
          <div>${attr2wholestring}</div>
          <div>${urbanwholestring}</div>
        `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltips1').style('display', 'none');
      });

  }
}