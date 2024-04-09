import { GetIndividiualEmployeesInfo } from '../services/hrmart.services';
import { getGTSID } from '../services/associate.services';
export const fetchHRBP = async function(email: string) {
  const gtsid = await getGTSID(email);
  if (!(gtsid && gtsid.gts)) return undefined;
  const userDetails = await GetIndividiualEmployeesInfo(gtsid.gts);
  if (!(userDetails && userDetails.HRBP)) return undefined;
  const hrbpDetails = await GetIndividiualEmployeesInfo(userDetails.HRBP);
  if (!hrbpDetails) return undefined;
  return {
    name: hrbpDetails.Name,
    gtsid: hrbpDetails.EmpID,
    email: hrbpDetails.Emailid
  };
};
export const fetchManager = async function(email: string) {
  const gtsid = await getGTSID(email);
  if (!(gtsid && gtsid.gts)) return undefined;
  const userDetails = await GetIndividiualEmployeesInfo(gtsid.gts);
  if (!(userDetails && userDetails.Manager)) return undefined;
  const managerDetails = await GetIndividiualEmployeesInfo(userDetails.Manager);
  if (!managerDetails) return undefined;
  return {
    name: managerDetails.Name,
    gtsid: managerDetails.EmpID,
    email: managerDetails.Emailid
  };
};
export const fetchTeam = async function(email: string) {
  const gtsid = await getGTSID(email);
  if (!(gtsid && gtsid.gts)) return undefined;
  const userDetails = await GetIndividiualEmployeesInfo(gtsid.gts);
  if (!userDetails) return undefined;
  return {
    TechORG: userDetails.TechORG,
    TechORGLevel2: userDetails.TechORGLevel2,
    TechORGLevel3: userDetails.TechORGLevel3,
    team: userDetails.TechORGLevel3
  };
};
