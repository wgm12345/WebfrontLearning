var nowCell = getNowCell();	// 获取当前节点
var sourceCell = nowCell.source; // 获取上一个功能节点

$(function(){	
	//初始化数据
	init();	
	if(sourceCell.typeId == "f3"){ // 条件分支
		$('#trCondition').show();
		var selectCondition = nowCell.getAttribute('pointCondition');
		if(selectCondition == undefined) { // 默认为请选择
			$('#pointCondition').val("");	 
		} else {
			$('#pointCondition').val(selectCondition);		
		}			
	} else {
		$('#trCondition').hide();
	}
});		

//保存xml
function savePoint(){	
	var pointName='';
	var pointCondition = $("#pointCondition").val();
	if(sourceCell.typeId == "f3"){ // 条件分支
//		var selectCondition = $('#selectCondition').combobox('getValue');
//		if(selectCondition=="true") {
//			pointCondition = "${pass}";
//			pointName='同意';
//		} else if(selectCondition=="false"){
//			pointCondition = "${!pass}";
//			pointName='退回';
//		}
//		if(selectCondition=="a") {
//			pointCondition = "${type=='a'}";
//			pointName='a';
//		} else if(selectCondition=="b"){
//			pointCondition = "${type=='b'}";
//			pointName='b';
//		}
		nowCell.setAttribute('pointName', pointCondition);
		nowCell.setAttribute('displayName', displayName);
//		nowCell.setAttribute('selectCondition', selectCondition);
		nowCell.setAttribute('pointCondition', pointCondition);
		pointName=$('#pointName').val();
	}else
	{
		pointName=$('#pointName').val();
	}
	var data={};
	data.mes="保存成功";
	window.parent.processReturnMessage(data);
	nowCell.setAttribute('pointName', pointName);
	parent.controlModel();
}

