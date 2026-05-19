sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("employees.controller.Base", {

        onInit : function () {
            //
        },

        toOrderDetails : function (oEvent) {
            let orderID = oEvent.getSource().getBindingContext("northwind").getObject().OrderID;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrderDetails", {
                OrderID: orderID
            });
        }
    });
});