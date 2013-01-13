define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom",
	"dojo/on",
	"dojo/query",
	"dijit/popup",
	"dijit/TooltipDialog"
], function(declare, array, lang, win,	domAttr, domClass, domConstruct, domStyle, dom, on, query, popup, TooltipDialog) {
	
	return declare(TooltipDialog, {
		
		actions: [
			{ label: 'Prev', action: 'prev' },
			{ label: 'Next', action: 'next' },
			{ label: 'OK', action: 'ok' },
			{ label: 'Cancel', action: 'cancel' }
		],
	
		postCreate: function() {
			this.inherited(arguments);
			
			// We maintain two elements in our ContainerNode:
			//  - stepContainerNode - a div in which we place the current step
			//  - buttonBar - a div containing the current controls
			this.stepContainerNode = domConstruct.create('div', {
				'class': 'dojoxGuideStepContainer'
			}, this.containerNode, 'last');
			// The buttonBar borrows the actionBar styles from dijit because
			//  they're a nice sensible default, though annoying to override.
			this.buttonBar = domConstruct.create('div', {
				'class': 'dojoxGuideButtonBar dijitDialogPaneActionBar'
			}, this.containerNode, 'last');
			
			// We have a set of standard actions we can support
			this.actionNode = [];
			array.forEach(this.actions, lang.hitch(this, function(action) {
				
				var actNode = domConstruct.create('span', {
					'class': 'dojoxGuideAction',
					innerHTML: action.label,
					'data-action': action.action
				}, this.buttonBar, 'last');

				// handle click on the action, e.g. 'prev' calls this.prev()
				this.own(actNode, on(actNode, 'click', lang.hitch(this, function(e) {
					// Tell the parent that an action was clicked.
					this.parent.act(e.target.getAttribute('data-action'))
				})))
				
				// remember node for later just in case
				this.actionNode[action.action] = actNode;
			}))
		},
		// Makes actions visible or invisible
		// e.g. this.set('actions', [ 'prev', 'next'])
		displayActions: function(requiredActions) {
			array.forEach(this.actions, lang.hitch(this, function(action) {

				domStyle.set(this.actionNode[action.action], 'display',
					(requiredActions.indexOf(action.action) != -1) ? 'inline-block':'none');

			}))
		},
		prev: function() {
			
		}
	})
})