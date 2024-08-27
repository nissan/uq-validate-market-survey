import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/use-toast';

type QuestionType = 'text' | 'yesno' | 'truefalse' | 'single' | 'multiple';

interface Question {
  text: string;
  type: QuestionType;
  options?: string[];
}

export function CreateSurvey() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ text: '', type: 'text' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    if (currentQuestion.text.trim() === '') {
      toast({
        title: 'Error',
        description: 'Question text cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({ text: '', type: 'text' });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (title.trim() === '' || questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Survey title and at least one question are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting survey:', { title, description, questions });
      const { data, error } = await supabase
        .from('surveys')
        .insert({ title, description, questions });

      if (error) throw error;
      console.log('Survey created successfully:', data);
      toast({
        title: 'Success',
        description: 'Survey created successfully',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error creating survey:', error);
      toast({
        title: 'Error',
        description: 'Failed to create survey. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-indigo-700">Create New Survey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Textarea
          placeholder="Survey Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <div>
          <h3 className="font-bold text-lg text-indigo-700 mb-2">Questions</h3>
          {questions.map((q, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
              <p className="font-semibold">{q.text}</p>
              <p className="text-sm text-gray-600">Type: {q.type}</p>
              {q.options && <p className="text-sm text-gray-600">Options: {q.options.join(', ')}</p>}
            </div>
          ))}
        </div>
        <Input
          placeholder="Question Text"
          value={currentQuestion.text}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Select
          value={currentQuestion.type}
          onValueChange={(value: QuestionType) => setCurrentQuestion({ ...currentQuestion, type: value })}
        >
          <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="yesno">Yes/No</SelectItem>
            <SelectItem value="truefalse">True/False</SelectItem>
            <SelectItem value="single">Single Choice</SelectItem>
            <SelectItem value="multiple">Multiple Choice</SelectItem>
          </SelectContent>
        </Select>
        {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && (
          <Textarea
            placeholder="Options (one per line)"
            value={currentQuestion.options?.join('\n') || ''}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, options: e.target.value.split('\n').filter(Boolean) })}
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        )}
        <Button onClick={addQuestion} className="bg-green-600 hover:bg-green-700 text-white">Add Question</Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          {isSubmitting ? 'Creating Survey...' : 'Create Survey'}
        </Button>
      </CardFooter>
    </Card>
  );
}