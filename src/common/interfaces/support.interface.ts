enum TicketStatus {
    OPEN="OPEN",
    IN_PROGRESS="IN_PROGRESS",
    CLOSED="CLOSED"
  }

enum TicketPriority {
    LOW="LOW",
    MEDIUM="MEDIUM",
    HIGH="HIGH"
  }
  
export interface Ticket {
    id: string;
    userId: string;
    subject: string;
    message: string;
    status: TicketStatus;
    priority: TicketPriority;
    isActivate: boolean;
    createdAt: Date;
    updatedAt: Date;
    messages: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    message: string;
    fromStaff: boolean;
}
