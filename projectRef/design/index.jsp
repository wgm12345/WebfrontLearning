<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ page import="com.ylkj.base.util.InputInjectFilter,java.net.URLDecoder"%>
<%@ page import="com.ylkj.base.util.InputInjectFilter" %>
<%
	String path = request.getContextPath();
        path=InputInjectFilter.encodeInputString(path);
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	basePath = InputInjectFilter.encodeInputString(basePath);
	String flowId = request.getParameter("flowId");
	flowId = InputInjectFilter.encodeInputString(flowId);
	String workflowId = request.getParameter("workflowId");
	workflowId = InputInjectFilter.encodeInputString(workflowId);
	String flowName = URLDecoder.decode(request.getParameter("flowName"),"UTF-8");
	flowName = InputInjectFilter.encodeInputString(flowName);
	String typeId = request.getParameter("typeId");
	typeId = InputInjectFilter.encodeInputString(typeId);
	String version = request.getParameter("version");
	version = InputInjectFilter.encodeInputString(version);
%>
<html>
  <head>
    <title>画图页面</title>
    <%@include file="../../common/base.head.jsp"%>
    <%@include file="../../common/esapi4js.head.jsp"%>
    <%@include file="../../common/common.head.jsp"%>
	<%@include file="../../common/mxgraph.jsp"%>
	<link rel="stylesheet" type="text/css" href="assets/css/reset.css">	
    <script type="text/javascript">
   		var basePath = '<%= basePath%>';
   		var flowId='<%= flowId%>'; //当前操作的作业ID
   		var flowName='<%= flowName%>'; //当前操作的作业名称
		var workflowId="<%=workflowId%>"; //当前显示流程ID
		var typeId="<%=typeId%>"; //分类名称
		var currVersion="<%=version%>"; //当前版本
	</script>
	<script type="text/javascript" src="scripts/index.js"></script>
</head>

<body class="easyui-layout">
	<div data-options="region:'north'" style="height:42px;">
    	<div  class="toolsBar">
        	<ul id="toolbarContainer"></ul>
        </div>
    </div>

    <div data-options="region:'west'" class="side" >
        <ul id="sidebarContainer" class="appIcon" ></ul>
    </div>
    
    <div  data-options="region:'center'"  style="border:0px solid #9fbbd2">   
    <div id="cc" class="easyui-layout" style="width:100%;height:100%;"> 
       <div data-options="region:'north'" style="height:4%;text-align:center;padding:3px;overflow: hidden">
	     <%--主题--%> 
	     <strong><%=flowName%></strong>  	
	    </div>   
	    <div data-options="region:'center'" class="main"  style="height:55%;">
	     <%-- 画布--%>   	
	     	<div id="graphContainer" style="cursor: default;height:100%;"></div>       
	    </div>    
	    <div data-options="region:'south',split:true" class="mydiv" style="height:45%;overflow: hidden">    	
	      	 <%-- 节点信息 --%>
			  <div class="pointBody">	
				<div style="float:left;width:40%;border:1px solid #d8dfe5;text-align:center; overflow: hidden">
					<table style="margin:auto;">
			    	 	<tr><th><span id="pointTitle">节点说明</span></th></tr>
			    	 	<tr>    	 	
			    	 		<td> 	 		
			    	 			<ul style="padding:3px;height:170px;text-align:left;">	   	 		    	 		
			    	 				<li  id="pointDesc" style="padding:5px"></li>
									<li  id="pointNote" style="padding:5px"></li>  
			    	 			</ul>
			    	 		</td>	   	 		
			    	 	</tr>
			    	 </table> 
				</div>
				<div style="float:right;width:58%;border:1px solid #d8dfe5;text-align:center; overflow: hidden">	
		    	 	<table style="margin:auto;">
			    	 	<tr><th>示例流程</th></tr>
			    	 	<tr>    	 	
			    	 		<td> 	 		  	 		 	 		
			    	 			<ul style='padding:3px;height:170px'>	   	 		    	 		
			    	 				<li id="pointImg"></li>
			    	 			</ul>
			    	 		</td>	    	 		
			    	 	</tr>
		    	 	</table> 
				</div>	
			  </div>  
	    </div>   
	</div>  
           		 	
	  </div>
	<div id="menu" class="easyui-menu" style="width:130px;height:150px"></div> 
    <div id="configWindow" modal="true" shadow="false" minimizable="false" cache="false" maximizable="false" collapsible="false" resizable="false"  style="margin: 0px;padding: 0px;overflow: auto;"></div>
    <div id="customWindow" modal="true" shadow="false" minimizable="false" cache="false" maximizable="false" collapsible="false" resizable="false"  style="margin: 0px;padding: 0px;overflow: auto;"></div>
    <div id="xmlWindow" modal="true" shadow="false" minimizable="false" cache="false" maximizable="false" collapsible="false" resizable="false"  style="margin: 0px;padding: 0px;overflow: auto;"></div>
    <div id="fileWindow" modal="true" shadow="false" minimizable="false" cache="false" maximizable="false" collapsible="false" resizable="false"  style="margin: 0px;padding: 0px;overflow: auto;"></div>   
    <div id="pointWindow" close="true" modal="true" shadow="false" minimizable="false" cache="false" maximizable="false" collapsible="false" resizable="false"  style="margin: 0px;padding: 0px;">
   		 <iframe name='pointIframe' id='pointIframe' width='98%' height="98%" src=''  frameborder='0' scrolling='no' > </iframe>    
    </div>
    </body>
</html>
   