export interface IBirthdayNotification {
  emails: string[];
  name: string;
  team: any;
  channel: string;
}

export interface IBirthdayAssociate {
  email: string;
  name: string;
  team: string;
  managerId: string;
  empId: string;
}

export interface IBirthdayNeighbors {
  email: string;
  name: string;
}

export interface IWorkAnniversaryNotification {
  email: string;
  name: string;
  hireDate: number;
}
