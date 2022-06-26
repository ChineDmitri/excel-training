export class ResponseAuth {
  isAuth: boolean;
  message: string;
}

export class ResponseMessageOnly {
  status?: boolean;
  message: string;
}

/* FOR is_Reponse/N/ type number because in MySQL boolean is tinyint */
export class OneQuestion {
  id: number;
  description: string;
  img: string;
  response1: string;
  is_response1: number;
  response2: string;
  is_response2: number;
  response3: string;
  is_response3: number;
  response4: string;
  is_response4: number;
  response5: string;
  is_response5: number;
  good_response: string;
  video_response: string;
}
