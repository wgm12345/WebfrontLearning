var nowCell = getNowCell(); // 获取当前节点
$(function() {
	// 初始化基本数据
	init();
	$('#tableDiv').css("height", '80%'); // 设置表格高度
	queryRoleGrid(); // 查询角色表格
	$('#roleName1').val(nowCell.getAttribute('roleName'));
	$('#roleCode1').val(nowCell.getAttribute('roleCode'));
});

// 保存xml
function savePoint() {
	save();
	var row = $('#roleGrid').datagrid('getSelections');
	var roleCode1=$('#formRole #roleCode1').val();
	if (row.length == 0) {
		if(isEmpty(roleCode1))
		{
			$.messager.alert('警告', "请选择一个角色！", 'warning');
			return;
		}
	}
	if (row.length > 1) {
		$.messager.alert('警告', "只能选择一个角色！", 'warning');
		return;
	}
	var pointName = $('#pointName').val();
	var pointCode = $('#pointCode').val();
	var roleCode ;
	var roleName;
	if(row.length == 0){
		 roleCode=$('#formRole #roleCode1').val();
		 roleName=$('#formRole #roleName1').val();
	}else{
		roleCode=row[0].roleCode;
		roleName=row[0].roleName;
	}
	
	var taskContent = "";
	taskContent += '<userTask id="' + pointCode + '"  name="' + pointName
			+ '" activiti:candidateGroups="' + roleCode + '">\n';
	taskContent+='<extensionElements>\n';
	taskContent+='<activiti:taskListener event="complete" class="com.ylkj.base.flow.listener.UserTaskCompleteListener"/>\n';
	taskContent+='</extensionElements>\n'
	taskContent += '</userTask>\n';

	nowCell.setAttribute('taskContent', taskContent);
	nowCell.setAttribute('roleCode', roleCode);
	nowCell.setAttribute('roleName', roleName);
	var data={};
	data.mes="保存成功";
	window.parent.processReturnMessage(data);
}

var queryRoleGrid = function() {
	$('#roleGrid')
			.datagrid(
					{
						url : basePath + 'rest/baseRole/queryAllRole',
						type : 'POST',
						columns : [ [ {
							field : 'roleCode',
							width : fixWidth(0.10),
							title : '角色编码',
							align : 'center'
						}, {
							field : 'roleName',
							width : fixWidth(0.10),
							title : '角色名称',
							align : 'center',
						} ] ],
						onClickRow : function(rowIndex, rowData) {
							$('#roleName1').val(rowData.roleName);
						},
						onLoadSuccess : function(data) {
							$(this).datagrid("fixRownumber");
							if (data.total == 0) {
								var body = $(this).data().datagrid.dc.body2;
								body
										.find('table tbody')
										.append(
												'<tr><td  width="900px" style="color:red;height: 25px; text-align: center;">没有数据！</td></tr>');
							} else {
								// 回填角色
								var roleCode = nowCell.getAttribute('roleCode');
								if (!isEmpty(roleCode)) {
									var index = $('#roleGrid').datagrid(
											'getRowIndex', roleCode);
									if(index>=0)
									 {
										$('#roleGrid').datagrid('selectRow', index);
									 }
								}
							}
						},
						singleSelect : true,
						iconCls : 'icon-edit',
						toolbar : '#tb',
						idField :'roleCode',
						width : 'auto',
						pagination : true,
						fitColumns : true,
						border : true,
						fit : true,
						scrollbarSize : 0,
						rownumbers : true,
						striped : true,
						pageSize : 5,// 默认选择的分页是每页5行数据
						showPageList : true,// 显示页数列表
						pageList : [ 5, 10, 15, 20 ]
					});
	var pager = $('#roleGrid').datagrid('getPager');
	pager.pagination({
		beforePageText : '第',// 页数文本框前显示的汉字
		afterPageText : '/ {pages} 页',
		displayMsg : '当前 {from} - {to} 条记录, 共 {total} 条记录',
		buttons : [ ]
	});
	$('#roleGrid').datagrid('doCellTip', {
		onlyShowInterrupt : 'true',// 仅当超出时提示
		position : 'bottom',// 提示位置
		maxWidth : '400px',// 提示最大长度
		tipStyler : {// 提示div样式
			backgroundColor : '#ffffff',
			borderColor : '#ff0000',
			boxShadow : '1px 1px 3px #292929',
			'word-break' : 'break-all'
		}
	});

}

function sync()
{
	
	var url = basePath + 'rest/baseRole/syncBaseRole';
	$.messager.progress();
	//提交ajax请求
	$.ajax({
		url : url,
		type : "POST",
		async: true,
		success : function(data) {
			$.messager.progress("close");
			//操作完成后对表格进行刷新
			$('#roleGrid').datagrid('reload'); 
    		//弹出返回消息
			parent.processReturnMessage(data);
		},
		error:function(data){
			$.messager.progress("close");
			parent.processReturnMessage(data);
		}
	});
}

function queryRole()
{
	var valid = $('#formRole').form('validate');
	if (!valid) return;
	$('#roleGrid').datagrid('reload',{
		roleCode : $('#formRole #roleCode').val(),
		roleName : $('#formRole #roleName').val()
	});
}

function resetRole(){
	$('#formRole').form('reset');
	$('#roleName1').val(nowCell.getAttribute('roleName'));
	$('#roleCode1').val(nowCell.getAttribute('roleCode'));
}