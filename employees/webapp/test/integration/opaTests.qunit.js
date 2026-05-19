/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["employees/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
