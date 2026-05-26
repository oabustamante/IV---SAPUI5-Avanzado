sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],

/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.core.routing.History} History 
 * @param {typeof sap.m.MessageBox} MessageBox 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 */

(Controller, History, MessageBox, Filter, FilterOperator) => {
    "use strict";

    function _onObjectMatched(oEvent) {
        this.onClearSignature();
        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "northwind",
            events: {
                dataReceived: function (oData) {
                    _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                }.bind(this)
            }
        });

        const objectContext = this.getView().getModel("northwind").getContext("/Orders(" + oEvent.getParameter("arguments").OrderID + ")").getObject();

        if (objectContext) {
            _readSignature.bind(this)(objectContext.OrderID, objectContext.EmployeeID);
        }
    }

    function _readSignature(orderId, employeeId) {
        // Read signature image
        this.getView().getModel("incidence").read(
            "/SignatureSet(OrderId='" + orderId +
            "',SapId='" + this.getOwnerComponent().SapId +
            "',EmployeeId='" + employeeId + "')", {
            success: function (data) {
                if (data.MediaContent !== "") {
                    const signature = this.getView().byId("signature");
                    signature.setSignature("data:image/png;base64," + data.MediaContent);
                }
            }.bind(this),
            error: function (oError) {
                if (oError.statusCode === 404) {
                    this.byId("signature").clear();
                }
            }.bind(this)
        });

        // Bind attachments
        this.getView().byId("uploadCollection").bindAggregation("items", {
            path: "incidence>/FilesSet",
            filters: [
                new Filter("OrderId", FilterOperator.EQ, orderId),
                new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                new Filter("EmployeeId", FilterOperator.EQ, employeeId)
            ],
            template: new sap.m.UploadCollectionItem({
                documentId: "{incidence>AttId}",
                visibleEdit: false,
                fileName: "{incidence>FileName}",
            }).attachPress(this.downloadFile)
        });
    }

    return Controller.extend("employees.webapp.controller.OrderDetails", {

        onInit : function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
        },

        onNavBack : function (oEvent) {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", {}, true);
            }
        },

        onClearSignature: function (oEvent) {
            let signature = this.byId("signature");
            signature.clear();
        },

        factoryOrderDetails : function (listId, oContext) {
            let contextObject = oContext.getObject();
            contextObject.Currency = "EUR";
            let unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if (contextObject.Quantity <= unitsInStock) {
                let objectListItem = new sap.m.ObjectListItem({
                    title : "{northwind>/Products(" + contextObject.ProductID + ")/ProductName} ({northwind>Quantity})",
                    number : "{parts: [ {path: 'northwind>UnitPrice'}, {path: 'northwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
                    numberUnit: "{northwind>Currency}"
                });
                return objectListItem;
            } else {
                let customListItem = new sap.m.CustomListItem({
                    content: [
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{northwind>/Products(" + contextObject.ProductID + ")/ProductName} ({northwind>Quantity})"}),
                            contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {northwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error" }),
                            contentRight: new sap.m.Label({ text: "{parts: [ {path: 'northwind>UnitPrice'}, {path: 'northwind>Currency'}], type: 'sap.ui.model.type.Currency'}" })
                        })
                    ]
                });
                return customListItem;
            }
        },

        onSaveSignature : function (oEvent) {
            const signature = this.byId("signature");
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            let signaturePng;

            if (!signature.isFill()) {
                MessageBox.error(oResourceBundle.getText("fillSignature"));
            } else {
                signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
                let objectOrder = oEvent.getSource().getBindingContext("northwind").getObject();

                let body = {
                    OrderId: objectOrder.OrderID.toString(),
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: objectOrder.EmployeeID.toString(),
                    MimeType: 'image/png',
                    MediaContent: signaturePng
                };

                this.getView().getModel("incidence").create("/SignatureSet", body, {
                    success: function () {
                        MessageBox.information(oResourceBundle.getText("signatureSaved"));
                    },
                    error: function (oError) {
                        MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                    }
                });
            }
        },
// >> Files
        onFileBeforeUpload : function (oEvent) {
            let fileName = oEvent.getParameter("fileName");
            let objectContext = oEvent.getSource().getBindingContext("northwind").getObject();
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: objectContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objectContext.EmployeeID + ";" + fileName
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },

        onFileChange : function (oEvent) {
            let oUploadCollection = oEvent.getSource();
            // Header token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("incidence").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onFileUploadComplete : function (oEvent) {
            oEvent.getSource().getBinding("items").refresh();
        },

        onFileDeleted : function (oEvent) {
            let oUploadCollection = oEvent.getSource();
            let sPath = oEvent.getParameter("item").getBindingContext("incidence").getPath();
            this.getView().getModel("incidence").remove(sPath, {
                success: function () {
                    //MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("fileDeleted"));
                    oUploadCollection.getBinding("items").refresh();
                }.bind(this),
                error: function () {
                    //MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("fileNotDeleted"));
                }
            });
        },

        downloadFile : function (oEvent) {
            const sPath = oEvent.getSource().getBindingContext("incidence").getPath();
            window.open("/employees/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
        }
    });
});