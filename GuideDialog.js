/*jshint quotmark:false */
define([
	"dojo/_base/declare",
	"dijit/Dialog",
	"./_GuidePopupMixin"
], function (declare, Dialog, _GuidePopupMixin) {
	
	return declare([ Dialog, _GuidePopupMixin ], {
		baseClass: "dojoxGuideDialog",
		closeAction: 'close',

		onCancel: function () {
			// Handle the 'x' button being clicked.
			this.parent.act(this.closeAction);
		}
	});
});