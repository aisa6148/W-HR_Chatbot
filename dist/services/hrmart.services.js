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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmsEmpLeaveCancelApprove = exports.AmsEmpLeaveCancelApply = exports.GetManagerCancelPendingApprovals = exports.GetAllEmployeeDetails = exports.AmsEmpLeaveApprove = exports.AmsEmpLeaveApply = exports.GetEmpLeaveBalance = exports.GetManagerPendingApprovals = exports.GetIndividiualEmployeesInfo = void 0;
const xhr_adapter_1 = require("../utilities/xhr.adapter");
const config_1 = __importDefault(require("../configs/config"));
const hrmart = config_1.default.hrmart;
/**
 * Get employee details
 * @param Empid employee id
 */
exports.GetIndividiualEmployeesInfo = function (Empid) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetIndividiualEmployeesInfo';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.INDIVIDUALEMPLOYEESINFO,
            Empid: Empid,
        };
        const body = yield xhr_adapter_1.xhrRequest(url, options);
        const answer = {};
        const employeeDetails = body.ArrayOfEmpDetailEntity.EmpDetailEntity[0];
        for (const key in employeeDetails) {
            answer[key] = employeeDetails[key][0];
        }
        return answer;
    });
};
/**
 * Manager can approve for leaves
 * @param ApproverID id of the manager to approve for leaves
 */
exports.GetManagerPendingApprovals = function (ApproverID) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetManagerPendingApprovals';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.MANAGERPENDINGAPPROVAL,
            ApproverID: ApproverID,
        };
        const body = yield xhr_adapter_1.xhrRequest(url, options);
        const approvals = body.ArrayOfManagerPendingApprovals.ManagerPendingApprovals;
        const approvallist = [];
        if (approvals != undefined) {
            for (const approval of approvals) {
                const answer = {};
                for (const key in approval) {
                    answer[key] = approval[key][0];
                }
                approvallist.push(answer);
            }
            return approvallist;
        }
        else {
            return undefined;
        }
    });
};
/**
 * Get employees current leave balance
 * @param Empid employee id
 */
exports.GetEmpLeaveBalance = function (Empid) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetEmpLeaveBalance';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.EMPLEAVEBALANCE,
            Empid: Empid,
        };
        const result = yield xhr_adapter_1.xhrRequest(url, options);
        const leaves = result.ArrayOfEmpLeaveBalance.EmpLeaveBalance;
        const leavelist = [];
        leaves.forEach(leave => {
            const answer = {};
            for (const key in leave) {
                answer[key] = leave[key][0];
            }
            leavelist.push(answer);
        });
        return leavelist;
    });
};
/**
 * Apply for a leave
 * @param Empid Employee id of the person applying for leave
 * @param LeaveName 'AL' or 'SL' for annual leave or sick leave
 * @param LeaveFrom Data of the type dd-mmm-yyyy eg 15-oct-2018
 * @param LeaveFromPeriod 'FD', 'FH, 'SH' for full day, first half, second half
 * @param LeaveTo Data of the type dd-mmm-yyyy eg 15-oct-2018
 * @param LeaveToPeriod 'FD', 'FH, 'SH' for full day, first half, second half
 * @param Reason string
 * @param ReqBy 'Employee id or approver id'
 * @param ReqTypeofuser 'A' or 'E' for approver or employee
 */
exports.AmsEmpLeaveApply = function (Empid, LeaveName, LeaveFrom, LeaveFromPeriod, LeaveTo, LeaveToPeriod, Reason, ReqBy, ReqTypeofuser, ReqCareGiver, ReqChild) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveApply';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.EMPLEAVEAPPLY,
            Empid: Empid,
            LeaveName: LeaveName,
            LeaveFrom: LeaveFrom,
            LeaveFromPeriod: LeaveFromPeriod,
            LeaveTo: LeaveTo,
            LeaveToPeriod: LeaveToPeriod,
            Reason: Reason,
            ReqBy: ReqBy,
            ReqTypeofuser: ReqTypeofuser,
            CareGiver: ReqCareGiver,
            Child: ReqChild,
        };
        const body = yield xhr_adapter_1.xhrRequest(url, options);
        const result = body['string']['_'];
        return result;
    });
};
/**
 * Approve or Reject a leave based on requestID
 * @param requestID unique id of leave request
 * @param Status 'A' or 'R' stands for approve of reject
 * @param FutureCreditStatus should be true or false
 * @param AuthorizedStatus should be true or false
 * @param Remarks compulsary if leave is rejected
 * @param AppBy Approver Id
 */
exports.AmsEmpLeaveApprove = (RequestId, Status, FutureCreditStatus, AuthorizedStatus, Remarks, AppBy) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveApprove';
    const options = {
        AppID: config_1.default.hrmartAppID,
        Username: config_1.default.hrmartUserName,
        Password: hrmart.EMPLEAVEAPPROVE,
        RequestId: RequestId,
        Status: Status,
        FutureCreditStatus: FutureCreditStatus,
        AuthorizedStatus: AuthorizedStatus,
        Remarks: Remarks,
        AppBy: AppBy,
    };
    const body = yield xhr_adapter_1.xhrRequest(url, options);
    const result = body['string']['_'];
    return result;
});
/**
 * Get all employee's details
 */
exports.GetAllEmployeeDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.hr-mart.com/services/formulahr_hris.asmx/GetActiveEmployeesInfo';
    const options = {
        AppID: 'AFFLG90NKIUMBCI',
        Username: 'apiadmin',
        Password: hrmart.GETALLEMPDETAILS,
    };
    const body = yield xhr_adapter_1.xhrRequest(url, options);
    const employees = body.ArrayOfEmpActiveDetailEntity.EmpActiveDetailEntity;
    const answer = [];
    employees.forEach(employee => {
        for (const key in employee) {
            employee[key] = employee[key][0];
        }
        answer.push(employee);
    });
    return answer;
});
/**
 * Get Managers pending leave cancellation approvals
 * @param ApproverID id of the manager to approve for leaves
 */
exports.GetManagerCancelPendingApprovals = (ApproverID) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetManagerCancelPendingApprovals';
    const options = {
        AppID: config_1.default.hrmartAppID,
        Username: config_1.default.hrmartUserName,
        Password: hrmart.GETMANAGERCANCELPENDINGAPPROVALS,
        ApproverID: ApproverID,
    };
    const body = yield xhr_adapter_1.xhrRequest(url, options);
    const approvals = body.ArrayOfManagerPendingApprovals.ManagerPendingApprovals;
    const approvalList = [];
    if (approvals != undefined) {
        for (const approval of approvals) {
            const answer = {};
            for (const key in approval) {
                answer[key] = approval[key][0];
            }
            approvalList.push(answer);
        }
    }
    return approvalList;
});
/**
 * Cancel a leave
 * @param RequestID Request Id of the leave
 * @param Remarks Remarks for cancelling leave
 */
exports.AmsEmpLeaveCancelApply = function (RequestId, Remarks) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveCancelApply';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.EMPLEAVECANCELAPPLY,
            RequestId: RequestId,
            Remarks: Remarks,
        };
        const body = yield xhr_adapter_1.xhrRequest(url, options);
        return body['string']['_'];
    });
};
/**
 * Approve or Reject a cancellation request of leave
 * @param RequestID Request Id of the leave
 * @param Status should be 'A' or 'R' representing approve or reject
 * @param Remarks Remarks for cancelling leave
 * @param AppBy Approver Id of the request
 */
exports.AmsEmpLeaveCancelApprove = (RequestId, Status, Remarks, AppBy) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveCancelApply';
    const options = {
        AppID: config_1.default.hrmartAppID,
        Username: config_1.default.hrmartUserName,
        Password: hrmart.EMPLEAVECANCELAPPROVE,
        RequestId: RequestId,
        Status: Status,
        Remarks: Remarks,
        AppBy: AppBy,
    };
    const body = yield xhr_adapter_1.xhrRequest(url, options);
    return body;
});
//# sourceMappingURL=hrmart.services.js.map