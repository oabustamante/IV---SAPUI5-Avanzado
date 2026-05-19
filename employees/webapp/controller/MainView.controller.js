sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "employees/controller/BaseController.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],

/**
 * 
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 */

(BaseController, Filter, FilterOperator) => {
    "use strict";

    function onInit () {
        /* let oJSONModel = new sap.ui.model.json.JSONModel();
        let oView = this.getView();
        let i18nBundle =this.getOwnerComponent().getModel("i18n").getResourceBundle();
        oJSONModel.loadData("../localService/Employees.json", false); */
        /* oJSONModel.attachRequestCompleted(function (oEventModel) {
            console.log(JSONModel.stringfy(oJSONModel.getData()));
        }) */
        /* oView.setModel(oJSONModel);

        let oJSONModelConfig = new sap.ui.model.json.JSONModel({
            visibleID: true,
            visibleName: true,
            visibleCountry: true,
            visibleBtnShowCity: true,
            visibleBtnHideCity: false
        });
        oView.setModel(oJSONModelConfig, "jsonConfig"); */

        this._bus = sap.ui.getCore().getEventBus();
    }

    function onFilter () {
        let oJSON = this.getView().getModel().getData();
        let filters = [];

        if (oJSON.EmployeeId !== "") {
            //filters.push(new sap.ui.model.Filter("EmployeeId", sap.ui.model.FilterOperator.Contains, oJSON.EmployeeId));
            filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSON.EmployeeId));
        }
        if (oJSON.CountryKey !== "") {
            filters.push(new Filter("Country", FilterOperator.EQ, oJSON.CountryKey));
        }
        let oList = this.getView().byId("tableEmployees");
        let oBinding = oList.getBinding("items");
        oBinding.filter(filters);
    }

    function onClearFilter () {
        let oModel = this.getView().getModel();
        oModel.setProperty("/EmployeeId", "");
        oModel.setProperty("/CountryKey", "");

    }

    function onShowPostalCode (oEvent) {
        /* let oItem = oEvent.getParameter("listItem");
        let oContext = oItem.getBindingContext("northwind");
        let postalCode = oContext.getProperty("PostalCode");
        sap.m.MessageToast.show(postalCode); */
        let itemPressed = oEvent.getSource();
        let oContext = itemPressed.getBindingContext("northwind");
        let objectContext = oContext.getObject();

        sap.m.MessageToast.show(objectContext.PostalCode);
    }

    function onShowCity () {
        let oJSONModelConfig = this.getView().getModel("jsonConfig");
        oJSONModelConfig.setProperty("/visibleCity", true);
        oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
        oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
    }

    function onHideCity () {
        let oJSONModelConfig = this.getView().getModel("jsonConfig");
        oJSONModelConfig.setProperty("/visibleCity", false);
        oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
        oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
    }

    /* function onShowOrders (oEvent) {
        let ordersTable = this.getView().byId("ordersTable");
        ordersTable.destroyItems();
        //ordersTable.removeAllItems();
        let itemPressed = oEvent.getSource();
        let oContext = itemPressed.getBindingContext("northwind");
        let objectContext = oContext.getObject();
        let orders = objectContext.Orders;
        let orderItems = [];

        //console.log(orders);
        //
        for (let i in orders) {
            //console.log(orders[i].OrderID);
            orderItems.push(new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Label({text: orders[i].OrderID}),
                    new sap.m.Label({text: orders[i].Freight}),
                    new sap.m.Label({text: orders[i].ShipName})
                ]
            }));
        }

        //console.log(orderItems)

        let newTable = new sap.m.Table({
            width: "auto",
            columns: [
                new sap.m.Column({
                    header: new sap.m.Label({text: "{i18n>OrderID}"})
                }),
                new sap.m.Column({
                    header: new sap.m.Label({text: "{i18n>Freight}"})
                }),
                new sap.m.Column({
                    header: new sap.m.Label({text: "{i18n>ShipName}"})
                })
            ],
            items: orderItems
        }).addStyleClass("sapUiSmallMargin");;

        ordersTable.addItem(newTable);

        let newTableJSON = new sap.m.Table();
        newTableJSON.setWidth("auto");
        newTableJSON.addStyleClass("sapUiSmallMargin");

        let columnOrderID = new sap.m.Column();
        let labelOrderID = new sap.m.Label();
        labelOrderID.bindProperty("text", "i18n>OrderID");
        columnOrderID.setHeader(labelOrderID);
        newTableJSON.addColumn(columnOrderID);

        let columnShipAddress = new sap.m.Column();
        let labelShipAddress = new sap.m.Label();
        labelShipAddress.bindProperty("text", "i18n>ShipAddress");
        columnShipAddress.setHeader(labelShipAddress);
        newTableJSON.addColumn(columnShipAddress);

        let columnListItem = new sap.m.ColumnListItem();

        let cellOrderID = new sap.m.Label();
        cellOrderID.bindProperty("text", "OrderID");
        columnListItem.addCell(cellOrderID);
        
        let cellFright = new sap.m.Label();
        cellFright.bindProperty("text", "Freight");
        columnListItem.addCell(cellFright);
        
        let cellShipAddress = new sap.m.Label();
        cellShipAddress.bindProperty("text", "ShipAddress");
        columnListItem.addCell(cellShipAddress);

        let oBindingInfo = {
            model: "northwind",
            path: "Orders",
            template: columnListItem
        };
        newTableJSON.bindAggregation("items", oBindingInfo);
        newTableJSON.bindElement("northwind>" + oContext.getPath());
    } */

    function onShowOrders (oEvent) {
        // get selected order
        let iconPressed = oEvent.getSource();

        // context from model
        //let oContext = iconPressed.getBindingContext("northwind>/Employees");
        let oContext = iconPressed.getBindingContext("northwind");

//console.log("oContext.getObject():", oContext.getObject());

        if (!this._oDialogOrders) {
            this._oDialogOrders = sap.ui.xmlfragment("employees.fragment.DialogOrders", this);
            this.getView().addDependent(this._oDialogOrders);
        }
        // Dialog binding to the context to have access to the data of selected item
        //console.log("path: ", oContext.getPath());
        this._oDialogOrders.bindElement("northwind>" + oContext.getPath());
        this._oDialogOrders.open();
    }

    function onCloseOrders () {
        this._oDialogOrders.close();
    }
    
    function showEmployee (oEvent) {
        //console.log("MainView.showEmployee()");
        let path = oEvent.getSource().getBindingContext("northwind").getPath();
        this._bus.publish("flexible", "showEmployee", path);
        //this._bus.publish("flexible", "showEmployee", path);
    }

    /* function toOrderDetails (oEvent) {
        let orderID = oEvent.getSource().getBindingContext("northwind").getObject().OrderID;
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteOrderDetails", {OrderID: orderID});
    } */

    
    let Main = BaseController.extend("employees.controller.MainView", {});

    Main.prototype.onValidate = function () {
        let inputEmployee = this.byId("inputEmployee");
        let valueEmployee = inputEmployee.getValue();

        if (valueEmployee.length === 6) {
            //inputEmployee.setDescription("OK");
            this.getView().byId("labelCountry").setVisible(true);
            this.getView().byId("slCountry").setVisible(true);
        } else {
            //inputEmployee.setDescription("Not OK");
            this.getView().byId("labelCountry").setVisible(false);
            this.getView().byId("slCountry").setVisible(false);
        }
    }

    Main.prototype.onInit = onInit;
    Main.prototype.onFilter = onFilter;
    Main.prototype.onClearFilter = onClearFilter;
    Main.prototype.showPostalCode = onShowPostalCode;
    Main.prototype.onShowCity = onShowCity;
    Main.prototype.onHideCity = onHideCity;
    Main.prototype.onShowOrders = onShowOrders;
    Main.prototype.onCloseOrders = onCloseOrders;
    Main.prototype.showEmployee = showEmployee;
    //Main.prototype.toOrderDetails = toOrderDetails;


    return Main;
});