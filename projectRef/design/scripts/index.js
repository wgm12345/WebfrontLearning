	var drawflag= 0 ; //标志当前的重新绘图还是修改以前的图形 0表示新画，1表示修改
	var workflowShowConfig="";//当前显示图形的内容
	var workflowBpmnConfig="";//当前显示流程图形的内容
	var workflowName=flowName+"_流程"; //当前显示流程名称
	var version=0; //新增的话版本为0，修改的时候也是修改版本为0的数据
	var userId="1"; //当前登入的用户ID
	var nowCell=null; //用于复制粘贴，复制的节点id字符串	
	var graph;//全局画图的graph
	var editor;//全局编辑的editor
	var doc;//全局文档对象的doc
	
	$(document).ready(function() {
		main(document.getElementById('graphContainer'),
			document.getElementById('toolbarContainer'),
			document.getElementById('sidebarContainer')
			);
		qryMenuList(0);//初始化左侧菜单
		init();//初始化菜单样式
		searchWorkflow();
		if(isEmpty(workflowId)){
			workflowId=getUUID();//默认先获取图形的id为画图保存节点信息做准备	
		}
		$(document).bind('contextmenu',function(e){
			e.preventDefault();
		});
	});
	function init(){
		$(".a_link").click(function(){
			$(".nav_ul").stop(true,true).fadeOut(100);
			$(this).next().stop(true,true).fadeIn(100);	
		});
		$(".nav_ul a").mouseenter(function(){
			$(this).parent().parent().find(".nav_ul").stop(true,true).fadeOut(100);
			$(this).parent().parent().find("a").removeClass("cur");
			$(this).next(".nav_ul").stop(true,true).show();	
			$(this).addClass("cur");
		});
		$(".a_link, .nav_ul").click(function (e) {
			e ? e.stopPropagation() : event.cancelBubble = true;
		});
		$(document).click(function () {
			$(".nav_ul").hide();
		});
		
		$(".moreSel h3").click(function(){
			$(this).find("em").hide();
			$(this).find("em,i").toggle();
			$(this).next().slideToggle(200);	
		});
		
		$(".appIcon b").hide();
		$(".appIcon em").click(function(){
			$(this).parent().find("ul").hide();	
			$(this).parent().find("b").show();	
			$(this).hide();
		});
		$(".appIcon b").click(function(){
			$(this).parent().find("ul").show();	
			$(this).parent().find("em").show();	
			$(this).parent().find("b").hide();	
			$(this).hide();
		});
	}
	
	
	
	//  程序在此方法中启动 
	function main(container,toolbar,sidebar) {
		//定义新连接的图标
		mxConnectionHandler.prototype.connectImage = new mxImage(
				connector, 16, 16);		
		// 检查浏览器支持
		if (!mxClient.isBrowserSupported()) {
			mxUtils.error('IE 11 浏览器不兼容!', 200, false);
		} else {
			// IE浏览器添加样式
			if (mxClient.IS_QUIRKS) {
				document.body.style.overflow = 'hidden';//溢出了就隐藏，不会产生滚动条！
				new mxDivResizer(container);
				new mxDivResizer(toolbar);
				new mxDivResizer(sidebar);
			}
			
			// 创建编辑器
			editor = new mxEditor();
			graph = editor.graph;
			
			// 请注意，这些XML节点将被封装在输出中的元素模型中
			doc = mxUtils.createXmlDocument();
			
			// 显示导航线 
			mxGraphHandler.prototype.guidesEnabled = true; 
			//去锯齿效果
			mxRectangleShape.prototype.crisp = true;
			
		    // Alt键禁用导航线
		    mxGuide.prototype.isEnabledForEvent = function(evt)
		    {
		    	return !mxEvent.isAltDown(evt);
		    };
			
			// 显示终点
			mxEdgeHandler.prototype.snapToTerminals = false;
						
			var model = graph.model;
			// 可连接
			graph.setConnectable(true);
			// 重复连接
			graph.setMultigraph(false);
			// 启用连接线
			graph.setCellsDisconnectable(true);
			// 
			graph.setCellsCloneable(true);
			// 启用删除
			graph.dropEnabled = false;
			// 不允许连接线晃动，false表示设置连接线不能单独移动，也不能有空连接			
			graph.setAllowDanglingEdges(false);
			// 显示提示
			graph.setTooltips(true);
			// 不允许连接线的源和目标是同一个节点
			graph.setAllowLoops(false);
			
			// 禁止边框编辑
			graph.isCellEditable = function(cell){
				return !this.getModel();
			};
			
			//加载样式
			setStyle(graph);
			graph.isHtmlLabel = function(cell){
				return true;
			};
			graph.getLabel = function(cell){ 
				return cell.value;
			};
			
			// 使用默认连接处理程序
			graph.connectionHandler.factoryMethod = null;

			// 设置图形容器，并配置编辑器
			editor.setGraphContainer(container);

			// 画布添加键盘监听处理配置
			/*var config = mxUtils.load('../../third/mxgraph/editors/config/keyhandler-minimal.xml')
					.getDocumentElement(); //通过getDocumentElement()方法获得该xml文件的根节点   
			editor.configure(config);*/
						
			// 对象创建将显示文本提示标签
			graph.model.valueForCellChanged = function(cell, value) {
				if (value != null) {
					return mxGraphModel.prototype.valueForCellChanged.apply(
							this, arguments);
				}
			};
			
			// 截去的标签内多余的文字（只显示标签宽度内的文字）  
//			graph.getLabel = function(cell) {
//				var label = (this.labelsVisible) ? this.convertValueToString(cell) : '';
//				var geometry = this.model.getGeometry(cell);
//				if (!this.model.isCollapsed(cell)
//						&& geometry != null
//						&& (geometry.offset == null || (geometry.offset.x == 0 && geometry.offset.y == 0))
//						&& this.model.isVertex(cell) && geometry.width >= 2) {
//					var style = this.getCellStyle(cell);
//					var fontSize = style[mxConstants.STYLE_FONTSIZE]|| mxConstants.DEFAULT_FONTSIZE;
//					var max = geometry.width / (fontSize * 0.625);
//					if (max < label.length) {
//						return label.substring(0, max) + '...';
//					}
//				}
//				return label;
//			};

			// 覆写右键单击事件
			graph.panningHandler.factoryMethod = function(menu, cell, evt) {
				//画图页面整个页面绑定右键事件
				$('#menu').menu('show', {
					left: evt.clientX,
					top: evt.clientY
				});
				createPopupMenu(editor, graph, cell, evt);
			};
			//去除错误样式
			graph.addListener(mxEvent.CLICK, function(sender, evt){	
				var cell = evt.getProperty('cell');	
				if(cell!=null){
					var pointName =cell.getAttribute('pointName', '');
					setPointDesc(cell.desc,cell.note,cell.img,pointName);					
				}
				updateLink("",1)													
			});
				
			
			// 创建工具栏并添加工具按钮
			var spacer = document.createElement('ul');
			spacer.style.display = 'inline';
			spacer.style.padding = '20px';		
			spacer.style.background="url(assets/images/toolsLine.png) no-repeat center"

			// 在顶部的状态栏添加工具栏按钮
			//addToolbarButton(editor, toolbar, 'show', '预览','assets/images/show.png');
			addToolbarButton(editor, toolbar, 'save', '保存','assets/images/save.png');
			addToolbarButton(editor, toolbar, 'delete', '删除','assets/images/delete.png');
			
			toolbar.appendChild(spacer.cloneNode(true));// 增加空格
			addToolbarButton(editor, toolbar, 'myCopy', '复制', 'assets/images/copy.png');
			addToolbarButton(editor, toolbar, 'paste', '粘贴', 'assets/images/paste.png');
			addToolbarButton(editor, toolbar, 'undo', '撤销', 'assets/images/undo.png');
			addToolbarButton(editor, toolbar, 'redo', '恢复', 'assets/images/redo.png');			
			
			toolbar.appendChild(spacer.cloneNode(true));// 增加空格		
			addToolbarButton(editor, toolbar, 'again', '清除', 'assets/images/clear.png');			
//			addToolbarButton(editor, toolbar, 'config', '调度策略配置','assets/images/config.png');
			
			/*toolbar.appendChild(spacer.cloneNode(true));// 增加空格
			addToolbarButton(editor, toolbar, 'getData', '图形列表',"assets/images/list.png");
			addToolbarButton(editor, toolbar, 'print', '打印','assets/images/print.png');
			*/
			toolbar.appendChild(spacer.cloneNode(true));// 增加空格									
			addToolbarButton(editor, toolbar, 'lookMx', '查看图形xml','assets/images/mxgraph.png');
			addToolbarButton(editor, toolbar, 'lookFlow', '查看流程xml','assets/images/wrokflow.png');
			toolbar.appendChild(spacer.cloneNode(true));// 增加空格

			addToolbarButton(editor, toolbar, 'check', '图形验证','assets/images/check.png');
			//addToolbarButton(editor, toolbar, 'export', '导出','assets/images/export.png');
			//addToolbarButton(editor, toolbar, 'import', '导入','assets/images/import.png');

			addToolbarButton(editor, toolbar, 'return', '返回', 'assets/images/return.png');
			//toolbar.appendChild(spacer.cloneNode(true));// 增加空格

			// Fades-out the splash screen after the UI has been loaded.
			var splash = document.getElementById('splash');
			if (splash != null) {
				try {
					mxEvent.release(splash);
					mxEffects.fadeOut(splash, 100, true);
				} catch (e) {

					// mxUtils is not available (library not loaded)
					splash.parentNode.removeChild(splash);
				}
			}
					
			// 连接线验证
			graph.addListener(mxEvent.ADD_CELLS, function(sender, evt){
				var cells = evt.getProperty('cells');	
				var cell = cells[0];	
				if (this.model.isEdge(cell)){	
					//var tmp = graph.getModel().getCell(cell.source.id);	
			 		//每次拖动一个连接线就创建一个对象（和后台的bean相对应）
//					var link = doc.createElement('Link');	
//					link.setAttribute('workflowId', workflowId);
//					link.setAttribute('pointCode', "sid-"+getUUID());
//					link.setAttribute('pointName', '链接');		
//					link.setAttribute('source',  graph.getModel().getCell(cell.source.id).getAttribute('pointCode',''));		
//					link.setAttribute('target',  graph.getModel().getCell(cell.target.id).getAttribute('pointCode',''));	
					cell.typeId="f0";//新增了loop类型,特殊边typeId为 l1
					//如果源在目标的后面，他们之间的连线是loop
					if(cell.target.geometry.x < cell.source.geometry.x){
						cell.typeId = "l1";
					}
					//link.typeId = cell.typeId;
					cell.name = (cell.typeId == "f0"? "Transition" : "Loop") + cell.id;		
					cell.id = workflowId + '.' + (cell.typeId == "f0"? "Transition" : "Loop") + cell.id;					
					cell.img="assets/images/beginEnd.png";
					cell.desc="链接两个节点";
					cell.note="如果链接的上一个节点为排他节点则此连接线必须填写流转条件";
					//cell.value = link;		
					cell.style="link";
					//检查图形是否画对
					var nodeArr = checkNode(cell).split(",");
					if (nodeArr[0]==-1){
						$.messager.alert('警告',nodeArr[1],'warning'); 
						//删除节点
						this.model.remove(cell);
					}			
				}
			});
			
			// 提供一个在显示屏上的单元格标签
			graph.convertValueToString = function(cell){
				var pointName =cell.getAttribute('pointName', '');
				return pointName;
			};
			
			//鼠标停留提示
			var getTooltipForCell = graph.getTooltipForCell;
			graph.getTooltipForCell = function(cell){
				var tip = '';			
				if (cell != null){
					var src = this.getModel().getTerminal(cell, true);					
					if (src != null){
						tip += this.getTooltipForCell(src) + ' ';
					}					
					var parent = this.getModel().getParent(cell);					
					if (this.getModel().isVertex(parent)){
						tip += this.getTooltipForCell(parent) + '.';
					}	
					tip += getTooltipForCell.apply(this, arguments);					
					var trg = this.getModel().getTerminal(cell, false);					
					if (trg != null){
						tip += ' ' + this.getTooltipForCell(trg);
					}
				}
				return tip;
			};
						
			/*// 从后台读取xml文件并显示图形
			editor.addAction('getData', function(editor, cell) {
				showPublicWindow("workflowDg.jsp","流程 ",800,450);		
			});
			*/
			// 从后台读取xml文件并显示图形
			editor.addAction('again', function(editor, cell) {
				newDraw();
			});

			// 启动
			editor.addAction('check', function(editor, cell) {
				//检查图形是否画对
				var nodeArr = checkNode().split(",");
				if (nodeArr[0]==-1){
					$.messager.alert('警告',nodeArr[1],'warning'); 
					return;
				}
				if(checkRole()!=""){	
					$.messager.alert('警告', '请为【'+checkRole()+'】节点选择角色', 'warning');
					return;
					
				}	
				var functionArr = checkFunction().split(",");
				if (functionArr[0]==-1){
					$.messager.alert('警告',functionArr[1],'warning'); 
					return;
				}
				setMxGraph();//设置xml图形的信息
				setWorkflow();//设置流程图形的信息
				var workflow = {
						'workflowId':workflowId,
						'flowId':flowId,
						'operatorId':1,
						'workflowName':workflowName,				
						'workflowShowConfig':$ESAPI.encoder().encodeForHTML(workflowShowConfig),
						'workflowBpmnConfig':$ESAPI.encoder().encodeForHTML(workflowBpmnConfig),
						'version':currVersion,
				};
				$.ajax({
					url:basePath + "rest/design/flowValidate",
					type:'post',
					async: false,  
					data:workflow,
					success:function(data,textStatus,xhr){
						if(data.result!=null){						 								
							$.messager.alert('警告',"【"+data.result.activityName+"】出错，【"+englishToChinese(data.result.problem)+"】",'warning'); 
							var  id = data.result.activityId;
							updateLink(id,0)
						}else{
							var result={};
							result.mes="校验成功";
							processReturnMessage(result);
						}
					}
				});		
			});
			
			// 保存图形信息
			editor.addAction('save', function(editor, cell) {	
				//检查图形是否画对
				var nodeArr = checkNode().split(",");
				if (nodeArr[0]==-1){
					$.messager.alert('警告',nodeArr[1],'warning'); 
					return;
				}
				if(checkRole()!=""){	
					$.messager.alert('警告', '请为【'+checkRole()+'】节点选择角色', 'warning');
					return;
					
				}	
				var functionArr = checkFunction().split(",");
				if (functionArr[0]==-1){
					$.messager.alert('警告',functionArr[1],'warning'); 
					return;
				}
				setMxGraph();//设置当前展示图形的内容，方便保存到后台
				showPublicWindow("workflow.jsp","流程信息",350,230);				
			});		
			// 复制图形信息
			editor.addAction('myCopy', function(editor, cell) {					
				var cells = graph.getSelectionCells();
				if(cells.length==0){
					$.messager.alert('警告','请选择你要复制的节点！','warning');  
					return;
				}
				for(var i= 0;i<cells.length;i++){
					//复制的时候图形是否已经有了开始或者结束节点，如果存在直接返回
					if(cells[i].typeId=="f1"||cells[i].typeId=="f2"){
						if(cells[i].typeId=="f1"){
							$.messager.alert('警告','此图中只允许存在一个开始节点,请重新复制！','warning');   
						}else{
							$.messager.alert('警告','此图中只允许存在一个结束节点，请重新复制！','warning'); 
						}
						return;					
					}
					cells[i].setAttribute('pointCode', getUUID());	
				}
				editor.execute('copy', cell);
			});
			
			// 查看图形的xml文件形式代码
			editor.addAction('lookMx', function(editor, cell) {
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(editor.graph.getModel());
				var value = mxUtils.getPrettyXml(node);
				 
				$("#xmlWindow").window({
					title:"图形xml",
					width:430,
					height:470,
					content:"<textarea style='width:99%;height:99%;'>"+value+"</textarea>"
				});					
			});
			// 查看流程的xml文件形式代码
			editor.addAction('lookFlow', function(editor, cell) {			
				$("#xmlWindow").window({
					title:"流程xml",
					width:430,
					height:470,
					//content:"<textarea style='width:99%;height:99%;'>"+workflowBpmnConfig+"</textarea>"
					content:"<textarea style='width:99%;height:99%;'>"+setWorkflow()+"</textarea>"
				});
			});
			
			
			// 返回
			editor.addAction('return', function(editor, cell) {	
					$.messager.defaults = { ok: "保存", cancel: "不保存" };
					$.messager.confirm('提示','是否要保存?',function(result){
			        if (result){
			        	//检查图形是否画对
						var nodeArr = checkNode().split(",");
						if (nodeArr[0]==-1){
							$.messager.alert('提示',nodeArr[1],'info'); 
							return;
						}
			        	saveWorkflow();			        	
			        }else{
						window.location.href="../flowmanage/flowManageIndex.jsp?catalogId="+catalogId;			
			        }
			    });
			});
		}
	}
	/**
	 * 初始化工具栏
	 * @param editor
	 * @param toolbar
	 * @param action
	 * @param label
	 * @param image
	 */
	function addToolbarButton(editor, toolbar, action, label, image) {
		var li = document.createElement('li');	
		var a = document.createElement('a');
    	a.style.background="url("+image+") no-repeat left";
    	a.innerHTML=label;  
    	li.appendChild(a);
		mxEvent.addListener(li, 'click', function(evt) {		
			editor.execute(action);		
		});
		mxUtils.write(li,"");
		toolbar.appendChild(li);
	};

	/**
	 * 公共弹出窗口
	 */
	function showPublicWindow(url,title,width,height){
		$("#pointWindow").window({
			title:title,
			width:width,
			height:height,
			top:(screen.height-height-100)/2,
			left:(screen.width-width)/2,
			onBeforeOpen: function(){
				$("#pointIframe",document.body).attr("src",url);
			},
			onClose: function(){
				$("#pointIframe",document.body).attr("src","");
			}
		});
	}
	
	
	/**
	 * showModalWindow	显示静态窗口
	 * @prama title  	标题
	 * @prama content	显示内容
	 * @prama width		宽度
	 * @prama height	高度
	 */
	function showModalWindow(title, content, width, height) {
		var background = document.createElement('div');
		background.style.position = 'absolute';
		background.style.left = '0px';
		background.style.top = '0px';
		background.style.right = '0px';
		background.style.bottom = '0px';
		background.style.background = 'black';
		mxUtils.setOpacity(background, 50);
		document.body.appendChild(background);

		if (mxClient.IS_QUIRKS) {
			new mxDivResizer(background);
		}

		var x = Math.max(0, document.body.scrollWidth / 2 - width / 2);
		var y = Math.max(10,(document.body.scrollHeight || 
				document.documentElement.scrollHeight)/ 2 - height * 2 / 3);		
		var wnd = new mxWindow(title, content, x, y+55, width, height, false, true);
		wnd.setClosable(true);

		// Fades the background out after after the window has been closed
		wnd.addListener(mxEvent.DESTROY, function(evt) {
			mxEffects.fadeOut(background, 50, true, 10, 30, true);
		});
		wnd.setVisible(true);
		return wnd;
	};

	
	/**
	 * 添加侧变量图标
	 * @param vertex
	 * @param imgUrl
	 * @param parentId
	 * @param id
	 * @param text
	 * @param typeId
	 */
	function addSidebarIcon(vertex, imgUrl, parentId, id, text, typeId, desc) {
		//拖动时间函数预先定义
		var funct = function(graph, evt, cell) {
			graph.stopEditing(false);
			var pt = graph.getPointForEvent(evt);
			var parent = graph.getDefaultParent();
			var model = graph.getModel();
			var v1 = model.cloneCell(vertex);					
			//拖拽的时候循环是否已经有了开始或者结束节点，如果存在直接返回
			if(typeId=="f1"||typeId=="f2"){
				for (var key in graph.getModel().cells){
					var tmp = graph.getModel().getCell(key);			
					if(tmp.typeId==typeId){
						if(typeId=="f1"){
							$.messager.alert('警告','此图中只允许存在一个开始节点','warning');   
						}else{
							$.messager.alert('警告','此图中只允许存在一个结束节点','warning'); 
						}
						return;
					} 
				}				
			}
			model.beginUpdate();
			try {
				v1.geometry.x = pt.x;
				v1.geometry.y = pt.y;
				graph.addCell(v1, parent);
				v1.geometry.alternateBounds = new mxRectangle(0, 0,
						v1.geometry.width, v1.geometry.height);
				
				//v1.style="icon";
				graph.setSelectionCell(v1);
			} finally {
				//每次拖动一个图标就创建一个对象
//				var point = doc.createElement('Point');	
//				point.setAttribute('typeId', typeId);
//				point.setAttribute('workflowId', workflowId);	
//				point.setAttribute('pointCode', "sid-"+getUUID());
//				if(typeId=="f3"||typeId=="f4"||typeId=="f5"){
//					point.setAttribute('pointName', text+v1.id);			
//				}else{
//					point.setAttribute('pointName', text);			
//				}
//				v1.value=point;
//				setPointDesc(v1.desc,v1.note,v1.img,text);	
				v1.typeId = typeId;
				switch(v1.typeId){
				case "f1" :{
					v1.name = "START_NODE";
					break;
				}	
				case "f2" :{
					v1.name = "END_NODE";
					break;
				}
				case 61 :{
					v1.name = "ACTIVITY" + v1.id;
					break;
				}
				case "f3" :{
					v1.name = "Synchorizer" + v1.id;
					break;
				}
				default:{
					v1.name = "NODE" + v1.id ;
					break;
					
				}
				}
				v1.id = workflowId + '.' + v1.name;
				model.endUpdate();
			}
		};
		
		// 创建拖动源和图标
		var span = document.createElement('span');
		span.setAttribute('id', id);	
		
		var img = document.createElement('img');
		img.setAttribute('src', imgUrl);
		img.style.width = '20px';
		img.style.height = '20px';
		img.align="middle"
		//img.title = '把这个拖到图中创建一个新的节点';
							
		$("#"+parentId).append("<li id='li"+id+"' title='"+desc+"' style='padding:5px'></li>");
		$("#li"+id).append(span);
		$("#"+id).append(img);
		$("#"+id).append(text);
				
		// 创建拖动源预览图标		
		var dragImage = img.cloneNode(true);
		// 使图标可以拖动  
		var ds = mxUtils.makeDraggable(span, graph, funct, dragImage, 0, 0,graph.autoscroll, true);
		// 从拖动源拖动时显示导航线。
		// 注意，对图形中已存在的元素拖动时显示导航线不在本方法约束范围。
		ds.isGuidesEnabled = function() {
			return graph.graphHandler.guidesEnabled;
		};
		// 高亮效果
		ds.highlightDropTargets = true;						
	}
	
	/**
	 * 创建下拉菜单
	 */
	function createPopupMenu(editor, graph,cell, evt) {
		var menu = $('#menu');
		menu.html("");		
		if (cell != null) {	
			var typeId = cell.typeId+"_";
			//开放条件分支 
//			if(typeId!="f0_"&&typeId.indexOf("f")>=0 && typeId!="f3_"){
//				menu.menu('appendItem', {
//					text: '删除',
//					iconCls: 'icon-remove',
//					onclick: function(){
//						editor.execute('delete', cell);
//					}
//				});
//				return;
//			}
			menu.menu('appendItem', {
				text: '信息配置',
				iconCls: 'icon-config',
				onclick: function(){
					//if (mxUtils.isNode(cell)){																
						nowCell = cell; //设置当前操作的节点
						var url = "";
						if(cell.typeId=="f0"){//边
							url = "point/linkPoint.jsp";
							showPublicWindow(url,"连接线信息配置",350,300);
						}
						else{//顶点
							showPublicWindow(cell.url,"节点信息配置",cell.width,cell.height);
						}
					//}		
				}
			});	
			menu.menu('appendItem', {
				text: '删除',
				iconCls: 'icon-remove',
				onclick: function(){
					editor.execute('delete', cell);
				}
			});
			
			if(typeId!="f0_"&&typeId.indexOf("f")>=0 && typeId!="f3_"){
				return;
			}
			
			menu.menu('appendItem', {
				text: '复制',
				iconCls: 'icon-copy',
				onclick: function(){
					if(cell==null){
						$.messager.alert('提示','请选择你要复制的节点！');  
						return;
					}
					var cells = graph.getSelectionCells();
					for(var i= 0;i<cells.length;i++){
						//复制的时候图形是否已经有了开始或者结束节点，如果存在直接返回
						if(cells[i].typeId=="f1"||cells[i].typeId=="f2"){
							if(cells[i].typeId=="f1"){
								$.messager.alert('警告','此图中只允许存在一个开始节点,请重新复制！','warning');   
							}else{
								$.messager.alert('警告','此图中只允许存在一个结束节点，请重新复制！','warning'); 
							}
							return;					
						}
						cells[i].setAttribute('pointCode', getUUID());	
					}
					editor.execute('copy', cell);
				}
			});
		}
		menu.menu('appendItem', {
			text: '粘贴',
			iconCls: 'icon-paste',
			onclick: function(){
				editor.execute('paste', cell);//粘贴
			}
		});
		menu.menu('appendItem', {
			text: '恢复',
			iconCls: 'icon-undo',
			onclick: function(){
				editor.execute('undo', cell);
			}
		});

		menu.menu('appendItem', {
			text: '撤销',
			iconCls: 'icon-redo',
			onclick: function(){
				editor.execute('redo', cell);
			}
		});
	}
		
	/**
	 * 展示图形
	 */
	function showMxGraph(){
		//将后台返回回来的xml字符串转为xml的doc，并显示在桌面
		var doc = mxUtils.parseXml(workflowShowConfig);	
		var dec = new mxCodec(doc);
		dec.decode(doc.documentElement, graph.getModel());	

	}
	
	/**
	 * 图形规范的验证
	 * @param cell
	 * @returns {String}
	 */
	function checkNode(cell){		
		var flag=0;//顶点是否单独存在的标志 <0表示有单独的顶点, >0表示没有
		var flagStr="";//信息
		var nodeStr="";//所有顶点id
		var nodeArr= new Array(); //定义顶点id数组 
		var typeStr="";//所有节点类型id
		var targetStr=""//所有作为尾的顶点id
		var targetArr=new Array();//所有作为尾的顶点id数组
		//var sourceArr = new Array();//所有作为头的顶点id数组
		if(cell==undefined||cell==null){//保存的时候验证
			/*------验证是否有单独节点start--------*/
			for (var key in graph.getModel().cells){				
				var tmp = graph.getModel().getCell(key);
				if(graph.getModel().isEdge(tmp)){//添加所有边的id
					targetStr += tmp.target.id+",";
				}else{//添加所有节点id（除了0,1）
					if(tmp.id!=0&&tmp.id!=1){
						nodeStr += tmp.id+",";	
						typeStr+=tmp.typeId+",";
					}	
				}
			}
		
			nodeArr = nodeStr.split(",");
			targetArr = targetStr.split(",");
			for(var i=0;i<nodeArr.length-1;i++){
				var boolean=false;//定义当前节点是否在目标节点中默认不在
				for(var j=0;j<targetArr.length-1;j++){
					if(targetArr[j]==nodeArr[i]){
						boolean=true;
					}
				}										
				if(!boolean&&graph.getModel().getCell(nodeArr[i]).typeId!="f1"){
					flag=-1;
					flagStr="图形有断裂或顶点无来源，请检查！";
					updateLink(nodeArr[i],0);	
				}				
			}
			//在所有目标节点的查找
			function findTarget(targetArr,n){	
				var flag=false;
				for(var j=0;j<targetArr.length-1;j++){
					if(targetArr[j]==nodeArr[i]){
						flag=true;
					}
				}
				return flag;
			}
			//检查是否有开始或者结束节点
			if(typeStr.indexOf("f1")<0){
				flag=-1;
				flagStr="必须要有开始节点，请检查！";
			}else if(typeStr.indexOf("f2")<0){
				flag=-1;
				flagStr="必须要有结束节点，请检查！";
			}else if(typeStr.indexOf("61")<0){
	           flag=-1;
	 			flagStr="必须要有工作流节点，请检查！";
			}
             
	    /*------验证是否有单独节点end--------*/
		}else{//保存之前验证		
			//验证同步器节点是否直接指向同步器节点，是则报错
			if(cell.target.typeId == "f3" && cell.source.typeId == "f3"){
				flag = -1;
				flagStr = "同步器不能直接指向同步器，请重来！"
			}
			//验证箭头活动节点是否直接指向活动节点，是则报错
			if(cell.target.typeId == "61" && cell.source.typeId == "61"){
				flag = -1;
				flagStr = "活动节点不能直接指向活动节点，请用同步器衔接！"
			}
			//验证是箭头不能指向开始也不能从结束开始
			if(cell.typeId == "f0" &&( cell.target.typeId=="f1"||cell.source.typeId=="f2")){
				flag=-1;	
				flagStr="箭头不能指向开始节点，也不能从终止节点出发，请重来！";
			}												
			//验证是箭头不能从开始直接指向终止									
			if(cell.source.typeId=="f1"&&cell.target.typeId=="f2"){
				flag=-1;	
				flagStr="箭头不能从开始直接指向终止，请重来！";
			}
			//验证不能两个节点之间不能同时存在两条线
			for (var key in graph.getModel().cells){
				
				var tmp = graph.getModel().getCell(key);														
				if(graph.getModel().isEdge(tmp)){//添加所有边的id
					if(tmp.source.id==cell.target.id&&tmp.target.id==cell.source.id){
						flag=-1;	
						flagStr="不能有双向箭头，请重来！";
					}
				}
			}
			if(cell.target.typeId == "61" || cell.source.typeId == "61"){
				//var sourceLengh = 0;
				//var targetLengh = 0;
				for(var key in graph.getModel().cells){
					var tmp = graph.getModel().getCell(key);	
					if(graph.getModel().isEdge(tmp)){//遍历所有的边
						if(tmp != cell && (tmp.source.id == cell.source.id || tmp.target.id == cell.target.id)){
							flag=-1;	
							flagStr="活动节点不能多进或者多出！只能单进单出";
							break;
						}
					}
				}
			}
		}
		return flag+","+flagStr;
	}
	
	/**
	 * 功能节点验证
	 */
	function checkFunction (){
		var flag=1;
		var flagStr="";
		for (var key in graph.getModel().cells){				
			var cell = graph.getModel().getCell(key);
			if(graph.getModel().isVertex(cell)){
				if(cell.id!=0&&cell.id!=1){
					var typeId = cell.typeId+"_";
					if(typeId!="f1_"&&typeId!="f2_"){
					var source = findEdgeArray(cell,0);
					var target = findEdgeArray(cell,1);
					var pointName = cell.getAttribute('pointName', '');
					if(typeId=="f3_"){//排他节点
						if(target.length>1){
							flag = -1;
							flagStr = "不能同时多条线指向【"+pointName+"】";
							updateLink(cell.id,0);
							return flag+","+flagStr;
						}else{
							//如果上一个节点是并行合并，则可以忽略。modified by gsz 2015-09-17
//							if(target[0].source.typeId != 'f5'){
//								var resultVar = target[0].source.getAttribute('resultVar', '');
//								if(resultVar==null||resultVar==""){
//									flag = -1;
//									flagStr = "【"+pointName+"】的上一个节点必须为工作节点同时结果变量不能为空";
//									updateLink(cell.id,0);								
//									return flag+","+flagStr;
//								}
//							}
														
						}
//						if(source.length<2){
//							flag = -1;
//							flagStr = "不能少于2条线从【"+pointName+"】出发";	
//							updateLink(cell.id,0);
//							return flag+","+flagStr;
//						}else{
//							for(var i=0;i<source.length;i++){
//								if((source[i].target.typeId+"_").indexOf("f")>=0&&source[i].target.typeId!="f2"){
//									flag = -1;
//									flagStr = "【"+pointName+"】的下一个节点必须是工作节点";
//									updateLink(cell.id,0);
//									return flag+","+flagStr;
//								}
//								var selectCondition=source[i].getAttribute('pointCondition', '');
//								if(selectCondition==null||selectCondition==""){
//									flag = -1;
//									flagStr = "从【"+pointName+"】出发的线的流转条件不能为空";
//									updateLink(cell.id,0);
//									return flag+","+flagStr;
//								}					
//							}
//						}						
					}else if(typeId=="f4_"||typeId=="f5_"){//并行节点
						var nextNode = null;
						var lastNode = null;
						
						if(source.length>1){//并行分支时候							
							for(var i=0;i<source.length;i++){
								if((source[i].target.typeId+"_").indexOf("f")>=0){
									flag = -1;
									flagStr = "【"+pointName+"】的下一个节点必须是工作节点";
									updateLink(cell.id,0);
									return flag+","+flagStr;
								}else{
									 var temp = findNextNode(source[i].target);
									 while(temp!=null){//一只循环查找下一个节点直到找到并行合并节点
										 if(temp.typeId=="f5"){
											 break;
										 }
										 temp = findNextNode(temp);										 
									 }
									 if(temp==null){//为空说明找到最后也没有找到一个并行合并节点
										flag = -1;
										flagStr = "【"+pointName+"】的下一个合并节点必须为并行合并类型节点";										
										return flag+","+flagStr;
									 }
									 
									if(i>0){//判断他们合并在一起的节点是不是同一个并行合并节点
										if(nextNode!=temp){
											flag = -1;
											flagStr = "从【"+pointName+"】出发的线必须合并于同一个并行合并类型节点";
											return flag+","+flagStr;
										}
									}else{
										nextNode = temp;
									}
								}																																
							}
						}
						
						if(target.length>1){//并行合并的时候
							for(var i=0;i<target.length;i++){
								if((target[i].source.typeId+"_").indexOf("f")>=0){
									flag = -1;
									flagStr = "【"+pointName+"】的上一个节点必须是工作节点";
									updateLink(cell.id,0);
									return flag+","+flagStr;
								}else{
									 var temp = findLastNode(target[i].source);
									 while(temp!=null){//一只循环查找上一个节点直到找到并行分支节点
										 if(temp.typeId=="f4"){
											 break;
										 }
										 temp = findLastNode(temp);										 
									 }
									 if(temp==null){//为空说明没有找到上一个并行分支节点
										flag = -1;
										flagStr = "【"+pointName+"】的上一个分支出发节点必须为并行分支类型节点";
										return flag+","+flagStr;
									 }
									if(i>0){//判断他们的下一个节点是不是汇聚在一起
										if(lastNode!=temp){
											flag = -1;
											flagStr = "汇聚于【"+pointName+"】的线必须出发于同一个并行分支类型节点";
											return flag+","+flagStr;
										}
									}else{
										lastNode = temp;
									}								
								}
							}							
						}						
						if(source.length==1&&target.length==1){
							flag = -1;
							flagStr = "【"+pointName+"】不能一进一出";
							updateLink(cell.id,0);
							return flag+","+flagStr;
						}
					}else if(typeId=="f6_"){//包容节点
						
					}
				  }

				}
			}
		}
		return flag+","+flagStr
	}		
	
	/**
	 * 角色验证
	 * @returns {String}
	 */
	function checkRole(){
		var pointName="";
		for (var key in graph.getModel().cells){				
			var cell = graph.getModel().getCell(key);
			if(graph.getModel().isVertex(cell)){
				if(cell.id != 0 && cell.id != 1 && cell.url != 'point/noRolePoint.jsp' && cell.url != 'point/autoPoint.jsp'){//申请节点不验证角色
					var typeId = cell.typeId+"_"
					if(typeId.indexOf("f")<0){
						if(cell.getAttribute('roleCode', '') == null || cell.getAttribute('roleCode', '') == ""){
							pointName = cell.getAttribute('pointName', '');
							break;
						}
					}	
				}
			}
		}
		return pointName;
	}
	
	/**
	 * 设置展示图形的xml字符串
	 */
	function setMxGraph(){
		//获取图形的xml信息
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(editor.graph.getModel());		
		workflowShowConfig = mxUtils.getPrettyXml(node);//设置当前图形的内容
	}
	/**
	 * 获取uuid，用于设置节点和链接线以及图形的id
	 * @returns {String}
	 */
	function getUUID(){
		var uuid = "";
		$.ajax({
			url:basePath + "rest/design/getUUID",
			type:'post',
			async: false,  
			success:function(data,textStatus,xhr){
				uuid=data;
			}
		});
		return uuid;
	}
	
	/**
	 * 重新绘图
	 */
	function newDraw(){
		//重新画图之后，重新初始化设置一些变量
		nowCell=null; 
		workflowBpmnConfig="";
		workflowShowConfig="<mxGraphModel><root><mxCell id='0'/><mxCell id='1' parent='0'/></root></mxGraphModel>";
		showMxGraph();
	}
	
	/**
	 * 左侧图形的初始化
	 * @param id
	 * @param text
	 */
	function qryMenuList(id,text){	
		var info = getJson();
		if(id==0){
			 $.each(info, function(index,bankinfo){ 
				if(info[index].parentId==id){				
					$('#sidebarContainer').append("<li><em></em><b></b><span> "+info[index].text+"</span><ul id="+info[index].id+"></ul></li>");
			    	qryMenuList(info[index].id,info[index].text);
				 }
			 });  
		 }else{
			 $.each(info, function(index,bankinfo){
				 if(info[index].parentId==id){
					if(info[index].isLeaf==true){//判断是否是叶子节点
						var vertex = new mxCell('', new mxGeometry(0, 0, 45, 45), 'image;image='+info[index].imgUrl);
						vertex.setVertex(true);
						vertex.typeId=info[index].typeId;
						vertex.url=info[index].url;
						vertex.width=info[index].width;
						vertex.height=info[index].height;
						
						vertex.desc=info[index].desc;
						vertex.note=info[index].note;
						vertex.img=info[index].img;
						
						addSidebarIcon(vertex,info[index].imgUrl,info[index].parentId,info[index].id,
								info[index].displayName,info[index].typeId,info[index].desc);
					}else{
					    $('#'+id).append("<li><em style='padding-left:90px'></em><b se='padding-left:90px'></b><span style='padding-left:20px'> "+info[index].text+"</span><ul id="+info[index].id+"></ul></li>");
				    	qryMenuList(info[index].id,info[index].text);
					}
				 }				
			}); 		
		} 
	}
	/**
	 * 设置节点菜单的样式
	 */
	function setStyle(graph){
		var style = new Object();
		style["labelBackgroundColor"]="white";
		style["verticalAlign"]="top";
		style["fillColor"]="#FFFFFF";		
		style["strokeColor"]="BLUE";
		style["strokeWidth"] = '2';
		style["verticalLabelPosition"]="bottom";		
		graph.getStylesheet().putCellStyle('link', style);				
		style = mxUtils.clone(style);
		
		style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;	
		style[mxConstants.STYLE_STROKECOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_IMAGE_WIDTH] = '40';
		style[mxConstants.STYLE_IMAGE_HEIGHT] = '40';
		style[mxConstants.STYLE_SPACING] = '-2';		
		graph.getStylesheet().putCellStyle('image', style);	
		
		style = graph.getStylesheet().getDefaultEdgeStyle();
		style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
		style[mxConstants.STYLE_ROUNDED] = true;
//		style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;
	}
	
	/**
	 * 图形中节点名字的变更
	 */
	function controlModel(){	
		var pointName=nowCell.getAttribute('pointName', '');
		graph.getModel().beginUpdate();      
        try
        {
	    	var edit = new mxCellAttributeChange(nowCell, "pointName",pointName);
	       	graph.getModel().execute(edit);
	       	//graph.updateCellSize(cell);
        }
        finally
        {
            graph.getModel().endUpdate();
        }
	}
	
	/**
	 * 变更节点样式，主要用于图形检测是否有误
	 * @param id
	 * @param flag
	 */
	function updateLink(id,flag){
		var model = graph.getModel() 
		model.beginUpdate();
		try{
			for (var key in graph.getModel().cells){				
				var cell = graph.getModel().getCell(key);
					if(graph.getModel().isVertex(cell)){	
						if(flag==0){//0表示保存增加错误样式
							var pointCode = cell.getAttribute('pointCode', '');
							if(id==cell.id||id==pointCode){							
								graph.setCellStyles("strokeColor", 'red', [cell]);								
							}							
						}else{//1表示画图的时候删除错误样式
							graph.setCellStyles("strokeColor", '#ffffff', [cell]);
						}
					}
				}	
			}finally{
			model.endUpdate();
		 }
	}
	
/**
 * 设置流程图xml的字符串
 */
function setWorkflow(flag){
	debugger;
	var workflow = "";
	workflow += '<?xml version="1.0" encoding="UTF-8"?>';
	workflow += '<!DOCTYPE fpdl:WorkflowProcess PUBLIC "-//Nieyun Chen//ProcessDefinition//CN" "FireFlow_Process_Definition_Language.dtd">';
	workflow += '<fpdl:WorkflowProcess xmlns:fpdl="http://www.fireflow.org/Fireflow_Process_Definition_Language"';
	workflow += ' Id="' + workflowId + '" Name="' + workflowName + '" DisplayName="' + workflowName + '" ResourceFile="" ResourceManager="">';
	
	var startNodeStr = '';
	var endNodesStr = "<fpdl:EndNodes>";
	var synchornizersStr = "<fpdl:Synchronizers>";
	var transitionsStr = "<fpdl:Transitions>";
	var activitiesStr = "<fpdl:Activities>";
	var loopsStr = "<fpdl:Loops>";
	
	function addExAttr(cell){
		res = "";
		res += '<fpdl:ExtendedAttributes>';		
		res += '<fpdl:ExtendedAttribute Name="FIRE_FLOW.bounds.height" Value="' + cell.geometry.height + '"/>';
		res += '<fpdl:ExtendedAttribute Name="FIRE_FLOW.bounds.width" Value="' + cell.geometry.width + '"/>';
		res += '<fpdl:ExtendedAttribute Name="FIRE_FLOW.bounds.x" Value="' + cell.geometry.x + '"/>';
		res += '<fpdl:ExtendedAttribute Name="FIRE_FLOW.bounds.y" Value="' + cell.geometry.y + '"/>';			
		res += '</fpdl:ExtendedAttributes>';
		return res;
	}
	
	for(var key in graph.getModel().cells){
		var tmp = graph.getModel().getCell(key); //遍历节点,逐个保存
		switch(tmp.typeId){
			case "f1":{
				startNodeStr += '<fpdl:StartNode Id="' + tmp.id + '" name="' + tmp.name + '" displayName="' + tmp.displayName + '">';
				startNodeStr += addExAttr(tmp);
				startNodeStr += '</fpdl:StartNode>';
				break;
			}
			case "f2":{
				endNodesStr += '<fpdl:EndNode Id="' + tmp.id + '" name="' + tmp.name + '" displayName="' + tmp.displayName + '">';
				endNodesStr += addExAttr(tmp);
				endNodesStr += '</fpdl:EndNode>';
				break;
			}
			case "f3":{
				synchornizersStr += '<fpdl:Synchronizer Id="' + tmp.id + '" name="' + tmp.name + '" displayName="' + tmp.displayName + '">';
				synchornizersStr += addExAttr(tmp);
				synchornizersStr += '</fpdl:Synchronizer>';
				break;
			}
			case 61:{
				activitiesStr += '<fpdl:Activity Id="' + tmp.id + '" name="' + tmp.name + '" displayName="' + tmp.displayName + '">';
				if(tmp.desc){
					activitiesStr += '<fpdl:Description>' + tmp.desc + '</fpdl:Description>';
				}
				activitiesStr += addExAttr(tmp);
				if(tmp.task_name){
					activitiesStr += '<fpdl:Tasks>';
					activitiesStr += '<fpdl:Task Id="' + tmp.task_name +'" Name="' + tmp.task_name + '" CompletionStrategy="' + (tmp.completionStrategy?"tmp.completionStrategy":"ANY") + '">'
					activitiesStr += '</fpdl:Task>';
					activitiesStr += '</fpdl:Tasks>';
				}					
				activitiesStr += '</fpdl:Activity>';
				break;
			}
			case "f0": {
				transitionsStr += '<fpdl:Transition Id="' + tmp.id + '" Name="' + tmp.name + '" DisplayName="' + tmp.displayName + '" From="' + tmp.source.id + '" To="' + tmp.target.id + '>';
				transitionsStr += '<fpdl:Condition>' + (tmp.condition? tmp.condition :"") + '</fpdl:Condition>';
				//transitionsStr += addExAttr(tmp);
				transitionsStr += '</fpdl:Transition>';
				break;
			}
			case "l1": {
				loopsStr += '<fpdl:Transition Id="' + tmp.id + '" Name="' + tmp.name + '" DisplayName="' + tmp.displayName + '" From="' + tmp.source.id + '" To="' + tmp.target.id + '>';
				loopsStr += '<fpdl:Condition>' + (tmp.condition? tmp.condition :"") + '</fpdl:Condition>';
				//loopsStr += addExAttr(tmp);
				loopsStr += '</fpdl:Loop>';
				break;
			}
			default:{
				break;
			}
		}
	}
	
	endNodesStr += "</fpdl:EndNodes>";
	synchornizersStr += "</fpdl:Synchronizers>";
	transitionsStr += "</fpdl:Transitions>";
	activitiesStr += "</fpdl:Activities>";
	loopsStr += "</fpdl:Loops>";
	
	workflow += startNodeStr + endNodesStr + synchornizersStr + transitionsStr + activitiesStr + loopsStr;
	workflow += '</fpdl:WorkflowProcess>';
	workflow = workflow.replaceAll('>','>\n');
	workflowBpmnConfig = workflow;
	return workflow;
}
//function setWorkflow(flag){
//	debugger;
//	var workflow = "";
//	workflow+='<?xml version="1.0" encoding="UTF-8"?>\n';
//	workflow+='<definitions targetNamespace="http://www.activiti.org/processdef"';
//	workflow+=' expressionLanguage="http://www.w3.org/1999/XPath"';
//	workflow+=' typeLanguage="http://www.w3.org/2001/XMLSchema"';
//	workflow+=' xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"';
//	workflow+=' xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"';
//	workflow+=' xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"';
//	workflow+=' xmlns:activiti="http://activiti.org/bpmn"';
//	workflow+=' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
//	workflow+=' xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">\n';
//	if(flag==0){//0表示验证测试
//		workflow+='<process isExecutable="true" id="sid-'+workflowId+'-test" name="'+workflowName+'">\n';
//
//	}else{
//		workflow+='<process isExecutable="true" id="sid-'+workflowId+'" name="'+workflowName+'">\n';
//	}
//	workflow+='<extensionElements>\n';
//	workflow+='<activiti:executionListener event="start" class="com.ylkj.base.flow.listener.WorkFlowStartListener"/>\n';
//	workflow+='<activiti:executionListener event="end" class="com.ylkj.base.flow.listener.WorkFlowEndListener"/>\n';
//	workflow+='</extensionElements>\n';
//	var linkStr = "";//连接线字符
//	var taskStr = "";//任务节点字符串
//	var funcionStr = "";//功能节点字符串
//	for (var key in graph.getModel().cells)	{//遍历节点，足个保存	
//		var tmp = graph.getModel().getCell(key);	
//		if (mxUtils.isNode(tmp.value)){	
//			if(graph.getModel().isEdge(tmp)){
//				var pointCode = tmp.getAttribute('pointCode', '');
//				var typeId = tmp.typeId;
//				var pointName = tmp.getAttribute('pointName', '');
//				var pointCondition = tmp.getAttribute('pointCondition', '');
//				var source = tmp.getAttribute('source', '');
//				var target = tmp.getAttribute('target', '');
//				linkStr+='<sequenceFlow id="'+pointCode+'" name="'+pointName+'"';
//				linkStr+=' targetRef="'+target+'" sourceRef="'+source+'">\n';
//				if(pointCondition!=null&&pointCondition!=""){
//					linkStr+='<conditionExpression xsi:type="tFormalExpression">\n';
//					linkStr+='<![CDATA['+pointCondition+']]>\n';
//					linkStr+='</conditionExpression>\n';
//				}				
//				linkStr+='</sequenceFlow>\n';
//			}else{
//				var pointCode = tmp.getAttribute('pointCode', '');
//				var typeId = tmp.typeId;
//				var pointName = tmp.getAttribute('pointName', '');
//				var pointCondition = tmp.getAttribute('pointCondition', '');
//				if(typeId=="f1"){
//					funcionStr+='<startEvent id="'+pointCode+'" name="'+pointName+'"/>\n';
//				}else if(typeId=="f2"){
//					funcionStr+='<endEvent id="'+pointCode+'" name="'+pointName+'"/>\n';
//				}else if(typeId=="f3") {
//					funcionStr+='<exclusiveGateway id="'+pointCode+'" name="'+pointName+'"/>\n';
//				}else{
//					var taskContent = tmp.getAttribute('taskContent', '');
//					taskStr+=taskContent						   
//				}												
//			}
//		}
//	  }
//	workflow=workflow+funcionStr+taskStr+linkStr+'</process>\n</definitions>';	
//	workflowBpmnConfig = workflow;
//   }

/**
 * 获得顶点的两边数组
 * @param cell
 * @param type
 * @returns
 */
function findEdgeArray(cell,type){
	var edge = new Array();
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

/**
 * 获取下一个节点
 * @param cell
 * @returns
 */
function findNextNode(cell){
	var node = null;
	var source =  findEdge(cell,0);
	if(source!=null){
		node=source.target;
	}
	return node;	
}

/**
 * 获取上一个节点
 * @param cell
 * @returns
 */
function findLastNode(cell){
	var node = null;
	var target =  findEdge(cell,1);
	if(target!=null){
		node=target.source;
	}
	return node;	
}
/**
 * 获得顶点的两边
 * @param cell
 * @param type
 * @returns
 */
function findEdge(cell,type){
	var edge = null;
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

/**
 * 流程信息查询
 */
function searchWorkflow(){
	var url = basePath + "rest/flowManage/query";
	var param = {
			'id':flowId,
			'typeId':typeId
	};
	$.ajax({
		url : url,
		type : "POST",
		data : param,
		async: false,
		success : function(data) {
			//操作完成后，若成功，则将id回填到输入框,变成修改状态，反之将提交标识位改为未提交状态，重新进行新增操作
			if(!isEmpty(data.rows)){
				var info=data.rows[0];
				workflowShowConfig = parseXml(info.processContent);//解析fireflow文件成画图xml格式
//				workflowShowConfig = info.workflowShowConfig;//设置当前显示图形的内容
			    workflowBpmnConfig = info.processContent;//设置当前流程图形的内容
			    
			    workflowName = info.workflowName;//设置当前显示图形的名称
			    drawflag = 1; //这是当前为修改状态	
			    showMxGraph();
			}
		},
		error:function(data){
			$.messager.alert('警告','查询出错','warning'); 
		}
	});
}

//转化后台xml到mxgraph格式的xml
var parseXml = function (xmlFile) {
	if(document.implementation.createDocument){
		var parser = new DOMParser();
		xmlFile = parser.parseFromString(xmlFile,"text/xml");
	}else if(window.ActiveXObject){
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlFile = xmlDoc.loadXML(xmlFile);
	}
    
    var res = "<mxGraphModel><root>";
    res += '<mxCell id="0"/>';
    res += '<mxCell id="1" parent="0"/>';

    //普通节点解析 用于synchronizer endNode startNode
    function parseToVertexString(node,typeId){
    	var style = "";
    	var pointName = "";
    	var url = "";
    	if(typeId == "f1"){
    		style = "image;image=assets/images/menu/begins.png;strokeColor=#ffffff";
    		pointName = "开始节点";
    		url = "point/functionPiont.jsp";
    	}
    	if(typeId == "f2"){
    		style = "image;image=assets/images/menu/ends.png;strokeColor=#ffffff";
    		pointName = "结束节点";
    		url = "point/functionPiont.jsp";
    	}
    	if(typeId == "f3"){
    		style = "image;image=assets/images/menu/exclusive.png;strokeColor=#ffffff";
    		pointName = "同步器节点";
    		url = "point/functionPiont.jsp";
    	}
    	//var text = '<Point typeId ="' + typeId + '" workflowId="' + workflowId + '" pointName="' + pointName + '" id="' + node.attributes.getNamedItem("Id").nodeValue + '">' ;
    	var text = '<mxCell id="' + node.attributes.getNamedItem("Id").nodeValue + '" typeId="' + typeId  + '" parent="1" vertex="1" style="' + style + '" url="' + url + '">';
        var opt ={};
        var extendedAttributes = node.children[0];
        for(var j = 0;j < extendedAttributes.children.length;j++) {
            switch (extendedAttributes.children[j].attributes.getNamedItem("Name").nodeValue) {
                case "FIRE_FLOW.bounds.height":
                {
                    opt.height = extendedAttributes.children[j].attributes.getNamedItem("Value").nodeValue;
                    break;
                }
                case "FIRE_FLOW.bounds.width":
                {
                    opt.width = extendedAttributes.children[j].attributes.getNamedItem("Value").nodeValue;
                    break;
                }
                case "FIRE_FLOW.bounds.x":
                {
                    opt.x = extendedAttributes.children[j].attributes.getNamedItem("Value").nodeValue;
                    break;
                }
                case "FIRE_FLOW.bounds.y":
                {
                    opt.y = extendedAttributes.children[j].attributes.getNamedItem("Value").nodeValue;
                    break;
                }
                default :
                {
                    break;
                }
            }
        }
        text += "<mxGeometry width='" + opt.width + "' height='" + opt.height + "' x='" + opt.x + "' y='" + opt.y + "' as='geometry' >";
        text += "<mxRectangle width='" + opt.width + "' height='" + opt.height + "' as='alternateBounds'/>";
        text += "</mxGeometry>";
        text += "</mxCell>";
       // text += "</Point>"
        return text;

    }
  //连接线解析 transition
    function parseToEdgeString(node,typeId){
        var edgeStyle = "";
        //if(node.tagName == "fpdl:Loop"){
        //    edgeStyle = "entityRelationEdgeStyle";
        //}
        var extendedAttributes = node.getElementsByTagNameNS(namespaceURI,"ExtendedAttribute");
        var points = null;
        if(extendedAttributes.length > 0){
            for(var i = 0 ; i < extendedAttributes.length; i++){
                if(extendedAttributes[i].attributes.getNamedItem("Name").nodeValue === "FIRE_FLOW.edgePointList"){
                    var pointsInfo = extendedAttributes[i].attributes.getNamedItem("Value").nodeValue.match(/\d+/g);
                    points = pointsInfo;

                }
            }
        }
        //if(points){
        //    console.log(points);
        //}
        var value;
        if(node.attributes && node.attributes.getNamedItem("DisplayName")){
            value = node.attributes.getNamedItem("DisplayName").nodeValue;
        }
        value = preventTransferMeaning(value);
        var url = "point/linkPoint.jsp";
    	//var text = '<Link typeId ="' + typeId + '" workflowId="' + workflowId + '">' ;
        var text = '<mxCell id="' + node.attributes.getNamedItem("Id").nodeValue + '" parent="1" edge="1" style="" source="' + node.attributes.getNamedItem("From").nodeValue + '" ' 
        text += ' target="' + node.attributes.getNamedItem("To").nodeValue + '" typeId="' + typeId + '" value="' + value + '" url="' + url + '">';
        text += '<mxGeometry relative="1" as="geometry">';
        text += '<Array as="points">';
        if(points){
            for(i = 0; i < points.length; i += 2){
                text += '<mxPoint x="' + points[i] + '" y="' + points[i+1] + '"/>';
            }
        }
        //text += '<mxPoint x="800" y="800"/>';
        text += '</Array>';
        text += '</mxGeometry>';
        text += '</mxCell>';
       // text += '</Link>'
        return text;
    }

    //解析活动activity
    function parseToActivityVertexString(node,typeId){
        var opt ={};
        var tasks = node.getElementsByTagNameNS(namespaceURI,"Task");
        var extendedAttributes = node.getElementsByTagNameNS(namespaceURI,"ExtendedAttribute");
        if(extendedAttributes && extendedAttributes.length > 0){
            for(var j = 0;j < extendedAttributes.length;j++) {
                switch (extendedAttributes[j].attributes.getNamedItem("Name").nodeValue) {
                    case "FIRE_FLOW.bounds.height":
                    {
                        opt.height = extendedAttributes[j].attributes.getNamedItem("Value").nodeValue;
                        break;
                    }
                    case "FIRE_FLOW.bounds.width":
                    {
                        opt.width = extendedAttributes[j].attributes.getNamedItem("Value").nodeValue;
                        break;
                    }
                    case "FIRE_FLOW.bounds.x":
                    {
                        opt.x = extendedAttributes[j].attributes.getNamedItem("Value").nodeValue;
                        break;
                    }
                    case "FIRE_FLOW.bounds.y":
                    {
                        opt.y = extendedAttributes[j].attributes.getNamedItem("Value").nodeValue;
                        break;
                    }
                    default :
                    {
                        break;
                    }
                }
            }
        }
        var displayName = node.attributes.getNamedItem("DisplayName").nodeValue;
        var name = node.attributes.getNamedItem("Name").nodeValue;
        var value = displayName == ""?name : displayName;
        
        var pointName = "工作流";
        var url = "point/rolePoint.jsp";
        
       // var text = '<Point typeId ="' + typeId + '" workflowId="' + workflowId + '" pointName="' + pointName + '">' ;
        var text = '<mxCell id="' + node.attributes.getNamedItem("Id").nodeValue + '" value="' + value ;
        text += '" taskName="';
        if(tasks && tasks.length > 0){
            for(var w = 0;w < tasks.length ; w++){
                text += tasks[w].attributes.getNamedItem("DisplayName").nodeValue + ' ';
            }
        }
        var style = "image;image=assets/images/menu/usertask.png;strokeColor=#ffffff"
        text += '" name="' + name;
        text += '" displayName="' + displayName + '" typeId="' + typeId  + '" parent="1" vertex="1" style="' + style + '" url="' + url + '" ' + 'desc="工作流程。" img="assets/images/conditionalBranch.png" ' + '>';
        text += "<mxGeometry width='" + opt.width + "' height='" + opt.height + "' x='" + opt.x + "' y='" + opt.y + "' as='geometry' >";
        text += "<mxRectangle width='" + opt.width + "' height='" + opt.height + "' as='alternateBounds'/>";
        text += "</mxGeometry>";
        text += "</mxCell>";
        //text += "</Point>";
        return text;
    }
    
    xmlFile = xmlFile.childNodes[1];
    var namespaceURI = xmlFile.namespaceURI;
    for(var i = 0; i < xmlFile.childNodes.length; i++){
        var k;//内循环
        switch(xmlFile.childNodes[i].nodeName){
            case "fpdl:StartNode" : {
                var startNode = xmlFile.childNodes[i];
                res += parseToVertexString(startNode,"f1");
                break;
            }
            case "fpdl:EndNodes": {
                var endNodes = xmlFile.childNodes[i];
                for(k = 0;k < endNodes.children.length;k++){
                    var endNode = endNodes.children[k];
                    res += parseToVertexString(endNode,"f2");
                }
                break;

            }
            case "fpdl:Synchronizers":{
                var synchronizers = xmlFile.childNodes[i];
                for(k = 0;k < synchronizers.children.length;k++){
                    var synchronizer = synchronizers.children[k];
                    res += parseToVertexString(synchronizer,"f3");
                }
                break;
            }
            case "fpdl:Transitions":{
                var transitions = xmlFile.childNodes[i];
                for(k = 0;k < transitions.children.length;k++){
                    var transition = transitions.children[k];
                    res += parseToEdgeString(transition,"f0");
                }
                break;
            }
            case "fpdl:Activities":{
                var activitys = xmlFile.childNodes[i];
                for(k = 0;k < activitys.children.length;k++){
                    var activity = activitys.children[k];
                    res += parseToActivityVertexString(activity,"61");
                }
                break;
            }
            case "fpdl:Loops":{
                var loops = xmlFile.childNodes[i];
                for(k = 0;k < loops.children.length;k++){
                    var loop = loops.children[k];
                    res += parseToEdgeString(loop,"l2");
                }
                break;
            }
            default :{
                break;
            }
        }
    }

    res += "</root></mxGraphModel>";
    return res;
}

var preventTransferMeaning = function(str){
    var value = str;
    //res.replace(/&/g,"&amp;");
    if(value){
    	value = value.replace(/&/g,"&amp;");
    	value = value.replace(/>/g,"&gt;");
    	value = value.replace(/</g,"&lt;");
    }
    //res.replace(/ /g,"&nbsp;");
    //res.replace(/"/g,"&quot");
    return value;
}

function saveWorkflow(){
	if(workflowName==""||workflowName==null){
		$.messager.alert('警告','名称不能为空','warning');   
		return;
	}
	//检查图形是否画对
	var nodeArr = checkNode().split(",");
	if (nodeArr[0]==-1){
		$.messager.alert('警告',nodeArr[1],'warning'); 
		return;
	}
	if(checkRole()!=""){	
		$.messager.alert('警告', '请为【'+checkRole()+'】节点选择角色', 'warning');
		return;
		
	}	
	var functionArr = checkFunction().split(",");
	if (functionArr[0]==-1){
		$.messager.alert('警告',functionArr[1],'warning'); 
		return;
	}
	
	setMxGraph();//设置xml图形的信息
	setWorkflow();//设置流程图形的信息
	var workflow = {
			'workflowId':workflowId,
			'flowId':flowId,
			'operatorId':1,
			'workflowName':workflowName,				
			'workflowShowConfig':$ESAPI.encoder().encodeForHTML(workflowShowConfig),
			'workflowBpmnConfig':$ESAPI.encoder().encodeForHTML(workflowBpmnConfig),
			'version':currVersion,
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
			if(drawflag ==0){
				$.ajax({
					url:basePath + "rest/design/addFlowDef",
					type:'post',
					async: false,  
					data:workflow,
					success:function(data,textStatus,xhr){	
						$.messager.alert('提示', '保存成功', 'info', function(){	
							drawflag=1;	
				        	window.location.href="../flowmanage/flowManageIndex.jsp?catalogId="+catalogId;					
						});	
								
					}
				});		
			}else{
				$.ajax({
					url:basePath + "rest/design/updateFlowDef",
					type:'post',
					async: false,  
					data:workflow,
					success:function(data,textStatus,xhr){	
						$.messager.alert('提示', '保存成功', 'info', function(){					
				        	window.location.href="../flowmanage/flowManageIndex.jsp?catalogId="+catalogId;					
						});		
					}
				});				
		    }
		}
	});	
}

/**
 * 设置节点说明
 * @param desc
 * @param note
 * @param img
 */
function setPointDesc(desc,note,imgUrl,title){
	
	$("#pointTitle").html(title+"节点说明");
	$("#pointDesc").html("节点作用："+desc);
	$("#pointNote").html("注意事项："+note);	
	var img = document.createElement('img');
	img.setAttribute('src', imgUrl);
	img.style.height = '170px';
	img.align="middle";
	$("#pointImg").html("");
	$("#pointImg").append(img);
}

function englishToChinese(text){
	var result = text;
	if(text=="activiti-exclusive-gateway-seq-flow-without-conditions"){
		result="条件分支的条件不能为空"
	}
	if(text=="activiti-execution-listener-implementation-missing"){
		result="缺少工作流的执行监听"
	}	
	return result;	
}

/**
 * 画图节点菜单
 * @returns {Array}
 */
function getJson(){
	var data = [{
		"id":1,
		"name":"FunctionPoint",
		"displayName":"功能节点",
		"parentId":0,
		"isLeaf":false
	},{
		"id":2,
//		"text":"任务/服务节点",
		"name":"TaskPoint",
		"displayName":"工作节点",
		"parentId":0,
		"isLeaf":false
	},{
		"id":3,
		"name":"StartNode",
		"displayName":"开始节点",
		"parentId":1,
		"typeId":"f1",
		"desc":"流程建模的开始。",
		"note":"一个流程只能有一个开始节点。",
		"img":"assets/images/workPoint.png",
		"imgUrl":"assets/images/menu/begins.png",
		"url":"point/functionPiont.jsp",
		"width":"350",
		"height":"300",
		"isLeaf":true
	},{
		"id":4,
		"name":"EndNode",
		"displayName":"结束节点",
		"parentId":1,
		"typeId":"f2",
		"desc":"流程建模的结束。",
		"note":"一个流程只能有一个结束节点。",
		"img":"assets/images/workPoint.png",
		"imgUrl":"assets/images/menu/ends.png",
		"url":"point/functionPiont.jsp",
		"width":"350",
		"height":"300",
		"isLeaf":true
	},{
		"id":5,
		"name":"FormTask",
		"displayName":"工作流",
		"parentId":2,
		"typeId":61,
		"desc":"流程建模的结束。",
		"img":"assets/images/conditionalBranch.png",
		"imgUrl":"assets/images/menu/userTask.png",			
		"url":"point/rolePoint.jsp",
		"width":"800",
		"height":"550",
		"isLeaf":true
	},{
		"id":6,
		"name":"Activity",
		"displayName":"自动任务",
		"parentId":2,
		"typeId":61,
		"desc":"活动任务。",
		"note":"无。",
		"img":"assets/images/conditionalBranch.png",
		"imgUrl":"assets/images/menu/userTask.png",
		"url":"point/autoPoint.jsp",
		"width":"800",
		"height":"550",
		"isLeaf":true
	},{
		"id":7,
		"name":"Synchronizer",
		"displayName":"同步器",
		"parentId":1,
		"typeId":"f3",
		"desc":"用于流程申请。",
		"note":"无。",
		"img":"assets/images/conditionalBranch.png",
		"imgUrl":"assets/images/menu/exclusive.png",
		"url":"point/functionPiont.jsp",
		"width":"350",
		"height":"300",
		"isLeaf":true
	},{
		"id":8,
		"name":"Transition",
		"displayName":"连接线",
		//"parentId":1,
		"typeId":"f0",
		"desc":"用于连接节点",
		"note":"无。",
		//"img":"assets/images/conditionalBranch.png",
		//"imgUrl":"assets/images/menu/exclusive.png",
		"url":"point/linkPoint.jsp",
		"width":"1000",
		"height":"550",
		"isLeaf":true
	},{
		"id":9,
		"name":"Loop",
		"displayName":"回退线",
		//"parentId":1,
		"typeId":"l1",
		"desc":"用于反向连接节点。",
		"note":"无。",
		//"img":"assets/images/conditionalBranch.png",
		//"imgUrl":"assets/images/menu/exclusive.png",
		"url":"point/linkPoint.jsp",
		"width":"1000",
		"height":"550",
		"isLeaf":true
	}
	];
	return data;
}
