/*\
title: $:/plugins/ahahn/tinka/tinka-filter.js
type: application/javascript
module-type: widget

Widgets to filters actions according to their verb.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var TinkaCommonActionWidget = require("$:/plugins/ahahn/tinka/tinkaCommonAction.js").tinkaCommonAction;

var FilterAction = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.setup(false, true, ["verb"], true);
};

FilterAction.prototype = new TinkaCommonActionWidget();
/*
Invoke the action associated with this widget
*/
FilterAction.prototype.invokeAction = function(triggeringWidget,event) {
	if (event.verb === this.param["verb"]) {
		this.invokeActions(triggeringWidget, event);
	}
	return true; // Action was invoked
};

exports["tinka-filter"] = FilterAction;

})();
