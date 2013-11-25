/*jshint quotmark:false */
define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom",
	"dojo/window",
	"dojo/_base/json",
	"dojo/query",
	"dijit/popup",
	"./GuidePopupDialog"
], function (declare, array, lang, winBase, domAttr, domClass, domConstruct, domGeom, domStyle, dom, win,
	json, query, popup, GuidePopupDialog) {
	
	return declare(null, {
	// summary:
	//		A manager for on-screen guides, to indicate information about specific
	//		GUI elements to the user by popping up a sequence of informational tooltips.
	//		
	// description:
	//		The GuideManager can be instantiated either programatically or from
	//		markup.
	//
	// example:
	// |	<div data-dojo-type="mydijits/GuideManager">
	// |        <div data-target="something">Content</div>
	// |    </div>
	// |    <div id="something">I will have a guide pop up for me</div>
	//
	// example:
	// |	var guide = new GuideManager({
	// |        steps: [
	// |            { html: 'Content', target: 'something' },
	// |            { html: 'More Content', target: dom.byId('else') }
	// |        ]
	// |    });
	// |	guide.startup();

		// Array(String | Dom Node) - array of target id's for nodes
		targets: undefined,
		// Array(Dom Node) - array of step contents for each step
		//     Must align with targets array
		steps: undefined,
		
		// Boolean: whether we're currently being displayed and are at a step.
		// TODO can we obsolete this since _underlay existence indicates same thing?
		_active: false,
		// Underlay div, only exists and is in the DOM while we are active.
		_underlay: undefined,

		// Array(domnode)
		_stepNodes: undefined,
		
		_defaultOrientation: [ 'before-centered', 'after-centered', 'below-centered', 'above-centered' ],
		
		_PopupClass: GuidePopupDialog,
		
		constructor: function (/*Object*/params, /*DomNode|string*/node) {
			lang.mixin(this, params);
			// If we were created from markup or programatically with a node, we
			//  can just use that node.
			if (node) {
				this.domNode = node;
			} else {
				// We must create a node as somewhere to stash our steps when not in use.
				this.domNode = domConstruct.create('div', {
					'class': 'dojoxGuideManager'
				}, winBase.body(), 'last');
			}
			// Make sure our domNode and its enclosed steps content is invisible
			domStyle.set(this.domNode, 'display', 'none');
		},

		startup: function () {
			this._initSteps();
		},

		_initSteps: function () {
			var self = this;

			/* If we were initialised with a javascript object of steps, create them here.
			 * e.g. new GuideManager({ steps: [
			 *   { html: 'This is a step',      target: 'targetId' },
			 *   { html: 'This is anotherstep', target: nodeRef } ] })
			 */
			if (this.steps && lang.isObject(this.steps)) {
				self._stepNodes = [];
				self.targets = [];
				array.forEach(this.steps, function (stepInfo) {
					// Create a div for this step and stash it under our domNode
					self._stepNodes.push(domConstruct.create('div', {
						innerHTML: stepInfo.html
					}, self.stepContainerNode, 'last'));
					// Remember the target id in a handy array
					self.targets.push(typeof stepInfo.target === 'string' ? dom.byId(stepInfo.target) : stepInfo.target);
				});
			} else {
				/* Presume we are initialising from markup. */

				// Go through this.targets and pick up each step element.
				// These must correspond with the 'ids' array we were constructed with.
				self._stepNodes = [];
				query('>', this.domNode).forEach(function (node) {
					self._stepNodes.push(node);
				});
				
				if (self._stepNodes.length !== self.targets.length) {
					console.error("Number of stepNodes " + self._stepNodes.length +
						" must equal number of targetIds " + self.targetIds.length + "!");
				}
			}
		},
		
		start: function () {
			this._guideNum = 0;
			this.makeActive();
			
			this.showCurrent();
		},
		makeActive: function () {
			if (this._active) {
				return;
			}
			
			// Create an underlay div we will use when necessary
			this._underlay = domConstruct.create('div', {
				'class': 'dojoxGuideUnderlay'
			}, winBase.body(), 'last');
			this._popup = new this._PopupClass({
				'class': 'dojoxGuidePopup',
				parent: this
			});
			this._popup.startup();
			
			domGeom.position(this._underlay, win.getBox);
			
			this._active = true;
		},
		makeInactive: function () {
			if (!this._active) {
				return;
			}

			// Move any current popup contents out, because we're about to destroy the popup.
			var curChildren = this._popup.getChildren();
			if (curChildren && curChildren.length > 0) {
				array.forEach(curChildren, function (node) {
					domConstruct.place(node, this.domNode, 'last');
				});
			}

			// Destroy our on screen presence so we don't consume resources while inactive.
			domConstruct.destroy(this._underlay);
			delete this._underlay;
			this._popup.destroy();
			delete this._popup;
			
			this._active = false;
		},
		
		// showCurrent - hides all but the current step
		// Inactive steps are kept under our domnode, with display: 'none'
		// Active step is placed in our tooltip dialog and arranged next to its
		// target node.
		showCurrent: function () {
			// Hide all steps except the current one
			for (var i = 0 ; i < this._stepNodes.length ; i ++) {
				if (i === this._guideNum) {
//					// If the popup has an addChild function, use it, otherwise
//					//  just plonk the current step in its containerNode
//					if (this._popup.addChild) {
//						this.popup.addChild(this._stepNodes[i]);
//					} else {
//						domConstruct.place(this._stepNodes[i], this._popup.containerNode);
//					}
					domConstruct.place(this._stepNodes[i], this._popup.stepContainerNode);
				} else {
//					// If the popup has a removeChild function, use it.
//					if (this._popup.removeChild) {
//						this.popup.removeChild(this._stepNodes[i]);
//					}
					// Now ensure the step content has been moved
					domConstruct.place(this._stepNodes[i], this.domNode);
				}
			}
			
			// Align the popup over the current target element
			var target = dom.byId(this.targets[this._guideNum]);
			if (target) {
				var stepNode = this._stepNodes[this._guideNum],
					propsStr = domAttr.get(stepNode, 'data-dojo-props'),
					props = (propsStr && propsStr.length > 0) ? json.fromJson("{" + propsStr + "}") : {},
					orientation = (props && props.orientation) ? props.orientation : this._defaultOrientation,
					actions = (props && props.actions) ? props.actions :
						/* Sensible default actions */
						(this._guideNum === 0) ? [ 'next' ] :
						(this._guideNum === (this._stepNodes.length - 1)) ? [ 'ok' ] :
						[ 'prev', 'next' ];
//				if (actions) {
//					actions = json.parse(actions);
//				} else {
//					actions = ;
//				}
				this._popup.displayActions(actions);
				popup.open({
					popup: this._popup,
					around: target,
					orient: orientation
				});
			}
		},
		act: function (action) {
			console.log("Action " + action + " was clicked");
			switch (action) {
			case 'next':
				if (this._guideNum === (this._stepNodes.length - 1)) {
					console.error("Already on last step, cannot go next.");
					return;
				}
				this._guideNum ++;
				this.showCurrent();
				break;
				
			case 'prev':
				if (this._guideNum === 0) {
					console.error("Already on first step, cannot go next.");
					return;
				}
				this._guideNum --;
				this.showCurrent();
				break;
				
			case 'ok':
			case 'cancel':
				// The GuideManager is being dismissed.
				this.makeInactive();
				break;
			}
		}
	});
});