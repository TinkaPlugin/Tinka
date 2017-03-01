/*\
title: $:/plugins/ahahn/tinka/tinkaActions.js
type: application/javascript
module-type: widget

Action widgets related to Tinka.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SaveTaglistToFieldWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
SaveTaglistToFieldWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
SaveTaglistToFieldWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
SaveTaglistToFieldWidget.prototype.execute = function() {
	this.actionTarget = this.getAttribute("$target");
	this.actionTiddler = this.getAttribute("$tiddler");
  	this.actionField = this.getAttribute("$field");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
SaveTaglistToFieldWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$target"] || changedAttributes["$tiddler"] || changedAttributes["$field"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
SaveTaglistToFieldWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var taglist = [];
  	var field = "text";
  
    if (this.actionTarget) {
    	var targetTags = this.wiki.getTiddler(this.actionTarget);
      	
      	if (targetTags) {
      		taglist = targetTags.fields.tags || [];
      	}
    }
  
  	if (this.actionField) {
  		field = this.actionField;
  	}
  
  	if(this.actionTiddler) {
  		//save taglist in field on tiddler
      	this.wiki.setTextReference(this.actionTiddler+ "!!" +field, taglist, this.getVariable("currentTiddler")); 
 	}

  return true; // Action was invoked
};

/*

repackagePlugin action widget

<$repackagePlugin $plugin=<<target>> $repackage="yes" $diff=<<qualified-modify-diff>> />
*/
  
var repackagePluginWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
repackagePluginWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
repackagePluginWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
  	this.renderChildren(parent,nextSibling);
};

/*
Compute the internal state of the widget
*/
repackagePluginWidget.prototype.execute = function() {
	this.actionPlugin = this.getAttribute("$plugin");
	this.actionCreate = this.getAttribute("$create");
  	this.actionDiff = this.getAttribute("$diff");
    this.makeChildWidgets();
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
repackagePluginWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$plugin"] || changedAttributes["$create"] || changedAttributes["$diff"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
repackagePluginWidget.prototype.invokeAction = function(triggeringWidget,event) {
  	var diff = {};
  	var title = "";
  	if (this.actionPlugin) {
      title = this.actionPlugin;
      if (this.actionDiff) {
     	var tid = this.wiki.getTiddler(this.actionDiff);
        diff = tid || {};
      }
      
      if (this.actionCreate == "yes") {
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
      $tw.utils.repackPlugin(title, diff.fields.addTiddlers, diff.fields.removeTiddlers);
  	}
};
  
  
  
/*
	backUpPlugin Action Widget
    
	Backs up the specified plugin tiddler and modifies the 
    'plugin-type' and 'title' field accordingly.
*/
var BackupPluginWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
BackupPluginWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
BackupPluginWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
BackupPluginWidget.prototype.execute = function() {
	this.actionPlugin = this.getAttribute("$plugin", "");
  	this.actionRestore = this.getAttribute("$restore", "no");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
BackupPluginWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$plugin"] || changedAttributes["$restore"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
BackupPluginWidget.prototype.invokeAction = function(triggeringWidget,event) {

	if (this.actionPlugin) {
      	if (this.actionRestore == "yes") {
          	var backupTiddler = this.wiki.getTiddler(this.actionPlugin);
          	var operationConfirmed = true;
          	if (backupTiddler instanceof $tw.Tiddler) {      
      			if (this.checkIfExists(backupTiddler.fields["original-title"])) {
                  	operationConfirmed = confirm("You are about to restore a backup, but another version of this plugin is already active. Do you want to backup the current version (if not already existing) and restore this backup anyway ?");
                  	if (operationConfirmed) {
                      // after backing up, delete current $original-title Tiddler
                      this.backupPlugin(backupTiddler.fields["original-title"]);
                      this.wiki.deleteTiddler(backupTiddler.fields["original-title"]);  	
                    }
                }
              
              	if (operationConfirmed) {
                  var pluginType = this.determinePluginType(backupTiddler.fields["plugin-type"]);
                  this.wiki.addTiddler(new $tw.Tiddler(backupTiddler, {
                      "title": backupTiddler.fields["original-title"],
                      "original-title": undefined,
                      "plugin-type": pluginType
                  }));
              	}
            }
        }
       	else {
    		this.backupPlugin(this.actionPlugin);
       	}
    }
  	return true; // Action was invoked
};

BackupPluginWidget.prototype.determinePluginType = function(name) {
	var reg = /(.*)-backup/;
  	var matches = name.match(reg);
  	
  	if (matches != null) {
  		return matches[1]; 
    }
  
  	return "plugin";
}


BackupPluginWidget.prototype.backupPlugin = function(plugin) {
	var pluginTiddler = this.wiki.getTiddler(plugin);
    var didBackup = false;
      	if (pluginTiddler instanceof $tw.Tiddler) {
            var backupTitle = this.getBackupTitle(pluginTiddler.fields.title, pluginTiddler.fields.version);
            didBackup = true;
          
          	//Don't make a backup if a backup already exists
          	if (!this.checkIfExists(backupTitle)) {
              var backupTiddler = new $tw.Tiddler(pluginTiddler, {
                  "title": backupTitle,
                  "original-title": pluginTiddler.fields.title,
                  "plugin-type": "" + pluginTiddler.fields["plugin-type"] + "-backup"
              });

              this.wiki.addTiddler(backupTiddler);           
          	}
        }
  	return didBackup;
}

BackupPluginWidget.prototype.getBackupTitle = function(title, version) {
 	return "" + title + "-" + version + "-backup";
};
  
BackupPluginWidget.prototype.checkIfExists = function(tiddler) {
	return this.wiki.getTiddler(tiddler) != undefined;
}
  
exports["tinka-saveTaglistToField"] = SaveTaglistToFieldWidget;
exports["tinka-repackagePlugin"] = repackagePluginWidget;
exports["tinka-backupPlugin"] = BackupPluginWidget;

  
})();
