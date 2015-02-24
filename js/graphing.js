
var NETWORK_NAME = "ucl-cs-machineroom";

function getClassificationLabel(color){
	if(color=="green"){
		return "<span class='label label-success'>Green</span>"
	}
	else if(color=="orange" || color=="amber"){
		return "<span class='label label-warning'>Amber</span>"
	}
	else if (color=="red"){
		return "<span class='label label-danger'>Red</span>"
	}
	else{
		return "<span class='label label-default'>None</span>"
	}
}


function drawGraph(allData, sensorData, thresholds, graphId, graphTitle){
	allData = JSON.parse(allData);
	sensorData = JSON.parse(sensorData);
	thresholds = JSON.parse(thresholds);

	var timeSeries = []

	for(var x=0; x<sensorData.sensors.length; x++){
		var dataList = [];
		var sensor = sensorData.sensors[x]
		for(var z=0; z<allData.readings.length; z++){
			var reading = allData.readings[z];
			dataList.push([parseInt(reading.time)*1000, reading[sensor["id"].toString()]]);
		}
		timeSeries.push({
	        name: sensor["name"],
	        data: dataList,
	        yAxis:0,
	        tooltip: {
                valueSuffix: ' °C'
            },
            zIndex: 1
        });


	}

	var anomalyScores = []

	var getColor = function(score, thresholds){
			if (score > thresholds.red){
				return "red";
			}
			else if(score > thresholds.amber){
				return "orange";
			}
			else{
				return "green";
			}
		}

	for(var z=0; z<allData.readings.length; z++){
		var reading = allData.readings[z];
		anomalyScores.push({x: parseInt(reading.time)*1000, y: reading.anomalyScore, color: getColor(reading.anomalyScore, thresholds)});
	}
	timeSeries.push({
	    name: "Anomaly Score",
	    data: anomalyScores,
	    yAxis:1,
	    tooltip: {
	        valueSuffix: ''
	    },
	    type: 'column',
	    zIndex: 0,
	    turboThreshold: 0
     });

	$(function () {
	    $(graphId).highcharts({
	        chart: {
	            type: 'line'
	        },
	        title: {
	            text: graphTitle
	        },
	        subtitle: {
	            text: ''
	        },
	        xAxis: {
	            type: 'datetime',

	            title: {
	                text: 'Time'
	            }
	        },
	        yAxis: [{
	            title: {
	                text: 'Temperature/C'
	            },
	            min: 0,
	            tickInterval: 5,
	            minorTickInterval: 1
	        },
	        {
	        	title: {
	        		text: 'Anomaly Score'
	        	},
	        	min: 0,
	        	max: 1,
	        	opposite: true
	        	//tickInterval: 100
	        }],
	        tooltip: {
	            shared: true
	        },

	        plotOptions: {
	        	line: {
	        		marker: {
	        			enabled: false
	        		}
	        	},
	        	series:{
	        		point: {
	        			events: {
	        				click: function (e) {
	        					var reading = this;
	        					$('#modal-classification').html(function(){
	        						return getClassificationLabel(reading.color)
	        					});

	        					$.get("http://178.62.40.4/api/readings/getone?time="+(reading.x/1000))
										.done(function(data){
											var readingDB = JSON.parse(data);
											$('#modal-feedback').html(getClassificationLabel(readingDB.feedback));
										});
	        					$('#modal-anomalyscore').html(reading.y);
	        					$('#feedback-modal').modal('show');
	        					$( "#feedback-selection" ).change(function() {
								  var feedback_val = $("input[name='feedback-radio']:checked").val();
								  $('#modal-feedback').html(getClassificationLabel(feedback_val));
								  var timeUnix = (reading.x/1000).toString();
								  console.log(feedback_val);
								  var postdata = { time: timeUnix, feedback: feedback_val};
								  $.post( "http://178.62.40.4/api/feedback", JSON.stringify(postdata) );
								});
	        				}
	        			}
	        		}
	        	}
	        },

	        series: timeSeries
	    });
	});
}

function displayGraph(startTimeStamp, endTimeStamp, graph_id, graphTitle){
	$.get("http://178.62.40.4/api/readings-unixtime", {start: startTimeStamp, end: endTimeStamp})
		.done(function(data){
			//console.log(data);
			var tempData = data;
			$.get("http://178.62.40.4/api/sensors").
				done(function(data){
					var sensors = data;
					$.get("http://178.62.40.4/api/thresholds/get?network="+NETWORK_NAME).
						done(function(data){
							var thresholds = data;
							drawGraph(tempData, sensors, thresholds, graph_id, graphTitle);
						});
				});
		});
}