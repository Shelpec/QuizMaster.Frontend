export interface TopicDto {
  id: number;
  name: string;
  isSurveyTopic: boolean;
}

export interface CreateTopicDto {
  name: string;
  isSurveyTopic: boolean;
}

export interface UpdateTopicDto {
  name: string;
  isSurveyTopic: boolean;
}
