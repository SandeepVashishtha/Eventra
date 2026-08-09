import { IncomingMessage, ServerResponse } from 'http';

export interface RegistrationDependencies {
  getEventById?: (eventId: string) => Promise<any>;
  getRegistrationCount?: (eventId: string) => Promise<number>;
  isAlreadyRegistered?: (eventId: string, userId: string) => Promise<boolean>;
  registerAttendee?: (eventId: string, userId: string) => Promise<any>;
  getEventId?: (req: any) => string;
}

export default function registerForEvent(
  req: IncomingMessage & { user?: { id: string | number } },
  res: ServerResponse & { status: (code: number) => any; json: (body: any) => void },
  deps?: RegistrationDependencies
): Promise<void>;
