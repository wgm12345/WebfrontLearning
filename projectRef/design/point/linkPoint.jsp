<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<html>
  <head>
    <title>链接线窗口</title>
    <%@include file="../../../common/base.head.jsp"%>
    <%@include file="../../../common/common.head.jsp"%>
    <script type="text/javascript" src="scripts/basePoint.js"></script>	
    <script type="text/javascript" src="scripts/linkPoint.js"></script>
  </head> 
  <body style="font-size:8px;">
  <div align="center">
   	<table  style="width:350px;font-size:10pt;align:center" >
   		<tr>	
   			<td style="">节点编号：</td>
   			<td> 
   				<input type="text" id="pointCode" class="easyui-validatebox textbox"  style="width:200px;height:25px" disabled></input>
   			</td>
   		</tr>
   		
   		<tr  style="display:none">  
   			<td style="">所属图形编号：</td>
   			<td> <input id="workflowId" type="text" class="easyui-validatebox textbox" style="width:200px;height:25px" disabled/> </td>
   		</tr>
   		
   		<tr  style="display:none">  
   			<td style="">节点类型：</td>
   			<td> <input id="typeId" type="text" class="easyui-validatebox textbox" style="width:200px;height:25px" disabled/> </td>
   		</tr>
   		  				
   	    <tr>
   			<td style="">节点名称：</td>
   			<td ><input id="pointName" type="text" class="easyui-validatebox textbox" data-options="validType:'stringValidate'" style="width:200px;height:25px" /></td>
   		</tr>
   		
   		<tr>
   			<td style="">节点展示名称：</td>
   			<td ><input id="displayName" type="text" class="easyui-validatebox textbox" data-options="validType:'stringValidate'" style="width:200px;height:25px" /></td>
   		</tr>
   		
   		<tr>
   			<td style="">节点描述：</td>
   			<td ><input id="desc" type="text" class="easyui-validatebox textbox" data-options="validType:'stringValidate'" style="width:200px;height:25px" /></td>
   		</tr>
   		
   		
   		
   		<tr id="trCondition" >
   			<td style="">条件：</td>
   			<td>
   				<input type="text" id="pointCondition" name="pointCondition" class="easyui-validatebox textbox" data-options="validType:'stringValidate'" style="width:200px;height:25px"/>
	   			<!-- <select id="selectCondition" name="selectCondition" class="easyui-combobox"  	   			
	   					data-options="editable:false" panelHeight="auto" style="width:200px;height:25px">   
		   			 <option value="true">同意</option>   
		   			 <option value="false">退回</option> 
		   			 <option value="a">a</option>   
		   			 <option value="b">b</option>     
				</select>  -->
			</td>
   		</tr> 
   </table>  
    <br>
    <br>
   	<a href="javascript:void(0)" class="easyui-linkbutton" onclick="savePoint();">保存</a>  			 
  </div> 
  </body>
</html>
