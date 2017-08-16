
var nowCell = getNowCell();	//获取当前节点
var sourceCell = findEdgeArray(nowCell,1);//获取连接该节点的边
var resultNames = [];//获取前面多个工作节点的名称
var resultVars = [];//获取前面多个工作节点的结果变量
$(function(){
	init();	//参数初始化
	resultVars = [];
	resultNames = [];
	var pointCondition=nowCell.getAttribute('pointCondition', '');
	$('#pointCondition').val(pointCondition);
	var graph =parent.graph;
	if(sourceCell != "" && sourceCell.length == 1){
		var cell = sourceCell[0].source;//获取条件分支前的节点
		//如果上一个功能节点是并行合并，则取与之相连的所有工作节点的结果变量。modified by gsz 2015-09-30
		if(cell.typeId=="f5"){
			for (var key in graph.getModel().cells)	{//遍历节点，判断并行节点前的节点是否有填写结果变量
				var t = graph.getModel().getCell(key);	
				if(graph.getModel().isEdge(t)){
					if(t.target==cell && t.source.getAttribute('resultVar','') != ''){
						resultVars.push(t.source.getAttribute('resultVar',''));
						resultNames.push(t.source.getAttribute('pointName',''));
					}
				}
			}
		
		}
	}
	if(resultVars.length > 0){
		$('#conditionList').show();
		var list = "";
		for(var i = 0;i < resultVars.length; i++){
			list += '<tr><td><label id="param'+i+'">'+resultNames[i]+'('+resultVars[i]+'):</label></td><td><select id="selectCondition'+
					i +'" name="selectCondition'+i+'" style="width:150px;height:25px"></select></td></tr>';
		}
		$('#info').append(list);
		var condition = [{id:'',name:'无'},{id:'true',name:'执行成功'},{id:'false',name:'执行失败'}];
		var selectCondition=nowCell.getAttribute('selectCondition', '');
		var selectConditions = [];
		var param = {};
		if(selectCondition != ''){
			selectConditions = selectCondition.split(',');
			for(var i = 1 ; i < selectConditions.length;i++){
				param[selectConditions[i]]=selectConditions[i+1];
				i++;
			}
		}
		for(var i = 0;i < resultVars.length; i++){
			$('#selectCondition'+i).combobox({
				valueField:'id',
				textField:'name',
				data:condition,
				required:true,
				editable:false,
				panelHeight:auto
			});
			if(param != null){
				var ps = $('#param'+i).text();
				for(var j = 0;j<resultVars.length;j++){
					if(ps.indexOf(resultVars[i]) > -1){
						$('#selectCondition'+i).combobox('setValue',param[resultVars[i]]);
						break;
					}
				}
				
			}
		}
	}
});
//保存xml
function savePoint(){				
	save();
	var pointCondition=$('#pointCondition').val();		
	//如果是多个条件并行，则取数组数据，并调用。
	if(resultVars.length > 0 ){
		var param = 'execution';
		for(var i = 0;i < resultVars.length;i++){
			var selectCondition = $('#selectCondition'+i).combobox("getValue");
			param += ','+resultVars[i]+','+ selectCondition;
		}
		var method = "goStart";//产生结果的方法
		nowCell.setAttribute('selectCondition', param);
		pointCondition="${ruleListener."+method+"("+param+")}"
	}
	nowCell.setAttribute('pointCondition', pointCondition);
	var data={};
	data.mes="保存成功";
	window.parent.processReturnMessage(data);
}
 
/**
 * 获得顶点的两边数组
 * @param cell
 * @param type 
 * @returns
 */
function findEdgeArray(cell,type){
	var edge = new Array();
	var graph =parent.graph;
	for (var key in graph.getModel().cells){				
		var temp = graph.getModel().getCell(key);
		if(graph.getModel().isEdge(temp)){
			if(type==0&&temp.source == cell){//查找以当前节点为来源的边
				edge.push(temp);
			}
			if(type==1&&temp.target == cell){//查找以当前节点为目的的边
				edge.push(temp);
			}
		}
	}
	return edge;
}