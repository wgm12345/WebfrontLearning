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
    <title>流程窗口</title>
    <%@include file="../../common/base.head.jsp"%>
    <%@include file="../../common/esapi4js.head.jsp"%>
    <%@include file="../../common/common.head.jsp"%>
	<script type="text/javascript">
		var basePath = '<%= basePath%>';	
 	</script>
 	<script type="text/javascript" src="scripts/workflow.js"></script>
  </head> 
  <body style="font-size:8px;">
  <div align="center">
 	<input id="version" type="hidden" type="text"/>
   	<table  style="width:350px;font-size:10pt;align:center">
   		<tr style="display:none">	
   			<td style="">流程定义ID：</td>
   			<td> 
   				<input id="workflowId" type="text" style="width:200px" disabled />
   			</td>
   		</tr>
  		<tr style="display:none">	
   			<td style="">流程ID：</td>
   			<td> 
   				<input id="flowId" type="text" style="width:200px" disabled />
   			</td>
   		</tr>
   		<tr>  
   			<td style="">流程名称：</td>
   			<td> <input id="workflowName" type="text"  style="width:200px" /> </td>
   		</tr>
   				
   	    <tr style="display:none">
   			<td style="">操作人Id：</td>
   			<td ><input id="operatorId" type="text"  style="width:200px" /></td>
   		</tr>
   </table>  
    <br>
    <br>
   	<a href="javascript:void(0)" class="easyui-linkbutton" onclick="saveWorkflow();">保存</a>    						 
   			 
  </div> 
  </body>
</html>
