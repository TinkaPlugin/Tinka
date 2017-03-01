/*\
title: $:/plugins/ahahn/tinka/tinka-check.js
type: application/javascript
module-type: widget

Checks param "text" for match with "pattern".

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var TinkaCommonActionWidget = require("$:/plugins/ahahn/tinka/tinkaCommonAction.js").tinkaCommonAction;

var CheckAction = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.setup(false,true,["text", "pattern"],true);
};

CheckAction.prototype = new TinkaCommonActionWidget();
/*
Invoke the action associated with this widget
*/
CheckAction.prototype.invokeAction = function(triggeringWidget,event) {
	//important: recompute Attributes
	this.processAttributes();
	var regexp = new RegExp(this.param["pattern"]);
	
	if(regexp.test(this.param["text"])) {
		var ev = {};
		ev.verb = "pass";
		ev.data = event;
		this.invokeActions(triggeringWidget,ev); 
	}
	else {
		var ev = {};
		ev.verb = "fail";
		ev.data = event;
		this.invokeActions(triggeringWidget,ev);
	}
	
	return true; // Action was invoked
};

exports["tinka-check"] = CheckAction;

})();
