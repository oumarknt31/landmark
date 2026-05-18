"""Reads the shared content directory (lessons + quizzes.json) the React app uses."""

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Topic:
    id: str
    name: str
    course_id: str
    course_name: str
    lesson_id: str | None
    lesson_body: str | None
    question_count: int


@dataclass(frozen=True)
class Question:
    id: str
    topic_id: str
    topic_name: str
    prompt: str
    options: list[str]
    correct_index: int


@dataclass(frozen=True)
class Content:
    topics: list[Topic]
    questions: list[Question]


def load_content(content_dir: Path) -> Content:
    quizzes_path = content_dir / "quizzes.json"
    lessons_dir = content_dir / "lessons"

    with quizzes_path.open(encoding="utf-8") as f:
        data = json.load(f)

    topics: list[Topic] = []
    questions: list[Question] = []

    for subject in data.get("subjects", []):
        for course in subject.get("courses", []):
            for topic in course.get("topics", []):
                lesson_id = topic.get("lessonId")
                lesson_body: str | None = None
                if lesson_id:
                    lesson_path = lessons_dir / f"{lesson_id}.md"
                    if lesson_path.exists():
                        lesson_body = lesson_path.read_text(encoding="utf-8")
                topics.append(
                    Topic(
                        id=topic["id"],
                        name=topic["name"],
                        course_id=course["id"],
                        course_name=course["name"],
                        lesson_id=lesson_id,
                        lesson_body=lesson_body,
                        question_count=len(topic.get("questions", [])),
                    )
                )
                for q in topic.get("questions", []):
                    questions.append(
                        Question(
                            id=q["id"],
                            topic_id=topic["id"],
                            topic_name=topic["name"],
                            prompt=q["prompt"],
                            options=list(q.get("options", [])),
                            correct_index=int(q.get("correctIndex", 0)),
                        )
                    )

    return Content(topics=topics, questions=questions)
