import { Suspense, lazy, type ReactElement } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import RootLayout from './components/layout/RootLayout';
import NotFoundPage from './pages/NotFoundPage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const DrillPage = lazy(() => import('./pages/DrillPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const LessonsPage = lazy(() => import('./pages/LessonsPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizzesPage = lazy(() => import('./pages/QuizzesPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-[65ch] px-6 py-24 text-sm text-[var(--color-muted)]">
      Loading…
    </div>
  );
}

function withSuspense(node: ReactElement) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/about', element: withSuspense(<AboutPage />) },
      { path: '/progress', element: withSuspense(<ProgressPage />) },
      { path: '/drill', element: withSuspense(<DrillPage />) },
      { path: '/quizzes', element: withSuspense(<QuizzesPage />) },
      { path: '/lessons', element: withSuspense(<LessonsPage />) },
      { path: '/quiz/:topicId', element: withSuspense(<QuizPage />) },
      { path: '/lesson/:topicId', element: withSuspense(<LessonPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
