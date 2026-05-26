sap.ui.define([
    "employees/controller/BaseController.controller",
    "employees/model/formatter"
],

/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @returns 
 */
(BaseController, formatter) => {
    "use strict";

    function onInit () {
        this._bus = sap.ui.getCore().getEventBus();
    };

    function onCreateIncidence () {
        let tableincidence = this.getView().byId("tableIncidence");
        let newIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", this);
        let incidenceModel = this.getView().getModel("incidenceModel");
        let oData = incidenceModel.getData();
        let index = oData.length;
        oData.push({index : index + 1});
        incidenceModel.refresh();

        //console.log("oData: ", oData);
        newIncidence.bindElement("incidenceModel>/" + index);
        tableincidence.addContent(newIncidence);
    }

    function onDeleteIncidence (oEvent) {
        let contextObject = oEvent.getSource().getBindingContext("incidenceModel").getObject();
        this._bus.publish("incidence", "onDeleteIncidence", {
            IncidenceId : contextObject.IncidenceId,
            SapId : contextObject.SapId,
            EmployeeId : contextObject.EmployeeId
        });
    }

    function onSaveIncidence (oEvent) {
        let incidence = oEvent.getSource().getParent().getParent();
        let incidenceRow = incidence.getBindingContext("incidenceModel");
        this._bus.publish("incidence", "onSaveIncidence", { incidenceRow : incidenceRow.sPath.replace('/', '') });
    }

    function updateIncidenceCreationDate (oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObject = context.getObject();
        contextObject.CreationDateX = true;
    }

    function updateIncidenceReason (oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObject = context.getObject();
        contextObject.ReasonX = true;
    }

    function updateIncidenceType (oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObject = context.getObject();
        contextObject.TypeX = true;
    }

    /* function toOrderDetails (oEvent) {
        let orderID = oEvent.getSource().getBindingContext("northwind").getObject().OrderID;
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteOrderDetails", {OrderID: orderID});
    } */

    let Main = BaseController.extend("employees.controller.Details", {});

    Main.prototype.onInit = onInit;
    Main.prototype.onCreateIncidence = onCreateIncidence;
    Main.prototype.Formatter = formatter;
    Main.prototype.onDeleteIncidence = onDeleteIncidence;
    Main.prototype.onSaveIncidence = onSaveIncidence;
    Main.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
    Main.prototype.updateIncidenceReason = updateIncidenceReason;
    Main.prototype.updateIncidenceType = updateIncidenceType;
    //Main.prototype.toOrderDetails = toOrderDetails;

    return Main;


});