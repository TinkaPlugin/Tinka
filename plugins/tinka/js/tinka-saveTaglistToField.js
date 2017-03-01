/*\
title: $:/plugins/ahahn/tinka/tinka-saveTaglistToField.js
type: application/javascript
module-type: widget

Saves a tiddlers list of tags to a csv field.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var CommonAction = require("$:/plugins/ahahn/tinka/tinkaCommonAction.js").tinkaCommonAction;

var SaveTaglistToFieldWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
    this.setup(false,false,["$target","$tiddler","$field"],false);
};

/*
Inherit from the base widget class
*/
SaveTaglistToFieldWidget.prototype = new CommonAction();

/*
Invoke the action associated with this widget
*/
SaveTaglistToFieldWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var taglist = [];
  	var field = "text";
  
    if(this.param["$target"]) {
    	var targetTags = this.wiki.getTiddler(this.param["$target"]);
      	
      	if(targetTags) {
      		taglist = targetTags.fields.tags || [];
      	}
    }
  
  	if(this.param["$field"]) {
  		field = this.param["$field"];
  	}
  
  	if(this.param["$tiddler"]) {
  		//save taglist in field on tiddler
      	this.wiki.setTextReference(this.param["$tiddler"]+ "!!" +field,taglist,this.getVariable("currentTiddler")); 
 	}

  return true; // Action was invoked
};

exports["tinka-saveTaglistToField"] = SaveTaglistToFieldWidget;

})();
