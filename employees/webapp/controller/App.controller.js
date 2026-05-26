sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (BaseController) => {
    "use strict";

    return BaseController.extend("employees.controller.App", {

        onBeforeRendering: function () {
            this._detailEmployeeView = this.getView().byId("detailEmployee");
        },

        onInit : function () {
            let oJSONModel = new sap.ui.model.json.JSONModel();
            let oView = this.getView();
            let i18nBundle =this.getOwnerComponent().getModel("i18n").getResourceBundle();
            oJSONModel.loadData("./model/json/Employees.json", false);
            oView.setModel(oJSONModel);

            let oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            });
            oView.setModel(oJSONModelConfig, "jsonConfig");

            let oJSONModelLayout = new sap.ui.model.json.JSONModel();
            oJSONModelLayout.loadData("./model/json/Layout.json", false);
            oView.setModel(oJSONModelLayout, "jsonLayout");

            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);    // flexible . showEmployee
            this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);
            
            this._bus.subscribe("incidence", "onDeleteIncidence", function (channelId, eventId, data) {
                let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                this.getView().getModel("incidence").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
                                                            "',SapId='" + data.SapId +
                                                            "',EmployeeId='" + data.EmployeeId + "')", {
                    success: function (data) {
                        this.onReadODataIncidence.bind(this)(data.EmployeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceDeleteOk"));
                    }.bind(this),
                    error: function (error) {
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceErrorDelete"));
                    }.bind(this)
                });
            }, this);
        },

        showEmployeeDetails: function (category, nameEvent, path) {
            let detailView = this.getView().byId("detailEmployee");
            detailView.bindElement("northwind>" + path);
            this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

            let incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel, "incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();

            this.onReadODataIncidence(this._detailEmployeeView.getBindingContext("northwind").getObject().EmployeeID);
        },

        onSaveODataIncidence: function (channelId, eventId, data) {
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            let employeeId = this._detailEmployeeView.getBindingContext("northwind").getObject().EmployeeID;
            let incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

            if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {
                let body = {
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: employeeId.toString(),
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    Type: incidenceModel[data.incidenceRow].Type,
                    Reason: incidenceModel[data.incidenceRow].Reason
                };
                this.getView().getModel("incidence").create("/IncidentsSet", body, {
                    success: function (data) {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceSaved"));
                    }.bind(this),
                    error: function (error) {
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceError"));
                    }.bind(this)
                });
            } else if (incidenceModel[data.incidenceRow].CreationDateX ||
                        incidenceModel[data.incidenceRow].ReasonX ||
                        incidenceModel[data.incidenceRow].TypeX) {
                let body = {
                    CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                    CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                    Type: incidenceModel[data.incidenceRow].Type,
                    TypeX: incidenceModel[data.incidenceRow].TypeX,
                    Reason: incidenceModel[data.incidenceRow].Reason,
                    ReasonX: incidenceModel[data.incidenceRow].ReasonX
                };
                this.getView().getModel("incidence").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                                                            "',SapId='" + incidenceModel[data.incidenceRow].SapId +
                                                            "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                    success: function (data) {
                        this.onReadODataIncidence.bind(this)(employeeId);
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceUpdateOk"));
                    }.bind(this),
                    error: function (error) {
                        sap.m.MessageToast.show(oResourceBundle.getText("incidenceErrorUpdate"));
                    }.bind(this)
                });
            } else {
                sap.m.MessageToast.show(oResourceBundle.getText("incidenceNoChanges"));
            }
        },

        onReadODataIncidence : function (employeeId) {

            this.getView().getModel("incidence").read("/IncidentsSet", {
                filters: [
                    new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                    new sap.ui.model.Filter("EmployeeId", "EQ", employeeId.toString())
                ],
                success: function (data) {
                    let incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                    incidenceModel.setData(data.results);
                    let tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                    tableIncidence.removeAllContent();
                    for (let incidence in data.results) {
                        let newIncidence = new sap.ui.xmlfragment("employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + incidence);
                        tableIncidence.addContent(newIncidence);
                    }
                    
                }.bind(this),
                error: function (error) {
                    sap.m.MessageToast.show(oResourceBundle.getText("incidenceReadError"));
                }
            });
        }
    });
});