/**
 * Load TopoJSON data of the world and the data of the world wonders
 */
let barchart1, barchart2, barchart3, choroplethMap1,choroplethMap2;

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const countyData = data[1];

  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.counties.geometries.forEach(d => {
    for (let i = 0; i < countyData.length; i++) {
      if (d.id === countyData[i].cnty_fips) {
        d.properties.fips = countyData[i].cnty_fips;
        d.properties.name = countyData[i].display_name;
        d.properties.poverty = +countyData[i].poverty_perc;
        d.properties.income = +countyData[i].median_household_income;
        d.properties.educationlths = +countyData[i].education_less_than_high_school_percent;
        d.properties.air = +countyData[i].air_quality;
        d.properties.park = +countyData[i].park_access;
        d.properties.inactive = +countyData[i].percent_inactive;
        d.properties.smoking = +countyData[i].percent_smoking;
        d.properties.urbanstatus = countyData[i].urban_rural_status;
        d.properties.elderly = +countyData[i].elderly_percentage;
        d.properties.hospitals = +countyData[i].number_of_hospitals;
        d.properties.physicians = +countyData[i].number_of_primary_care_physicians;
        d.properties.noinsurance = +countyData[i].percent_no_heath_insurance;
        d.properties.bloodpressure = +countyData[i].percent_high_blood_pressure;
        d.properties.coronary = +countyData[i].percent_coronary_heart_disease;
        d.properties.stroke = +countyData[i].percent_stroke;
        d.properties.cholesterol = +countyData[i].percent_high_cholesterol;
        //console.log(d);
      }
    }
  });

  barchart1 = new barChart1({
    parentElement: '.barchart1viz',
  }, geoData, "coronary");

  barchart2 = new barChart1({
    parentElement: '.barchart2viz',
  }, geoData, "bloodpressure");

  barchart3 = new scatterplot3({
    parentElement: '.barchart3viz',
  }, geoData);

  choroplethMap1 = new ChoroplethMap1({
    parentElement: '.choropleth1viz',
  }, geoData);

  choroplethMap2 = new ChoroplethMap1({
    parentElement: '.choropleth2viz',
  }, geoData);
  choroplethMap2.updateVis(document.getElementById("attr2").value);//init data is for coronary so call this to update right away
})
.catch(error => console.error(error));



document.getElementById("attr1").onchange = function(){
    barchart1.updateVis(this.value);
    let sel1 = document.getElementById("attr1");
    let text1 = sel1.options[sel1.selectedIndex].text;
    let element1 = document.getElementById("barchart1label");
    element1.innerText = text1;
    let sel2 = document.getElementById("attr2");
    let text2 = sel2.options[sel2.selectedIndex].text;
    let element3 = document.getElementById("barchart3label");
    element3.innerText = (text1 + ' - ' + text2);
    barchart3.updateVis(document.getElementById("attr1").value, document.getElementById("attr2").value);
    choroplethMap1.updateVis(document.getElementById("attr1").value);
    choroplethMap2.updateVis(document.getElementById("attr2").value);
}

document.getElementById("attr2").onchange = function(){
  barchart2.updateVis(this.value);
  let sel1 = document.getElementById("attr1");
  let text1 = sel1.options[sel1.selectedIndex].text;
  let sel2 = document.getElementById("attr2");
  let text2 = sel2.options[sel2.selectedIndex].text;
  let element2 = document.getElementById("barchart2label");
  element2.innerText = text2;
  let element3 = document.getElementById("barchart3label");
  element3.innerText = (text1 + ' - ' + text2);
  barchart3.updateVis(document.getElementById("attr1").value, document.getElementById("attr2").value);
  choroplethMap1.updateVis(document.getElementById("attr1").value);
  choroplethMap2.updateVis(document.getElementById("attr2").value);
}

function filteredData(filter, origData){
  if(filter === "poverty"){return(origData.objects.counties.geometries.map(d => d.properties.poverty))}
  else if(filter === "income"){return(origData.objects.counties.geometries.map(d => d.properties.income))}
  else if(filter === "educationlths"){return(origData.objects.counties.geometries.map(d => d.properties.educationlths))}
  else if(filter === "air"){return(origData.objects.counties.geometries.map(d => d.properties.air))}
  else if(filter === "park"){return(origData.objects.counties.geometries.map(d => d.properties.park))}
  else if(filter === "inactive"){return(origData.objects.counties.geometries.map(d => d.properties.inactive))}
  else if(filter === "smoking"){return(origData.objects.counties.geometries.map(d => d.properties.smoking))}
  else if(filter === "urbanstatus"){return(origData.objects.counties.geometries.map(d => d.properties.urbanstatus))}
  else if(filter === "elderly"){return(origData.objects.counties.geometries.map(d => d.properties.elderly))}
  else if(filter === "hospitals"){return(origData.objects.counties.geometries.map(d => d.properties.hospitals))}
  else if(filter === "physicians"){return(origData.objects.counties.geometries.map(d => d.properties.physicians))}
  else if(filter === "noinsurance"){return(origData.objects.counties.geometries.map(d => d.properties.noinsurance))}
  else if(filter === "bloodpressure"){return(origData.objects.counties.geometries.map(d => d.properties.bloodpressure))}
  else if(filter === "coronary"){return(origData.objects.counties.geometries.map(d => d.properties.coronary))}
  else if(filter === "stroke"){return(origData.objects.counties.geometries.map(d => d.properties.stroke))}
  else if(filter === "cholesterol"){return(origData.objects.counties.geometries.map(d => d.properties.cholesterol))}
}

function axisTitle(filter){
  if(filter === "poverty"){return("% of Poverty")}
  else if(filter === "income"){return("Median Hosehold Income ($)")}
  else if(filter === "educationlths"){return("% of Education Less Than High School")}
  else if(filter === "air"){return("Air Quality Index")}
  else if(filter === "park"){return("% of Park Access")}
  else if(filter === "inactive"){return("% of Inactive Residents")}
  else if(filter === "smoking"){return("% of Smoking Residents")}
  else if(filter === "urbanstatus"){return("Urban Rural Suburban Status")}
  else if(filter === "elderly"){return("% of Elderly Residents")}
  else if(filter === "hospitals"){return("# of Hospitals")}
  else if(filter === "physicians"){return("# of Primary Care Physicians")}
  else if(filter === "noinsurance"){return("% of Residents With No Health Insurance")}
  else if(filter === "bloodpressure"){return("% of Residents wth High Blood Pressure")}
  else if(filter === "coronary"){return("% of Residents with Coronary Heart Disease")}
  else if(filter === "stroke"){return("% of Residents who have had a Stroke")}
  else if(filter === "cholesterol"){return("% of Residents with High Cholesterol")}
}