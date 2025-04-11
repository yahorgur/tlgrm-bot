export interface RequestBodySchema {
  message: {
    from: {
      username: string;
    };
    text: string;
    chat: {
      id: number;
    };
  };
  update_id: string;
}

export interface Supabase {
  from: Function;
}

export interface PublicMessage {
  id: number;
  author: string;
  chat_id: number;
  message: string;
  update_id: number;
  created_at: string;
}
