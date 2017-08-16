/**
 * 初始化基础数据
 */
function init(){
	var nowCell = getNowCell();
	var id = nowCell.getAttribute('id', '');
	var pointCode = nowCell.getAttribute('pointCode', '');
	var workflowId = nowCell.getAttribute('workflowId', '');
	var typeId = nowCell.typeId;
	var pointName = nowCell.getAttribute('pointName', '');
	$('#id').val(id);
	$('#pointCode').val(pointCode);
	$('#workflowId').val(workflowId);
	$('#typeId').val(typeId);
	$('#pointName').val(pointName);
}

/**
 * 保存基础数据
 */
function save(){	
	var nowCell = getNowCell();
	var pointName=$('#pointName').val();

	if(pointName==""||pointName==null){
		$.messager.alert('警告','名称不能为空','warning');   
		return;
	}				
	nowCell.setAttribute('pointName', pointName);
	parent.controlModel();
}

/**
 * 获取当前编辑节点
 * @returns
 */
function getNowCell(){	
	return parent.nowCell;
}

/**
 * 关闭窗口
 */
function closeWin(){	
	parent.$('#pointWindow').window('close');
}


/**
 * 获得顶点的两边
 * @param cell
 * @param type
 * @returns
 */
function findEdge(cell,type){
	var edge = null;
	var graph = parent.graph; 
	for (var key in graph.getModel().cells){				
		var temp = graph.getModel().getCell(key);
		if(graph.getModel().isEdge(temp)){
			if(type==0&&temp.source == cell){//查找以当前节点为来源的边
				edge = temp;
			}
			if(type==1&&temp.target == cell){//查找以当前节点为目的的边
				edge = temp;
			}
		}
	}
	return edge;
}