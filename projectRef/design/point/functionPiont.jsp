<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<html>
  <head>
    <title>开始结束窗口</title>
      <%@include file="../../../common/base.head.jsp"%>
      <%@include file="../../../common/common.head.jsp"%>
    <script type="text/javascript" src="scripts/basePoint.js"></script>	
    <script type="text/javascript" src="scripts/functionPiont.js"></script>
  </head> 
  <body style="font-size:8px;">
  <div align="center">
   	<table  style="width:350px;font-size:10pt;align:center" id = "info">
   		<tr  style="">	
   			<td >节点编号：</td>
   			<td> 
   				<input id="id" type="text" class="easyui-validatebox textbox" style="width:150px" disabled />
   			</td>
   		</tr>
   		<!-- <tr  style="">	
   			<td >节点编号：</td>
   			<td> 
   				<input id="pointCode" type="text" class="easyui-validatebox textbox" style="width:150px" disabled />
   			</td>
   		</tr> -->
 		
   		<tr  style="display:none">  
   			<td >所属图形编号：</td>
   			<td> <input id="workflowId" type="text" class="easyui-validatebox textbox" style="width:150px" disabled/> </td>
   		</tr>
   		
   		<tr  style="display:none">  
   			<td >节点类型：</td>
   			<td> <input id="typeId" type="text"  style="width:150px" class="easyui-validatebox textbox" disabled/> </td>
   		</tr>
   		  				
   	    <tr>
   			<td >节点名称：</td>
   			<td ><input id="pointName" type="text" class="easyui-validatebox textbox"  data-options="validType:'stringValidate'" style="width:150px;height:25px" /></td>
   		</tr>
   		<tr>
   			<td >节点展示名称：</td>
   			<td ><input id="displayName" type="text" class="easyui-validatebox textbox"  data-options="validType:'stringValidate'" style="width:150px;height:25px" /></td>
   		</tr>
   		<tr>
   			<td >节点描述：</td>
   			<td ><input id="desc" type="text" class="easyui-validatebox textbox"  data-options="validType:'stringValidate'" style="width:150px;height:25px" /></td>
   		</tr>		
   		<tr id="conditionList" style="display:none">
   			<td ><input type="hidden" id="pointCondition" name="pointCondition"/>流转条件：</td>
   		</tr> 						 	 
   </table>  
    <br>
    <br>
   	<a href="javascript:void(0)" class="easyui-linkbutton" onclick="savePoint();">保存</a>  			 
  </div> 
  </body>
</html>
