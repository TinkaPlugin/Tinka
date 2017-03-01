/*\
title: $:/plugins/ahahn/tinka/tinkaCommonAction.js
type: application/javascript
module-type: widget

Tinka common action widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var CommonActionWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
CommonActionWidget.prototype = new Widget();

/*
Setup an action widget with these properties
*/
CommonActionWidget.prototype.setup = function(allowPropagation,doRenderChildren,preparedParams,refreshOnAttributeChange) {
	this.doRenderChildren = doRenderChildren;
	this.preparedParams = preparedParams;
	this.allowPropagation = allowPropagation;
	this.refreshOnAttributeChange = refreshOnAttributeChange;
};
  
  
/*
Render this widget into the DOM
*/
CommonActionWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
  	if(this.doRenderChildren) {
		this.renderChildren(parent,nextSibling);
  	}
};

/*
Compute the internal state of the widget
*/
CommonActionWidget.prototype.execute = function() {
    this.processAttributes();
	// Construct the child widgets
	if(this.doRenderChildren) {
		this.makeChildWidgets();
	}
};
	
/*
Compute the values of our attributes
*/
CommonActionWidget.prototype.processAttributes = function() {
	var self = this;
	this.computeAttributes();
	this.param = {};

    if(this.isObject(this.preparedParams) && !this.isArray(this.preparedParams)) {
        $tw.utils.each(this.preparedParams,function(def, name) {
            self.param[name] = self.getAttribute(name,def);
        });
    }
    else {
        $tw.utils.each(this.preparedParams,function(name) {
            self.param[name] = self.getAttribute(name);
        });
    }
};

CommonActionWidget.prototype.allowActionPropagation = function() {
	return this.allowPropagation;	
};

CommonActionWidget.prototype.isEmptyObject = function(obj) {
	for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
};

CommonActionWidget.prototype.isObject = function(obj) {
    return ((obj !== null) && (typeof obj === 'object'));
};

CommonActionWidget.prototype.isArray = function(obj) {
    return (Object.prototype.toString.call(obj) === '[object Array]');
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
CommonActionWidget.prototype.refresh = function(changedTiddlers) {
  	var changedAttributes = this.computeAttributes();
		
	if(!this.isEmptyObject(changedAttributes) && this.refreshOnAttributeChange) {
		this.refreshSelf();
		return true;
    }
	else if (!this.isEmptyObject(changedAttributes)) {
		this.processAttributes();
	}
	
	return this.refreshChildren(changedTiddlers);		
};

exports.tinkaCommonAction = CommonActionWidget;

})();
