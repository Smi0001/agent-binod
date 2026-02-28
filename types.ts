export interface PR {
  number:  number;
  title:   string;
  author:  string;
  branch:  string | undefined;
  base:    string | undefined;
  created: string | undefined;
  body:    string | null;
}

export interface PRComment {
  author: string;
  body:   string;
  date:   string;
}
