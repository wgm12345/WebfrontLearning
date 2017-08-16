<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page import="com.ylkj.base.util.InputInjectFilter" %>
<%
	String path = request.getContextPath();
        path=InputInjectFilter.encodeInputString(path);
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	basePath = InputInjectFilter.encodeInputString(basePath);
%>
<html>
<head>
<title>工作流节点窗口</title>
    <%@include file="../../../common/base.head.jsp"%>
	<%@include file="../../../common/common.head.jsp"%>
	<script type="text/javascript">
		var basePath = '<%=basePath%>';
	</script>
	<script type="text/javascript" src="scripts/basePoint.js"></script>	
	<script type="text/javascript" src="scripts/noRolePoint.js"></script>
	<style type="text/css">
		 body{
	 	font-size:12px;
	 }
	</style>
</head>
<body>
 <div id="hiveTab" class="easyui-tabs" style="width:101%;height:420px;">
  		<%-- 基础属性选项 --%> 
 		<div id="baseInfoDiv" title="基本配置" data-options="iconCls:'icon-reload'" style="padding:8px;vertical-align: middle;">      			 
      		<table cellpadding="5" style="margin-top:30px;margin-left:30px;">
    			<tr  style="display:none" >
    				<td>
	    				<input type="hidden" id="pointCode" name="pointCode" />
	    				<input type="hidden" id="workflowId" name="workflowId"/>
	    				<input type="hidden" id="typeId" name="typeId" />
       				</td>
				 </tr>
    			 <tr>  			 	
					<td  align="right"><label><font color="red">*</font>节点名称：</label></td>
					<td >
  						<input  style="width:140px;height:25px; " class="easyui-validatebox textbox"  data-options="validType:'stringValidate'" type="text"  size="64" id="pointName" name="pointName" />
					</td>   			
				</tr>
				<tr style="display:none;">
					<td style="text-align: right;">结果变量：</td>
					<td>
					<input class="easyui-validatebox textbox"
						style="width: 140px; height: 25px" type="text" id="resultVar" 
						name="resultVar" data-options="validType:'tableNameValidate'"/>					
 					</td>
				</tr>
      			</table>  
      			<div style="text-align:center;">
					 <a href="javascript:void(0)" class="search-btn2" onclick="savePoint()">保存</a>　
					<a href="javascript:void(0)" class="reset-btn2" onclick="closeWin()">关闭</a>　
				</div>   	
   		</div>
   			
   

</body>
</html>