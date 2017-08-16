$(function(){
	$('#workflowName').val(parent.workflowName);	
	$('#workflowId').val(parent.workflowId);	
	$('#flowId').val(parent.flowId);
					
});		

function saveWorkflow(){
	var url = "";
	var workflowId = $('#workflowId').val();	
	var flowId = $('#flowId').val();
	var workflowName = $('#workflowName').val();	
	var operatorId = $('#operatorId').val();			
	
	if(workflowName==""||workflowName==null){
		$.messager.alert('警告','名称不能为空','warning');   
		return;
	}
	if(parent.checkRole()!=""){	
		$.messager.alert('警告', '请为【'+parent.checkRole()+'】节点选择角色', 'warning');
		return;
		
	}	
	parent.workflowName=workflowName;//设置当前工作流名称
	parent.setMxGraph();//设置xml图形的信息
	parent.setWorkflow();//设置流程图形的信息
	var workflow = {
			'workflowId':workflowId,
			'flowId':flowId,
			'operatorId':operatorId,
			'workflowName':workflowName,				
			'workflowShowConfig':$ESAPI.encoder().encodeForHTML(parent.workflowShowConfig),
			'workflowBpmnConfig':$ESAPI.encoder().encodeForHTML(parent.workflowBpmnConfig),
			'version':parent.currVersion,
	};
	//保存前传入后台进行校验 add by gsz 2015.11.18 
	$.ajax({
		url:basePath + "rest/design/flowValidate",
		type:'post',
		async: false,  
		data:workflow,
		success:function(data,textStatus,xhr){
			
			if(data.result!=null){						 								
				$.messager.alert('警告',"【"+data.result.activityName+"】出错，【"+englishToChinese(data.result.problem)+"】",'warning'); 
				var  id = data.result.activityId;
				updateLink(id,0);
				return;
			}
			if(parent.drawflag ==0){	
				$.ajax({
					url:basePath + "rest/design/addFlowDef",
					type:'post',
					async: false,  
					data:workflow,
					success:function(data,textStatus,xhr){	
						parent.processReturnMessage(data);
						parent.drawflag=1;
								
					}
				});	

			}else{
				$.ajax({
					url:basePath + "rest/design/updateFlowDef",
					type:'post',
					async: false,  
					data:workflow,
					success:function(data,textStatus,xhr){	
						 parent.processReturnMessage(data);
								
					}
				});	
		    }	
		}
	});	
	
}
