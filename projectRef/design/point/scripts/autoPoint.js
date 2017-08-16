var nowCell = getNowCell(); // 获取当前节点
$(function() {
	// 初始化基本数据
	init();
	$('#tableDiv').css("height", '80%'); // 设置表格高度
});

// 保存xml
function savePoint() {
	save();
	var pointName = $('#pointName').val();
	var pointCode = $('#pointCode').val();
	
	var taskContent = "";
	taskContent += '<userTask id="' + pointCode + '"  name="' + pointName
	+ '" activiti:candidateGroups="123">\n';
	taskContent+='<extensionElements>\n';
	taskContent+='<activiti:taskListener event="create" class="com.ylkj.base.flow.listener.AutoSenderListener"/>\n';
	taskContent+='</extensionElements>\n'
	taskContent += '</userTask>\n';
	nowCell.setAttribute('taskContent', taskContent);
	var data={};
	data.mes="保存成功";
	window.parent.processReturnMessage(data);
}
