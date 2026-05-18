import { getAllSubjects } from './loadQuizzes';
import type { Course, Topic } from '../types/content';

export interface TopicWithCourse {
  topic: Topic;
  course: Course;
  subjectId: string;
}

/**
 * Walks the subject/course/topic tree and returns a flat list of topics
 * tagged with the course they came from. Sort order matches the JSON, so
 * Chapter 1 → Topic 1 comes first.
 */
export function listTopicsWithCourse(): TopicWithCourse[] {
  const out: TopicWithCourse[] = [];
  for (const subject of getAllSubjects()) {
    for (const course of subject.courses) {
      for (const topic of course.topics) {
        out.push({ subjectId: subject.id, course, topic });
      }
    }
  }
  return out;
}

export function findTopicWithCourse(
  topicId: string,
): TopicWithCourse | undefined {
  return listTopicsWithCourse().find((entry) => entry.topic.id === topicId);
}
