"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = exports.sendClassReminder = exports.sendPaymentReminder = exports.scheduledFirestoreExport = exports.onEvaluationUpdate = exports.processPayment = exports.checkInGeo = exports.sendNewClassNotification = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// Export all functions
var classNotifications_1 = require("./notifications/classNotifications");
Object.defineProperty(exports, "sendNewClassNotification", { enumerable: true, get: function () { return classNotifications_1.sendNewClassNotification; } });
var geoCheckin_1 = require("./checkin/geoCheckin");
Object.defineProperty(exports, "checkInGeo", { enumerable: true, get: function () { return geoCheckin_1.checkInGeo; } });
var paymentProcessor_1 = require("./payments/paymentProcessor");
Object.defineProperty(exports, "processPayment", { enumerable: true, get: function () { return paymentProcessor_1.processPayment; } });
var evaluationProcessor_1 = require("./evaluations/evaluationProcessor");
Object.defineProperty(exports, "onEvaluationUpdate", { enumerable: true, get: function () { return evaluationProcessor_1.onEvaluationUpdate; } });
var firestoreBackup_1 = require("./backup/firestoreBackup");
Object.defineProperty(exports, "scheduledFirestoreExport", { enumerable: true, get: function () { return firestoreBackup_1.scheduledFirestoreExport; } });
var paymentReminders_1 = require("./notifications/paymentReminders");
Object.defineProperty(exports, "sendPaymentReminder", { enumerable: true, get: function () { return paymentReminders_1.sendPaymentReminder; } });
var classReminders_1 = require("./notifications/classReminders");
Object.defineProperty(exports, "sendClassReminder", { enumerable: true, get: function () { return classReminders_1.sendClassReminder; } });
var sendInviteEmail_1 = require("./invites/sendInviteEmail");
Object.defineProperty(exports, "sendInviteEmail", { enumerable: true, get: function () { return sendInviteEmail_1.sendInviteEmail; } });
//# sourceMappingURL=index.js.map