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
  update_id: number;
}

export interface Supabase {
  from: Function;
}
