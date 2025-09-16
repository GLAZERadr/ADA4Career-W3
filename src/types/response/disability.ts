interface Answer {
  question: string;
  answer: string;
}

export interface DisabilityResponse {
  id: string;
  email: string;
  answers: Answer[];
}
