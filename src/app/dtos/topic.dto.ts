export interface TopicDto {
  id: number;
  name: string;
  categoryId: number;
}

export interface CreateTopicDto {
  name: string;
  categoryId: number;
}

export interface UpdateTopicDto {
  name: string;
  categoryId: number;
}
