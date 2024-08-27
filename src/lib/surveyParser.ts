import { marked } from 'marked';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox';
  options?: string[];
}

export function parseSurveyQuestions(markdown: string): Question[] {
  const tokens = marked.lexer(markdown);
  const questions: Question[] = [];

  tokens.forEach((token, index) => {
    if (token.type === 'heading' && token.depth === 2) {
      const question: Question = {
        id: `q${index}`,
        text: token.text,
        type: 'text',
        options: [],
      };

      const nextToken = tokens[index + 1];
      if (nextToken && nextToken.type === 'list') {
        question.type = nextToken.ordered ? 'radio' : 'checkbox';
        question.options = nextToken.items.map((item) => item.text);
      }

      questions.push(question);
    }
  });

  return questions;
}