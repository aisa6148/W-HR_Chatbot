"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTeam = exports.fetchManager = exports.fetchHRBP = void 0;
const hrmart_services_1 = require("../services/hrmart.services");
const associate_services_1 = require("../services/associate.services");
exports.fetchHRBP = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const gtsid = yield associate_services_1.getGTSID(email);
        if (!(gtsid && gtsid.gts))
            return undefined;
        const userDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(gtsid.gts);
        if (!(userDetails && userDetails.HRBP))
            return undefined;
        const hrbpDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(userDetails.HRBP);
        if (!hrbpDetails)
            return undefined;
        return {
            name: hrbpDetails.Name,
            gtsid: hrbpDetails.EmpID,
            email: hrbpDetails.Emailid
        };
    });
};
exports.fetchManager = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const gtsid = yield associate_services_1.getGTSID(email);
        if (!(gtsid && gtsid.gts))
            return undefined;
        const userDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(gtsid.gts);
        if (!(userDetails && userDetails.Manager))
            return undefined;
        const managerDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(userDetails.Manager);
        if (!managerDetails)
            return undefined;
        return {
            name: managerDetails.Name,
            gtsid: managerDetails.EmpID,
            email: managerDetails.Emailid
        };
    });
};
exports.fetchTeam = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const gtsid = yield associate_services_1.getGTSID(email);
        if (!(gtsid && gtsid.gts))
            return undefined;
        const userDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(gtsid.gts);
        if (!userDetails)
            return undefined;
        return {
            TechORG: userDetails.TechORG,
            TechORGLevel2: userDetails.TechORGLevel2,
            TechORGLevel3: userDetails.TechORGLevel3,
            team: userDetails.TechORGLevel3
        };
    });
};
//# sourceMappingURL=hrmart.functions.js.map