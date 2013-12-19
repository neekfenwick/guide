/*jshint quotmark:false */
define([
	"dojo/_base/declare",
	"dijit/TooltipDialog",
	"./_GuidePopupMixin"
], function (declare, TooltipDialog, _GuidePopupMixin) {
	
	return declare([ TooltipDialog, _GuidePopupMixin ], {
		baseClass: "dojoxGuideTooltipDialog"
	});
});