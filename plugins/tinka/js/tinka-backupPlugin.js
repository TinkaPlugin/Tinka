/*\
title: $:/plugins/ahahn/tinka/tinka-backupPlugin.js
type: application/javascript
module-type: widget

Tinka's backup action widget to backup a plugin.
    
Backs up the specified plugin tiddler and modifies the 
'plugin-type' and 'title' field accordingly.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var CommonAction = require("$:/plugins/ahahn/tinka/tinkaCommonAction.js").tinkaCommonAction;

var BackupPluginWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
    this.setup(false,false,{
        "$plugin": "",
        "$restore": "no"
    },false);
};

/*
Inherit from the base widget class
*/
BackupPluginWidget.prototype = new CommonAction();

/*
Small string table
*/
BackupPluginWidget.prototype.CONFIRM_OVERRIDE = "You are about to restore a backup, but another version of this plugin is already active. Do you want to backup the current version (if not already existing) and restore this backup anyway ?"; 

/*
Invoke the action associated with this widget
*/
BackupPluginWidget.prototype.invokeAction = function(triggeringWidget,event) {
    this.actionPlugin = this.param["$plugin"];
    this.actionRestore = this.param["$restore"];

	if(this.actionPlugin) {
      	if(this.actionRestore == "yes") {
          	var backupTiddler = this.wiki.getTiddler(this.actionPlugin);
          	var operationConfirmed = true;
          	if(backupTiddler instanceof $tw.Tiddler) {      
      			if(this.checkIfExists(backupTiddler.fields["original-title"])) {
                  	operationConfirmed = confirm(this.CONFIRM_OVERRIDE);
                  	if(operationConfirmed) {
                      // after backing up, delete current $original-title Tiddler
                      this.backupPlugin(backupTiddler.fields["original-title"]);
                      this.wiki.deleteTiddler(backupTiddler.fields["original-title"]);  	
                    }
                }
              
              	if(operationConfirmed) {
                  var pluginType = this.determinePluginType(backupTiddler.fields["plugin-type"]);
                  this.wiki.addTiddler(new $tw.Tiddler(backupTiddler,{
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
  	
  	if(matches != null) {
  		return matches[1]; 
    }
  
  	return "plugin";
}


BackupPluginWidget.prototype.backupPlugin = function(plugin) {
	var pluginTiddler = this.wiki.getTiddler(plugin);
    var didBackup = false;
      	if(pluginTiddler instanceof $tw.Tiddler) {
            var backupTitle = this.getBackupTitle(pluginTiddler.fields.title,pluginTiddler.fields.version);
            didBackup = true;
          
          	//Don't make a backup if a backup already exists
          	if(!this.checkIfExists(backupTitle)) {
              var backupTiddler = new $tw.Tiddler(pluginTiddler,{
                  "title": backupTitle,
                  "original-title": pluginTiddler.fields.title,
                  "plugin-type": "" + pluginTiddler.fields["plugin-type"] + "-backup"
              });

              this.wiki.addTiddler(backupTiddler);           
          	}
        }
  	return didBackup;
}

BackupPluginWidget.prototype.getBackupTitle = function(title,version) {
 	return "" + title + "-" + version + "-backup";
};
  
BackupPluginWidget.prototype.checkIfExists = function(tiddler) {
	return this.wiki.getTiddler(tiddler) != undefined;
}

exports["tinka-backupPlugin"] = BackupPluginWidget;

})();
