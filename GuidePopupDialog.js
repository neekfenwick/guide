/*jshint quotmark:false */
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
	"dijit/TooltipDialog",
	"dojo/i18n!guide/nls/GuideManager.js"
], function (declare, array, lang, win,	domAttr, domClass, domConstruct, domStyle, dom, on, query, popup, TooltipDialog, i18n) {
	
	return declare(TooltipDialog, {
		baseClass: "dojoxGuideTooltipDialog",
		// Default actions available.
		// NB 'action' must be unique.
		actions: [
			{ label: i18n.prev, action: 'prev' },
			{ label: i18n.next, action: 'next' },
			{ label: i18n.ok, action: 'ok' },
			{ label: i18n.cancel, action: 'cancel' }
		],
	
		postCreate: function () {
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
			array.forEach(this.actions, lang.hitch(this, function (action) {
				
				var actNode = this.createActionButton(action);
				domConstruct.place(actNode, this.buttonBar, 'last');

				// handle click on the action, e.g. 'prev' calls this.prev()
				this.own(actNode, on(actNode, 'click', lang.hitch(this, function () {
					// Tell the parent that an action was clicked.
					this.parent.act(action.action);
				})));

				// remember node for later just in case
				this.actionNode[action.action] = actNode;
			}));
		},
		// Default creator - can be overridden
		createActionButton: function (action) {
			return domConstruct.create('span', {
				'class': 'dojoxGuideAction',
				innerHTML: action.label
			});
		},
		// Makes actions visible or invisible
		// e.g. this.set('actions', [ 'prev', 'next'])
		displayActions: function (requiredActions, lastOne) {
			array.forEach(this.actions, lang.hitch(this, function (action) {

				var display = (requiredActions.indexOf(action.action) !== -1);
				if (lastOne && action.notIfLast) {
					display = false;
				}
				if (lastOne && action.alwaysIfLast) {
					display = true;
				}
				domStyle.set(this.actionNode[action.action], 'display',
					display ? 'inline-block':'none');

			}));
		},
		prev: function () {
			
		}
	});
});