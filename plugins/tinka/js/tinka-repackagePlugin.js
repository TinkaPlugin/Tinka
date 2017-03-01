/*\
title: $:/plugins/ahahn/tinka/tinka-repackagePlugin.js
type: application/javascript
module-type: widget

repackagePlugin action widget

<$repackagePlugin $plugin=<<target>> $repackage="yes" $diff=<<qualified-modify-diff>> />

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var CommonAction = require("$:/plugins/ahahn/tinka/tinkaCommonAction.js").tinkaCommonAction;

  
var repackagePluginWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
    this.setup(false,false,["$plugin","$create","$diff"],false);
};

/*
Inherit from the base widget class
*/
repackagePluginWidget.prototype = new CommonAction();

/*
Invoke the action associated with this widget
*/
repackagePluginWidget.prototype.invokeAction = function(triggeringWidget,event) {
  	var diff = {};
  	var title = "";
	this.actionPlugin = this.param["$plugin"];
	this.actionCreate = this.param["$create"];
  	this.actionDiff = this.param["$diff"];

  	if(this.actionPlugin) {
      title = this.actionPlugin;
      if(this.actionDiff) {
     	var tid = this.wiki.getTiddler(this.actionDiff);
        diff = tid || {};
      }
      
      if(this.actionCreate == "yes") {
        //create new plugin Tiddler with the data from the diff tiddler
        var pluginTid = {};
        
        title = diff.fields["create-title"] || this.actionPlugin;
        pluginTid.title = title;
        pluginTid["text"] =	"{\"tiddlers\": {}}";
        pluginTid["type"] = "application/json";
        pluginTid["author"] = diff.fields["create-author"];
        pluginTid["description"] = diff.fields["create-description"];
		pluginTid["name"] = diff.fields["create-name"];
        pluginTid["list"] = diff.fields["create-list"];
        pluginTid["plugin-type"] = diff.fields["create-plugin-type"];
        pluginTid["dependents"] = diff.fields["create-dependents"];
        pluginTid["version"] = diff.fields["create-version"];
        pluginTid["core-version"] = diff.fields["create-core-version"];
        this.wiki.addTiddler(new $tw.Tiddler(pluginTid));
      }
      
      //execute repackaging
      $tw.utils.repackPlugin(title,diff.fields.addTiddlers,diff.fields.removeTiddlers);
  	}
};

exports["tinka-repackagePlugin"] = repackagePluginWidget;

})();
