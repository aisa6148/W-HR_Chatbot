import { xhrRequest } from '../utilities/xhr.adapter';
import config from '../configs/config';
const hrmart = config.hrmart;
/**
 * Get employee details
 * @param Empid employee id
 */
export const GetIndividiualEmployeesInfo = async function(Empid: string) {
	const url =
		'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetIndividiualEmployeesInfo';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.INDIVIDUALEMPLOYEESINFO,
		Empid: Empid,
	};
	const body = await xhrRequest(url, options);

	const answer: { [index: string]: any } = {};
	const employeeDetails = body.ArrayOfEmpDetailEntity.EmpDetailEntity[0];
	for (const key in employeeDetails) {
		answer[key] = employeeDetails[key][0];
	}
	return answer;
};

/**
 * Manager can approve for leaves
 * @param ApproverID id of the manager to approve for leaves
 */
export const GetManagerPendingApprovals = async function(ApproverID: string) {
	const url =
		'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetManagerPendingApprovals';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.MANAGERPENDINGAPPROVAL,
		ApproverID: ApproverID,
	};
	const body = await xhrRequest(url, options);

	const approvals = body.ArrayOfManagerPendingApprovals.ManagerPendingApprovals;
	const approvallist = [];
	if (approvals != undefined) {
		for (const approval of approvals) {
			const answer: { [index: string]: any } = {};
			for (const key in approval) {
				answer[key] = approval[key][0];
			}
			approvallist.push(answer);
		}
		return approvallist;
	} else {
		return undefined;
	}
};

/**
 * Get employees current leave balance
 * @param Empid employee id
 */
export const GetEmpLeaveBalance = async function(Empid: string) {
	const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetEmpLeaveBalance';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.EMPLEAVEBALANCE,
		Empid: Empid,
	};
	const result = await xhrRequest(url, options);

	const leaves: { [index: string]: any }[] = result.ArrayOfEmpLeaveBalance.EmpLeaveBalance;
	const leavelist: any[] = [];
	leaves.forEach(leave => {
		const answer: { [index: string]: any } = {};
		for (const key in leave) {
			answer[key] = leave[key][0];
		}
		leavelist.push(answer);
	});
	return leavelist;
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
export const AmsEmpLeaveApply = async function(
	Empid: string,
	LeaveName: string,
	LeaveFrom: string,
	LeaveFromPeriod: string,
	LeaveTo: string,
	LeaveToPeriod: string,
	Reason: string,
	ReqBy: string,
	ReqTypeofuser: string,
	ReqCareGiver: string,
	ReqChild: string,
) {
	const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveApply';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
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
	const body = await xhrRequest(url, options);
	const result = body['string']['_'];
	return result;
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
export const AmsEmpLeaveApprove = async (
	RequestId: string,
	Status: string,
	FutureCreditStatus: string,
	AuthorizedStatus: Boolean,
	Remarks: string,
	AppBy: string,
) => {
	const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveApprove';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.EMPLEAVEAPPROVE,
		RequestId: RequestId,
		Status: Status,
		FutureCreditStatus: FutureCreditStatus,
		AuthorizedStatus: AuthorizedStatus,
		Remarks: Remarks,
		AppBy: AppBy,
	};
	const body = await xhrRequest(url, options);
	const result = body['string']['_'];
	return result;
};

/**
 * Get all employee's details
 */
export const GetAllEmployeeDetails = async () => {
	const url = 'https://www.hr-mart.com/services/formulahr_hris.asmx/GetActiveEmployeesInfo';
	const options = {
		AppID: 'AFFLG90NKIUMBCI',
		Username: 'apiadmin',
		Password: hrmart.GETALLEMPDETAILS,
	};
	const body = await xhrRequest(url, options);
	const employees: { [index: string]: any }[] =
		body.ArrayOfEmpActiveDetailEntity.EmpActiveDetailEntity;
	const answer: any[] = [];
	employees.forEach(employee => {
		for (const key in employee) {
			employee[key] = employee[key][0];
		}
		answer.push(employee);
	});
	return answer;
};

/**
 * Get Managers pending leave cancellation approvals
 * @param ApproverID id of the manager to approve for leaves
 */
export const GetManagerCancelPendingApprovals = async (ApproverID: string) => {
	const url =
		'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetManagerCancelPendingApprovals';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.GETMANAGERCANCELPENDINGAPPROVALS,
		ApproverID: ApproverID,
	};
	const body = await xhrRequest(url, options);

	const approvals = body.ArrayOfManagerPendingApprovals.ManagerPendingApprovals;
	const approvalList = [];
	if (approvals != undefined) {
		for (const approval of approvals) {
			const answer: { [index: string]: any } = {};
			for (const key in approval) {
				answer[key] = approval[key][0];
			}
			approvalList.push(answer);
		}
	}
	return approvalList;
};

/**
 * Cancel a leave
 * @param RequestID Request Id of the leave
 * @param Remarks Remarks for cancelling leave
 */
export const AmsEmpLeaveCancelApply = async function(RequestId: string, Remarks: string) {
	const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveCancelApply';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.EMPLEAVECANCELAPPLY,
		RequestId: RequestId,
		Remarks: Remarks,
	};
	const body = await xhrRequest(url, options);
	return body['string']['_'];
};

/**
 * Approve or Reject a cancellation request of leave
 * @param RequestID Request Id of the leave
 * @param Status should be 'A' or 'R' representing approve or reject
 * @param Remarks Remarks for cancelling leave
 * @param AppBy Approver Id of the request
 */
export const AmsEmpLeaveCancelApprove = async (
	RequestId: string,
	Status: string,
	Remarks: string,
	AppBy: string,
) => {
	const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/AmsEmpLeaveCancelApply';
	const options = {
		AppID: config.hrmartAppID,
		Username: config.hrmartUserName,
		Password: hrmart.EMPLEAVECANCELAPPROVE,
		RequestId: RequestId,
		Status: Status,
		Remarks: Remarks,
		AppBy: AppBy,
	};
	const body = await xhrRequest(url, options);
	return body;
};
