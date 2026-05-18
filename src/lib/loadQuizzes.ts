import quizzesJson from '../content/quizzes.json';

import type { Course, Question, QuizzesData, Subject, Topic } from '../types/content';

// The extractor script guarantees each question has exactly 4 options and a
// correctIndex in 0..3; this cast is the boundary where we trust that.
const data = quizzesJson as unknown as QuizzesData;

export function getAllSubjects(): Subject[] {
  return data.subjects;
}

export function findSubject(subjectId: string): Subject | undefined {
  return data.subjects.find((s) => s.id === subjectId);
}

export function findCourse(
  subjectId: string,
  courseId: string,
): Course | undefined {
  return findSubject(subjectId)?.courses.find((c) => c.id === courseId);
}

export function findTopic(
  subjectId: string,
  courseId: string,
  topicId: string,
): Topic | undefined {
  return findCourse(subjectId, courseId)?.topics.find((t) => t.id === topicId);
}

export function findTopicById(topicId: string): Topic | undefined {
  for (const subject of data.subjects) {
    for (const course of subject.courses) {
      const topic = course.topics.find((t) => t.id === topicId);
      if (topic) return topic;
    }
  }
  return undefined;
}

let questionToTopicCache: Map<string, string> | null = null;

export function getTopicIdForQuestion(questionId: string): string | undefined {
  if (!questionToTopicCache) {
    questionToTopicCache = new Map();
    for (const subject of data.subjects) {
      for (const course of subject.courses) {
        for (const topic of course.topics) {
          for (const question of topic.questions) {
            questionToTopicCache.set(question.id, topic.id);
          }
        }
      }
    }
  }
  return questionToTopicCache.get(questionId);
}

export function getAllQuestionsWithTopic(): { topicId: string; question: Question }[] {
  const out: { topicId: string; question: Question }[] = [];
  for (const subject of data.subjects) {
    for (const course of subject.courses) {
      for (const topic of course.topics) {
        for (const question of topic.questions) {
          out.push({ topicId: topic.id, question });
        }
      }
    }
  }
  return out;
}
