/*jshint quotmark:false */
define([
	"dojo/_base/declare",
	"dijit/Dialog",
	"./_GuidePopupMixin"
], function (declare, Dialog, _GuidePopupMixin) {
	
	return declare([ Dialog, _GuidePopupMixin ], {
		baseClass: "dojoxGuideDialog"
	});
});