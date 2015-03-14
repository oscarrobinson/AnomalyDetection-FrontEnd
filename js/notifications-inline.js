function loadNotifications(){	
	$.get("http://178.62.40.4/api/notifications/get?basic=true").
		done(function(data){
			data = JSON.parse(data)
			var redNum = data.red;
			var amberNum = data.amber;
			var html = "<span class='label label-default'>0</span>";
			if(redNum>0){
				html = "<span class='label label-danger'>"+redNum+"</span>";
			}
			if(amberNum>0 &&  !(redNum>0)){
				html ="<span class='label label-warning'>"+amberNum+"</span>";
			}
			else if(amberNum>0 && redNum>0){
				html+="<span class='label label-warning'>"+amberNum+"</span>";
			}
			$('#alert-inline').html(html);
		});
	setTimeout(loadNotifications, 5*1000);
}

loadNotifications();