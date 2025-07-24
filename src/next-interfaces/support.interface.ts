export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface IEditTicketStatus {
  status: TicketStatus;
  priority?: TicketPriority;
}

export interface IMessageAttachment {
  name: string;
  url: string;
  type: string;
}

export interface ITicketMessage {
  ticketId: string;
  message: string;
  attachments?: IMessageAttachment[];
}

export interface ICreateTicket {
  companyId?: string;
  subject: string;
  category: string;
  message: ITicketMessage;
  priority: TicketPriority;
} 