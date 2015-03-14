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


function addEventHandlers(){
	$('.feedback-button').click(function () {
		var time = this.id;
		var linkButton = this;
		$('#modal-classification').html(function(){
			return getClassificationLabel("red")
		});

		$.get("http://178.62.40.4/api/readings/getone?time="+time)
				.done(function(data){
					var readingDB = JSON.parse(data);
					$('#modal-feedback').html(getClassificationLabel(readingDB.feedback));
					$('#modal-anomalyscore').html(readingDB.anomalyScore);
				});
		$('#feedback-modal').modal('show');
		$( "#feedback-selection" ).change(function() {
		  $("#feedback-"+time).html("<b>Feedback:</b> "+getClassificationLabel($("input[name='feedback-radio']:checked").val()));
		  var feedback_val = $("input[name='feedback-radio']:checked").val();
		  $('#modal-feedback').html(getClassificationLabel(feedback_val));
		  console.log(feedback_val);
		  var postdata = { time: time, feedback: feedback_val};
		  $.post( "http://178.62.40.4/api/feedback", JSON.stringify(postdata) );
		});
	});

	$('.graph-button').click(function(){
		var timeStr = this.id.substring(6);
		var d = new Date(0);
		d.setUTCSeconds(parseInt(timeStr))
		displayGraph((parseInt(timeStr)-2*60*60).toString(), (parseInt(timeStr)+2*60*60).toString(), "#highchart-modal", d.toString());
		$('#graph-modal').modal('show');
	});

	$('.delete-notification').click(function(){
		var timeStr = this.id.substring(4);
		$(this).closest('li').hide('slow', function(){ this.remove()});
		var postdata = {times: [timeStr]};
		$.post("http://178.62.40.4/api/notifications/set", JSON.stringify(postdata));
	});

	$("#clear-red").click(function(){
		$('#red-alerts .delete-notification').trigger('click');
	})
	$("#clear-amber").click(function(){
		$('#amber-alerts .delete-notification').trigger('click');
	})


}


$.get("http://178.62.40.4/api/notifications/get").
	done(function(data){
		data = JSON.parse(data);
		function compare(a,b) {
  			if (a.time < b.time)
     			return 1;
  			if (a.time > b.time)
    			return -1;
  			return 0;
		}

		data.notifications.sort(compare);

		var numRed = 0;
		var numAmber = 0;

		for(var l=0; l<data.notifications.length; l++){
			var p = data.notifications[l];
			var feedbackHTML = "<span class='label label-default'>None</span>"
			if(p.feedback){
				if(p.feedback=="green"){
					feedbackHTML = "<span class='label label-success'>Green</span>"
				}
				else if(p.feedback=="amber"){
					feedbackHTML = "<span class='label label-warning'>Amber</span>"
				}
				else if(p.feedback=="red"){
					feedbackHTML = "<span class='label label-alert'>Red</span>"
				}
			}
			var d = new Date(0);
			d.setUTCSeconds(p.time)
			if(p.classification=="red"){
				numRed++;
			}
			else{
				numAmber++;
			}
			$("#"+p.classification+"-alerts").append("<li class='list-group-item'><table><tr><td class='col-md-4'><b>Time: </b>"+d+"</td><td class='col-md-2'> <b>Classification:</b> "+getClassificationLabel(p.classification)+" </td><td class='col-md-2' id='feedback-"+p.time+"'><b>Feedback:</b>  "+feedbackHTML+" </td><td class='col-md-1'>  <a class='btn btn-primary graph-button' id='graph-"+p.time+"'>View Graph</a></td><td class='col-md-1'><a class='btn btn-primary feedback-button' id='"+p.time+"'>Give Feedback</a></td><td><a  id='del-"+p.time+"' class='btn delete-notification'><span class='glyphicon glyphicon-remove'></span></td><a></tr></table></li>");

		}
		if(numRed==0){
			$("#no-red").text("No Red Alerts");
		}
		if(numAmber==0){
			$("#no-amber").text("No Amber Alerts");
		}
		$.getScript("js/graphing.js", function(){
   			addEventHandlers();
		});

	});