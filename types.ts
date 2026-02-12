
export interface InquiryData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  story: string;
  photoEstimate: string;
  intent: string;
  marketSpecific: string;
}

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
