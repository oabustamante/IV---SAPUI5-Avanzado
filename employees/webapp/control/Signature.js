sap.ui.define([
    "sap/ui/core/Control"
], (Control) => {
    "use strict";

    return Control.extend("employees.controller.Signature", {
        metadata: {
            properties: {
                "width": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "400px"
                },
                "height": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "100px"
                },
                "bgcolor": {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "#FFFFFF"
                }
            }
            /* aggregations: {
                "_signature": { type: "sap.m.Image", multiple: false, visibility: "hidden" }
            } */
        },

        onInit : function () {},

        renderer: function (oRm, oControl) {
            oRm.write("<div");
            //oRm.writeControlData(oControl);
            oRm.addStyle("width", oControl.getProperty("width"));
            oRm.addStyle("height", oControl.getProperty("height"));
            oRm.addStyle("background-color", oControl.getProperty("bgcolor"));
            oRm.addStyle("border", "1px solid #000000");
            oRm.writeStyles();
            oRm.write(">");
            oRm.write("<canvas width='" + oControl.getProperty("width") + "' height='" + oControl.getProperty("height") + "'");
            oRm.write("></canvas>");
            //oRm.renderControl(oControl._signature);
            oRm.write("</div>");
        },

        onAfterRendering: function () {
            let canvas = document.querySelector("canvas");
            try {
                this.signaturePad = new SignaturePad(canvas);

                canvas.addEventListener("mousedown", function () {
                    this.signaturePad.fill = true;      // Se añade una propiedad personalizada para indicar que se está dibujando
                }.bind(this));
            } catch (e) {
                console.error(e);
            }
        },

        clear : function () {
            this.signaturePad.clear();
            this.signaturePad.fill = false;
        },

        isFill: function () {
            return this.signaturePad.fill;
        },

        getSignature : function () {
            return this.signaturePad.toDataURL();
        },

        setSignature : function (signature) {
            this.signaturePad.fromDataURL(signature);
        }


    });

});